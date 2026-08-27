# Epic `ACT` — Server Actions (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §4

> **임계 경로 4건이 이 Epic에 있다** — FR-019 → FR-020 → FR-021 → FR-022. 39일 중 21일이 여기서 소비된다.
>
> 공통 제약: `TEC-ACT-001` 예외를 던지지 않고 `ActionResult<T>` 반환 · `TEC-ACT-003` 입력을 **서버에서 재검증** · `TEC-ACT-004` 소유권 검증을 진입 직후

---

## FR-019 — Server Action 공통 기반 (`ActionResult<T>` · 소유권 가드)

**labels:** `feature, part:backend, epic:ACT, complexity:M, wave:W5, critical-path`

### 🎯 Summary
모든 Server Action이 공유할 결과 타입과 소유권 검증 가드를 만든다. **H 4건의 선행**이라 병합하지 않고 단독으로 두었다.

### 🔗 References
- SRS-002 §4.3 `TEC-ACT-001` · `TEC-ACT-003` · `TEC-ACT-004`
- SRS-002 §5.3 `TEC-DB-015` — RLS와 **이중화**

### ✅ Task Breakdown
- [ ] `ActionResult<T>` 판별 유니온 정의 — `{ok:true, data}` | `{ok:false, errorId, message, retryable}`
- [ ] `errorId`를 선행 SRS §15의 논리 오류 식별자와 매핑
- [ ] 소유권 검증 가드 — Action 진입 **직후** 수행 (`TEC-ACT-004`)
- [ ] 입력 재검증 유틸 (`TEC-ACT-003` — 클라이언트 검증 결과를 신뢰하지 않는다)
- [ ] 모든 Action이 가드를 통과하도록 강제하는 래퍼 또는 린트 룰

### 🧪 Acceptance Criteria
**Scenario 1 — 실패가 예외가 아니라 값으로 온다**
- Given: 처리 실패 상황에서
- When: Server Action을 호출하면
- Then: 예외가 아니라 `{ok:false, errorId, retryable}`이 반환된다

**Scenario 2 (실패 흐름) — 타인 계좌 요청이 거부된다**
- Given: 고객 A의 세션으로 고객 B의 `accountId`를 보내면
- When: Action이 실행되면
- Then: **진입 직후 거부**되고 어떤 데이터도 반환되지 않는다

**Scenario 3 (실패 흐름) — 클라이언트 검증만으로 통과하지 않는다**
- Given: 클라이언트에서 검증을 우회하고 잘못된 입력을 직접 전송하면
- When: Action이 실행되면
- Then: **서버 재검증에서 거부된다**

### ⚙️ Constraints
- `TEC-ACT-003` — Server Action은 함수처럼 보이지만 실제로는 **누구나 호출 가능한 POST 엔드포인트**다. 클라이언트 검증을 신뢰하면 안 된다
- RLS(FR-007)와 이중화가 요구사항이다. **어느 한쪽만으로 충분하다고 판단하지 않는다**

### 🏁 DoD
- [ ] `ActionResult<T>` 전 Action 적용
- [ ] 소유권 가드 우회 불가 확인
- [ ] 실패 흐름 3건 시험 통과

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001 · FR-007
- **Blocks:** FR-020 · FR-021 · FR-023 · FR-025
- ⚠️ **임계 경로.**

---

## FR-020 — `requestId` 멱등 처리 공통 모듈

**labels:** `feature, part:backend, epic:ACT, complexity:H, wave:W6, critical-path`

### 🎯 Summary
같은 요청이 두 번 와도 한 번만 처리되게 한다. **멱등성이 없으면 이체가 두 번 나간다.**

### 🔗 References
- SRS-002 §4.3 `TEC-ACT-002` — 상태 변경 Action은 `requestId`를 필수 인자로 (`SRS-IDEM-005`)
- SRS-002 §5.3 `TEC-DB-014` — DB 유니크 제약
- PRD v3.1 §8.7 멱등 규칙 ID-1~5

### ✅ Task Breakdown
- [ ] `requestId` 기록 및 조회 구조 구현
- [ ] 이미 처리된 `requestId`면 **최초 결과를 그대로 반환** (재처리 금지)
- [ ] 동시 도착 시 경합 처리 — DB 유니크 제약을 경계로 사용
- [ ] 상태 변경 Action이 `requestId` 없이 호출되면 컴파일 또는 런타임 거부
- [ ] 보존 기간 및 정리 정책

### 🧪 Acceptance Criteria
**Scenario 1 — 두 번 눌러도 한 건**
- Given: 동일 `requestId`로 전송 요청을 두 번 보내면
- When: 두 번째가 도착하면
- Then: **새로 처리되지 않고 최초 결과가 그대로 반환된다.** 신청은 1건이다

**Scenario 2 — 동시 도착도 한 건**
- Given: 동일 `requestId` 요청 2건이 거의 동시에 도착하면
- When: 둘 다 처리를 시도하면
- Then: 하나만 성공하고 다른 하나는 최초 결과를 반환한다 (DB 유니크 제약이 경계)

**Scenario 3 (실패 흐름) — `requestId` 누락 거부**
- Given: 상태 변경 Action을 `requestId` 없이 호출하면
- When: 실행되면
- Then: **거부된다** (`TEC-ACT-002`)

### ⚙️ Constraints
- 멱등 판정을 **애플리케이션 조건 분기로만** 두지 않는다. 동시성 하에서 깨진다
- ⚠️ 읽기 전용 Action(FR-023·FR-025)은 이 모듈에 의존하지 않는다 — 불필요한 결합을 만들지 않는다

### 🏁 DoD
- [ ] 중복·동시·누락 3개 시나리오 시험 통과
- [ ] 상태 변경 Action 전건에 `requestId` 필수 적용 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-005 · FR-019
- **Blocks:** FR-021 · FR-053
- ⚠️ **임계 경로.**

---

## FR-021 — `saveDraft` (예약 저장 · 3그룹 판정 · 밴드 산출)

**labels:** `feature, part:backend, epic:ACT, complexity:H, wave:W7, critical-path`

### 🎯 Summary
이관 예약을 저장하고, 보유 종목을 3그룹으로 판정하며, 완료 밴드를 산출한다. **`SRS-FR-019` — 병목 종목은 서버가 지목한다.** 클라이언트는 결과만 받는다.

### 🔗 References
- SRS-002 §4.2 `saveDraft` · §10 Impact (`SRS-FR-019` 병목 서버 지목)
- SRS-002 §2.2 계층 책임 — 표현 계층의 밴드·세액 계산 금지

### ✅ Task Breakdown
- [ ] 입력 검증 및 소유권 확인 (FR-019 가드)
- [ ] 마이데이터로 보유 종목 조회 (FR-017)
- [ ] **3그룹 판정** — `TRANSFERABLE` / `LIQUIDATION_REQUIRED` / `UNDETERMINED`
- [ ] 밴드 산출 (FR-012) 및 `LockWindow` 저장
- [ ] `transferId` 발급 및 `DRAFT` 상태 생성
- [ ] 병목 종목 지목 — **서버에서만 산출**

### 🧪 Acceptance Criteria
**Scenario 1 — 예약이 저장되고 밴드가 나온다**
- Given: 유효한 계좌와 `requestId`로
- When: `saveDraft`를 호출하면
- Then: `transferId` · 3그룹 판정 · 밴드(두 값)가 반환되고 상태가 `DRAFT`가 된다

**Scenario 2 — 재호출이 중복 생성하지 않는다**
- Given: 동일 `requestId`로 다시 호출하면
- When: 처리되면
- Then: 새 `transferId`가 생기지 않고 최초 결과가 반환된다

### ⚙️ Constraints
- 병목 종목 산출은 **Server Component / Server Action 내부에서만** (§10 Impact)
- 밴드는 두 값으로 반환. 단일 날짜 반환 금지
- `TEC-ACT-002` — `requestId` 필수

### 🏁 DoD
- [ ] 3그룹 판정 시험 통과
- [ ] 밴드 두 값 반환 확인
- [ ] 멱등 재호출 시험 통과

### 🚧 Dependencies & Blockers
- **Depends on:** FR-012 · FR-017 · FR-019 · FR-020
- **Blocks:** FR-022 · FR-024 · FR-040
- ⚠️ **임계 경로.**

---

## FR-022 — `submitTransfer` (전송 확정 + 감사 로그 원자 트랜잭션)

**labels:** `feature, part:backend, epic:ACT, complexity:H, wave:W8, critical-path, blocked`

### 🎯 Summary
전송을 확정한다. **감사 로그 적재와 상태 전이가 하나의 트랜잭션**이며, 로그가 실패하면 전송도 취소된다. 전송은 법적으로 전자적 의사표시라 기록 없이 성립시키면 회사가 방어 수단을 잃는다.

### 🔗 References
- SRS-002 §4.2 `submitTransfer` · §4.3 시그니처 규약 · §4.4 트랜잭션 경계
- SRS-002 §4.4 `TEC-TX-001~003` · §10 Impact (`SRS-FR-028`·`029`)
- SRS-002 §11 OPEN-TEC-007 — 본인 인증 수단

### ✅ Task Breakdown
- [ ] ⛔ **선결:** 본인 인증 수단 확정 → `authResult` 규격 결정 (OPEN-TEC-007)
- [ ] `assertTransition(status, 'RECEIVED')` — 금지 전이 차단 (FR-013)
- [ ] `AuditLog` 적재 — `pressedAt` · `authMethod` · **`shownBandFrom`·`shownBandTo`**
- [ ] `Transfer` 상태 전이 — `where`에 현재 상태 포함 (`TEC-TX-003` 낙관적 동시성)
- [ ] `TradingWindow`를 `SELL_ONLY`로 갱신
- [ ] **외부 전문 송신·알림은 트랜잭션 밖** (`TEC-TX-002`)

### 🧪 Acceptance Criteria
**Scenario 1 — 전송이 확정된다**
- Given: `DRAFT` 상태의 `transferId`와 인증 결과, 화면 표시 밴드로
- When: `submitTransfer`를 호출하면
- Then: 상태가 `RECEIVED`가 되고 감사 로그가 적재되며 매매창이 `SELL_ONLY`가 된다

**Scenario 2 (실패 흐름) — 로그 실패 시 전송이 취소된다**
- Given: 감사 로그 적재가 실패하는 상황에서
- When: 트랜잭션이 실행되면
- Then: **상태 변경도 롤백되고** 고객에게 재시도 안내가 반환된다 (`SRS-FR-029`)

**Scenario 3 — 화면 표시값이 보존된다**
- Given: 고객이 본 밴드가 `shownBand`로 전달되면
- When: 감사 로그가 적재되면
- Then: **서버 재산출값이 아니라 화면 표시값**이 기록된다 (`SRS-FR-028`)

**Scenario 4 (실패 흐름) — 외부 실패가 상태를 오염시키지 않는다**
- Given: 전문 송신 또는 알림이 실패해도
- When: 트랜잭션이 이미 커밋되었으면
- Then: 상태는 `RECEIVED`로 유지된다 (`SRS-ERR-006`)

### ⚙️ Constraints
- `TEC-TX-001` — 감사 로그와 상태 전이는 **동일 트랜잭션**
- `TEC-TX-002` — 외부 호출은 트랜잭션 **밖**
- `TEC-TX-003` — `where`에 현재 상태 포함
- `TEC-TX-004` — 트랜잭션 시간은 서버리스 실행 한도 내
- ⚠️ **`shownBand`는 클라이언트가 보낸 값을 그대로 기록한다.** 서버 재산출값으로 대체하면 "고객이 실제로 본 값"이 아니게 되어 분쟁 시 증거 가치를 잃는다

### 🏁 DoD
- [ ] OPEN-TEC-007 해제 확인
- [ ] 실패 흐름 3건 전부 시험 통과 (로그 실패 롤백 · 표시값 보존 · 외부 실패 무해)
- [ ] 낙관적 동시성 시험 통과

### 🚧 Dependencies & Blockers
- **Depends on:** FR-006 · FR-013 · FR-021
- **Blocks:** FR-052
- ⛔ **차단 태스크이자 임계 경로의 종점.** 답변 기한 — 표준안 D+34 / 압축안 D+34.

---

## FR-023 — `simulateWithdrawal` (층별 차감 · 세액 모의계산)

**labels:** `feature, part:backend, epic:ACT, complexity:H, wave:W6`

### 🎯 Summary
인출액에 대한 3층 차감과 세액을 계산한다. **어떤 쓰기도 하지 않는다** (`TEC-ACT-005`).

### 🔗 References
- SRS-002 §4.2 · `TEC-ACT-005` · §9.3 CONFLICT-03 (클라이언트 동시 실행)

### ✅ Task Breakdown
- [ ] 인출순서(FR-010)·세액(FR-011) 도메인 모듈 조합
- [ ] 재원 잔액·한도·세율을 조회해 계산 입력 구성
- [ ] **세율표 버전을 응답에 포함** (`TEC-CALC-002`)
- [ ] 세율 신선도 판정 — **서버 전용** (`TEC-CALC-004`)
- [ ] 쓰기 경로가 존재하지 않음을 보장

### 🧪 Acceptance Criteria
**Scenario 1 — 층별 차감과 세액이 나온다**
- Given: 계좌와 인출액, 인출 사유로
- When: 호출하면
- Then: 층별 차감액과 세액이 원 단위로 반환되고 세율표 버전이 포함된다

**Scenario 2 (실패 흐름) — 세율이 오래되면 차단된다**
- Given: 세율표가 D+30을 초과한 상태에서
- When: 호출하면
- Then: **계산 결과 대신 차단 신호가 반환된다** (`SRS-FR-098`)

### ⚙️ Constraints
- `TEC-ACT-005` — **어떤 쓰기도 수행하지 않아야 한다**
- `TEC-CALC-004` — 세율 신선도 판정은 서버에서만. 클라이언트 캐시 세율로 판정하면 `SRS-FR-098` 위반

### 🏁 DoD
- [ ] 쓰기 부재 확인 (시험으로 DB 변경 0건 검증)
- [ ] 세율표 버전 반환 확인
- [ ] D+30 차단 시험 통과

### 🚧 Dependencies & Blockers
- **Depends on:** FR-010 · FR-011 · FR-019
- **Blocks:** FR-025 · FR-047

---

## FR-024 — 예약 갱신 · 취소 액션 (`updateDraft` · `cancelTransfer`)

**labels:** `feature, part:backend, epic:ACT, complexity:M, wave:W8`

### 🎯 Summary
`lib/actions/transfer.ts`의 나머지 상태 변경 액션 2종. 같은 파일·같은 패턴이라 하나로 묶었다.

### 🔗 References
- SRS-002 §4.2 `updateDraft` · `cancelTransfer` · §4.4 트랜잭션 경계

### ✅ Task Breakdown
- [ ] `updateDraft` — 예약 갱신 및 밴드 재산출
- [ ] `cancelTransfer` — 취소 및 상태 전이
- [ ] 두 액션 모두 `assertTransition`으로 금지 전이 차단
- [ ] `requestId` 멱등 처리 적용
- [ ] 낙관적 동시성 — `where`에 현재 상태 포함

### 🧪 Acceptance Criteria
**Scenario 1 — 갱신 시 밴드가 재산출된다**
- Given: `DRAFT` 상태의 예약에 대해
- When: `updateDraft`를 호출하면
- Then: 밴드가 재산출되어 반환된다

**Scenario 2 (실패 흐름) — 취소 불가 상태에서 거부**
- Given: 취소가 허용되지 않는 상태에서
- When: `cancelTransfer`를 호출하면
- Then: **금지 전이로 거부된다**

**Scenario 3 — 동시 취소가 한 번만 반영된다**
- Given: 취소 요청 2건이 동시에 도착하면
- When: 처리되면
- Then: 하나만 상태를 바꾸고 다른 하나는 최초 결과를 반환한다

### ⚙️ Constraints
- `TEC-TX-003` — 동시 전이 차단
- `TEC-ACT-002` — `requestId` 필수

### 🏁 DoD
- [ ] 액션 2종 시험 통과
- [ ] 금지 전이 거부 시험 통과
- [ ] 동시성 시험 통과

### 🚧 Dependencies & Blockers
- **Depends on:** FR-013 · FR-021
- **Blocks:** None

---

## FR-025 — 읽기 전용 조회 액션 (`getPensionLimit` · `compareWithCertificate`)

**labels:** `feature, part:backend, epic:ACT, complexity:M, wave:W7`

### 🎯 Summary
`lib/actions/withdrawal.ts`의 읽기 전용 액션 2종. **쓰기 금지가 요구사항**이라 멱등 모듈(FR-020)에 의존하지 않는다.

### 🔗 References
- SRS-002 §4.2 `getPensionLimit` · `compareWithCertificate` · `TEC-ACT-005`

### ✅ Task Breakdown
- [ ] `getPensionLimit` — 한도·잔여·산출 근거 반환
- [ ] `compareWithCertificate` — 확인서 제출 전/후 세액 비교
- [ ] 두 액션 모두 쓰기 경로 부재 보장
- [ ] 소유권 가드 적용

### 🧪 Acceptance Criteria
**Scenario 1 — 한도와 근거가 함께 온다**
- Given: 계좌 식별자로
- When: `getPensionLimit`을 호출하면
- Then: 한도·잔여와 **산출 근거**가 반환된다

**Scenario 2 — 제출 전/후가 비교된다**
- Given: 계좌와 인출액으로
- When: `compareWithCertificate`를 호출하면
- Then: 확인서 제출 전 세액과 후 세액이 함께 반환된다 (검증 데이터셋 기준 465,960원 / 355,080원)

**Scenario 3 — DB가 변경되지 않는다**
- Given: 두 액션을 각각 호출한 뒤
- When: DB 변경 이력을 확인하면
- Then: **변경 0건**

### ⚙️ Constraints
- `TEC-ACT-005` — 어떤 쓰기도 수행하지 않아야 한다
- 근거 표기는 **매핑표 기반**. 생성형 문구 변환 금지 (SRS-002 §7.3)

### 🏁 DoD
- [ ] 쓰기 부재 시험 통과
- [ ] 검증 데이터셋 세액 비교 일치
- [ ] 소유권 가드 적용 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-009 · FR-019 · FR-023
- **Blocks:** FR-046 · FR-048
