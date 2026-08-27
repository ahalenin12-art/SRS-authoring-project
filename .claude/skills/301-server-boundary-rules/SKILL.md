---
name: 301-server-boundary-rules
description: 연금플러스의 서버 로직을 Server Action과 Route Handler 중 어디에 놓을지 판정하고, 트랜잭션 경계와 멱등 처리 규약을 강제한다. 서버 코드를 새로 만들거나 상태를 변경하는 로직을 작성할 때 반드시 확인한다.
---

# 서버 경계 규칙

## 언제 쓰는가

- 새 서버 로직을 어디에 놓을지 정할 때
- 상태를 변경하는 기능을 만들 때
- 트랜잭션을 걸어야 할지 판단할 때
- 외부 시스템을 호출할 때

## 왜 있는가

C-TEC-002는 **두 수단만** 허용한다 — Server Actions와 Route Handlers. 둘 다 "서버에서 도는 코드"라 개발자마다 다르게 고를 수 있고, **기준이 없으면 비슷한 기능이 서로 다른 방식으로 구현되면서 보안 처리가 빠지는 자리가 생긴다.**

그래서 SRS §4.1이 판정 기준을 고정했다. **판단이 필요한 자리를 미리 없앤 것이다.**

---

## 판정 기준 — 이 표로만 결정한다

| 조건 | 선택 | 이유 |
| --- | --- | --- |
| 고객 세션이 있고 **화면에서** 호출 | **Server Action** | 세션·CSRF가 프레임워크에서 처리됨 |
| 외부·내부 **시스템**이 호출 | **Route Handler** | 세션이 없고 별도 인증이 필요 |
| **Cron**이 호출 | **Route Handler** | 세션 없음 |
| 응답을 **다른 시스템이 파싱** | **Route Handler** | 구조화된 응답 계약 필요 |
| 화면 **재검증**(revalidate)이 필요 | **Server Action** | `revalidatePath` 사용 가능 |

### 확정된 목록 — 여기서 벗어나면 SRS 변경이다

**Server Action 7개** (§4.2)

| Action | 파일 | 상태 변경 |
| --- | --- | :---: |
| `saveDraft` · `updateDraft` · `submitTransfer` · `cancelTransfer` | `lib/actions/transfer.ts` | **Y** |
| `getPensionLimit` · `simulateWithdrawal` · `compareWithCertificate` | `lib/actions/withdrawal.ts` | **N** |

**Route Handler 7개** (§3.2 · §3.3)

| 경로 | 호출자 |
| --- | --- |
| `/api/internal/trading-window` | 주문 시스템 |
| `/api/internal/stage-events` | 예탁원 중계 |
| `/api/internal/settlement` | 원장 연계 |
| `/api/cron/band-recalc` · `settlement-check` · `tax-freshness` · `reconcile` | Vercel Cron |

---

## Server Action 규약

| ID | 규약 |
| --- | --- |
| `TEC-ACT-001` | 예외를 던지지 않고 **`ActionResult<T>` 판별 유니온**을 반환한다 |
| `TEC-ACT-002` | **상태를 변경하는 Action은 `requestId` 필수** |
| `TEC-ACT-003` | 입력을 **서버에서 재검증**한다. 클라이언트 검증을 신뢰하지 않는다 |
| `TEC-ACT-004` | **계좌 소유권 검증을 진입 직후** 수행한다 |
| `TEC-ACT-005` | `simulateWithdrawal`·`getPensionLimit`·`compareWithCertificate`는 **어떤 쓰기도 하지 않는다** |

```ts
type ActionResult<T> =
  | { ok: true;  data: T }
  | { ok: false; errorId: string; message: string; retryable: boolean }
```

> **`TEC-ACT-003`이 왜 있는가.** Server Action은 함수 호출처럼 보이지만 실제로는 **숨겨진 POST 엔드포인트**다. 프레임워크가 빌드 시점에 ID를 부여하고 네트워크를 탄다. 즉 **누구든 그 엔드포인트를 직접 때릴 수 있다.** 함수처럼 생겼다고 안전한 게 아니다.

---

## 트랜잭션 경계

| ID | 규약 |
| --- | --- |
| `TEC-TX-001` | **감사 로그 적재와 상태 전이는 동일 트랜잭션** |
| `TEC-TX-002` | **외부 호출(전문 송신·알림)은 트랜잭션 밖.** 외부 실패가 상태를 오염시키지 않아야 한다 |
| `TEC-TX-003` | 상태 전이 시 `where`에 **현재 상태를 포함**해 동시 전이를 차단 |
| `TEC-TX-004` | 트랜잭션 수행 시간은 서버리스 실행 한도 내 |

```ts
await prisma.$transaction(async (tx) => {
  const t = await tx.transfer.findUniqueOrThrow({ where: { id: transferId } })
  assertTransition(t.status, 'RECEIVED')          // 금지 전이 차단

  await tx.auditLog.create({ data: {              // 실패 시 전체 롤백
    transferId, pressedAt, authMethod,
    shownBandFrom, shownBandTo,                   // 화면 표시값 — 서버 재산출값 아님
  }})

  await tx.transfer.update({
    where: { id: transferId, status: 'DRAFT' },    // 낙관적 동시성
    data: { status: 'RECEIVED', submittedAt: new Date() },
  })
})
// 외부 전문 송신·알림은 여기 — 실패해도 상태는 유지
```

### `TEC-TX-001`이 왜 이렇게 강한가

전송은 법적으로 **전자적 의사표시**다. 기록 없이 의사표시만 성립시키면 회사가 방어 수단을 잃는다.

완료가 늦어져 분쟁이 생기면 필요한 건 **"그 시점에 화면에 무엇이 표시됐는가"** 다. 밴드 값은 이후 재계산으로 계속 바뀌므로, **고객이 실제로 본 값**을 그때 남겨두지 않으면 증명할 방법이 없다.

> **그래서 `shownBand`는 클라이언트가 보낸 값을 그대로 기록한다.** 서버 재산출값으로 대체하면 "그 순간의 값"이지 "고객이 본 값"이 아니게 되어 증거 가치를 잃는다. `TEC-ACT-003`(클라이언트 입력 불신)의 **의도된 예외**다.

---

## 멱등 처리 — 상태를 바꾸는 모든 기능

**멱등성이 없으면 이체가 두 번 나간다.**

| 상황 | 멱등성 없으면 |
| --- | --- |
| 고객이 버튼 두 번 누름 | 신청 2건 |
| 네트워크 끊김 후 앱이 자동 재전송 | 신청 2건 |
| 중계망이 같은 전문 재전송 | 상태가 두 단계 건너뜀 |
| Cron 중복 실행 | 밴드 값이 흔들림 |

### 반드시 물어야 하는 네 질문

상태를 바꾸는 기능을 만들 때 **전부 답이 있어야 한다.**

1. **두 번 오면?** — `requestId` 기반 멱등 처리 (`TEC-ACT-002`)
2. **순서가 뒤바뀌어 오면?** — `messageSeq` 기준 처리
3. **동시에 오면 누가 이기나?** — `where`에 현재 상태 포함 (`TEC-TX-003`)
4. **안 오면 언제까지 기다리나?** — 타임아웃·폴백 정의

**답이 없는 칸이 곧 사고 지점이다.**

### 멱등 판정을 코드 분기에만 두지 않는다

동시성 하에서 깨진다. **DB 유니크 제약이 경계다.**

```prisma
model StageEvent {
  @@unique([transferId, stageNo, messageSeq])   // TEC-DB-014
}
```

중복이 오면 애플리케이션이 분기하는 게 아니라 **DB가 저장을 거부**하고, 그걸 중복으로 판단해 최초 결과를 반환한다.

---

## 실패 방향 — 안전한 쪽으로

**매매창 판정**(`/api/internal/trading-window`)이 응답하지 못하면 **`LOCKED`로 강등**된다.

| 방향 | 결과 |
| --- | --- |
| 막혔는데 열렸다고 응답 | **회복 불가.** 주문이 나가버린다 |
| 열렸는데 막혔다고 응답 | 고객이 다시 시도하면 됨 |

**설계가 의도적으로 후자를 골랐다.** 이 방향을 바꾸지 않는다.

> 다만 정상 주문 거부는 **가드레일 지표**(일간 ≤ 0.1%)를 소진한다. 초과하면 즉시 롤백이 발동한다. 그래서 FR-050 실측이 출시 게이트다.

---

## 위반을 발견했을 때

1. 판정표(§4.1)에 비춰 어느 수단이어야 하는지 확정한다
2. 상태를 바꾸는데 `requestId`가 없으면 **멈춘다**
3. 감사 로그와 상태 전이가 다른 트랜잭션이면 **멈춘다**
4. 외부 호출이 트랜잭션 안에 있으면 **밖으로 뺀다**
