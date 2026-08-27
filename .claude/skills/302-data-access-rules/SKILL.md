---
name: 302-data-access-rules
description: 연금플러스의 Prisma 스키마·물리 제약·도메인 모듈 격리 규약을 강제한다. DB 스키마를 만들거나 바꿀 때, 쿼리를 작성할 때, 법정 계산 로직을 다룰 때 반드시 확인한다.
---

# 데이터 접근 규칙

## 언제 쓰는가

- Prisma 스키마를 만들거나 변경할 때
- 마이그레이션을 작성할 때
- 금액·날짜를 계산하는 코드를 쓸 때
- `lib/domain/` 아래 파일을 건드릴 때
- 고객 데이터를 조회할 때

## 왜 있는가

**규칙을 문서에 적고 리뷰로 확인하는 방식은 6개월 뒤 깨진다.** 새 사람이 오거나, 급한 수정이 들어가거나, 아무도 기억하지 못할 때.

그래서 SRS §5는 논리 규칙을 **DB 제약과 타입으로 내려** 위반 자체가 실패하게 만들었다. 이 스킬은 그 장치를 무력화하지 않기 위해 있다.

---

## 도메인 모듈 격리 — 가장 중요한 규약

`lib/domain/*`은 **I/O가 없는 순수 TypeScript**다.

| ID | 규약 |
| --- | --- |
| `TEC-DOM-001` | **`lib/domain/*`은 Prisma Client를 import하지 않는다** |
| `TEC-DOM-002` | 순수 함수여야 한다. `Date.now()` 등 **비결정적 호출을 인자로 받는다** |
| `TEC-DOM-003` | **금액은 `Decimal`.** `number`(부동소수) 연산 금지 |
| `TEC-DOM-004` | 검증 데이터셋 6건이 **단위 시험으로 자동 검증**되어야 한다 |

### 대상 파일 8종

```
lib/domain/
├── pension-limit.ts      연금수령한도 (시행령 §40의2)
├── withdrawal-order.ts   3층 재원 인출순서 (시행령 §40의3)
├── tax.ts                세액 산출
├── band.ts               완료일 밴드
├── business-day.ts       영업일 · Cut-off
├── trading-window.ts     매매 가능 판정
└── state-machine.ts      상태 전이 판정
```

### 왜 격리하는가 — 두 가지 이유

**① 검증 데이터셋 6건이 원 단위로 일치해야 한다.** I/O가 섞이면 이 회귀 시험을 매 릴리스 자동으로 돌릴 수 없다.

**② 같은 코드를 클라이언트에서도 실행한다.** §9.3의 해법이다 — 인출액 슬라이더를 움직일 때마다 서버에 다녀오면 p95 300ms를 못 지킨다.

```ts
// lib/domain/pension-limit.ts — 순수 함수
import { Decimal } from 'decimal.js'

export function calcPensionLimit(input: {
  evalAmountAtPeriodStart: Decimal
  paymentYear: number
  withdrawnThisYear: Decimal
  unavoidableWithdrawn: Decimal    // 한도 미산입
}): { limit: Decimal | null; remaining: Decimal | null; noLimit: boolean } {
  if (input.paymentYear >= 11) {
    return { limit: null, remaining: null, noLimit: true }
  }
  const limit = input.evalAmountAtPeriodStart.div(11 - input.paymentYear).mul(1.2)
  const consumed = input.withdrawnThisYear.minus(input.unavoidableWithdrawn)
  return { limit, remaining: limit.minus(consumed), noLimit: false }
}
```

**Prisma를 import하고 싶어지면 잘못 설계한 것이다.** 필요한 데이터는 호출자(Server Action)가 조회해 인자로 넘긴다.

---

## 금액 계산 — `Decimal` 전용

**부동소수 연산은 금지다.** `SRS-NFR-REL-011`이 검증 데이터셋의 **원 단위 일치**를 요구한다.

| 값 | 기대 |
| --- | ---: |
| 한도 | 12,600,000원 |
| 잔여 한도 | 10,600,000원 |
| 세액 (기본) | 465,960원 |
| 세액 (확인서 후) | 355,080원 |
| 세액 (부득이한 사유) | 378,840원 |

**1원이라도 다르면 시험 실패이고 배포가 막힌다** (`TEC-OPS-003`).

- 스키마의 금액 필드는 `Decimal`. `Float` 금지
- 비교는 `Decimal` 동등 비교. `===`로 부동소수 비교 금지
- 법정 산식이다. **추정·AI 적용 금지** (→ `300-tech-constraints-guardrails`)

---

## 스키마 규약

| ID | 규약 |
| --- | --- |
| `TEC-DB-001` | 로컬과 배포는 **동일한 Prisma 스키마**. 환경별 분기 금지 |
| `TEC-DB-002` | 배포 환경 접속은 **커넥션 풀러 경유** 필수 |
| `TEC-DB-003` | 마이그레이션은 **Prisma Migrate로만**. 수동 DDL 금지 |
| `TEC-DB-004` | 상태 전이 시 **낙관적 동시성 제어** 적용 |

### 커넥션 — 전역 싱글턴

서버리스 함수는 인스턴스마다 커넥션을 연다. 동시 실행이 늘면 PostgreSQL 한도를 초과한다 (§9.4).

```ts
// lib/db/prisma.ts — 개발 시 HMR 커넥션 폭증 방지
const g = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = g.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') g.prisma = prisma
```

`DATABASE_URL`은 **풀러**, `DIRECT_URL`은 **마이그레이션 직결**이다. 바꿔 쓰지 않는다.

---

## 물리 제약 — 코드가 아니라 DB가 막는다

| ID | 요구 | 구현 |
| --- | --- | --- |
| `TEC-DB-010` | 밴드 폭 2영업일 미만 저장 불가 | CHECK + 앱 검증 (영업일 판정은 앱) |
| `TEC-DB-011` | `endBandFrom ≤ endBandTo` | `CHECK (end_band_from <= end_band_to)` |
| `TEC-DB-012` | 금액·잔액 음수 불가 | `CHECK (... >= 0)` |
| `TEC-DB-013` | **감사 로그 UPDATE·DELETE 불가** (WORM) | 권한 회수 + 트리거 |
| `TEC-DB-014` | 전문 멱등 키 중복 차단 | `@@unique([transferId, stageNo, messageSeq])` |
| `TEC-DB-015` | 본인 계좌만 접근 | **RLS + 앱 검증 이중화** |

```sql
-- 감사 로그 WORM (TEC-DB-013)
REVOKE UPDATE, DELETE ON "AuditLog" FROM app_role;

CREATE OR REPLACE FUNCTION block_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only';
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
  BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION block_audit_mutation();
```

**이 제약을 우회하는 마이그레이션을 작성하지 않는다.** 감사 로그가 고쳐지지 않았다는 것 자체가 분쟁 시 증거다.

---

## 밴드 — 단일 완료일 컬럼을 만들지 않는다

`LockWindow`는 **두 컬럼**으로 밴드를 표현한다.

```prisma
model LockWindow {
  endBandFrom  DateTime @db.Date    // 단일 완료일 컬럼을 두지 않는다
  endBandTo    DateTime @db.Date
  cachedOn     DateTime @db.Date    // 당일 캐시 (SRS-FR-037)
}
```

**`endDate` 같은 컬럼을 추가하지 않는다.** 스키마 단계에서 밴드 위반을 원천 차단하는 설계다. 화면 쪽 대응 규약은 → `303-display-rules`

`cachedOn`은 **같은 날 밴드 값이 흔들리지 않게** 하는 장치다 (`SRS-FR-037`). 배치가 이 컬럼으로 멱등성을 얻는다.

---

## 소유권 검증 — 이중화가 요구사항이다

| 층 | 수단 |
| --- | --- |
| DB | Supabase RLS 정책 |
| 애플리케이션 | Server Action 진입 직후 검증 (`TEC-ACT-004`) |

> **어느 한쪽만으로 충분하다고 판단하지 않는다.** Server Action은 서비스 롤로 접속하므로 RLS만으로는 부족하다. 반대로 앱 검증만 두면 직접 DB 접근 경로에서 뚫린다. **`SRS-SEC-002`는 두 층 모두를 요구한다.**

---

## 상태 전이 — 금지 전이도 시험한다

`state-machine.ts`는 허용 전이 **16종(T-01~T-16)** 과 **금지 전이 5종**을 다룬다.

```ts
assertTransition(currentStatus, nextStatus)   // 위반 시 예외
```

**허용 전이만 시험하면 절반만 검증한 것이다.** 금지 전이 5종 각각에 "시도하면 거부되는지" 시험 케이스가 있어야 한다 — 총 **21건**.

> 예: `COMPLETED` → 진행 중 상태로 되돌리기. 고객에게 이미 "끝났습니다"를 알린 뒤이므로 **회복 불가 사고**다.

---

## 위반을 발견했을 때

1. `lib/domain/`에 Prisma import가 있으면 → **멈추고 호출자로 옮긴다**
2. 금액에 `number`·`Float`가 있으면 → **`Decimal`로 바꾼다**
3. 물리 제약을 없애는 마이그레이션이면 → **멈추고 사람에게 확인**
4. 단일 완료일 컬럼을 추가하려 하면 → **멈춘다**
5. 소유권 검증을 한 층만 두려 하면 → **둘 다 넣는다**
