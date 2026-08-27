# Epic `DAT` — Data Layer (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §5

> **이 Epic이 임계 경로의 최대 구간이다.** FR-005 → FR-007이 12일로, 39일 중 31%를 차지한다. 스키마 확정이 늦으면 Server Action·화면·배치가 전부 밀린다.

---

## FR-005 — Prisma 스키마 모델 16종 정의

**labels:** `feature, part:backend, epic:DAT, complexity:H, wave:W3, critical-path`

### 🎯 Summary
SRS-002 §5.2가 명세한 16개 모델과 관계를 실체화한다. Server Action·화면·배치가 전부 이 스키마를 참조하므로, **여기서 틀리면 뒤가 전부 틀린다.**

### 🔗 References
- SRS-002 §5.2 Prisma 스키마 (모델 16종)
- SRS-002 §10 Impact — `SRS-FR-037` 당일 캐시 = `LockWindow.cachedOn`
- PRD v3.1 §9 데이터

### ✅ Task Breakdown
- [ ] 모델 16종 정의 — `Account` `FundSourceBalance` `Transfer` `LockWindow` `TradingWindow` `StageEvent` `AuditLog` `WithdrawalRequest` `TaxRateConfig` `SettleDaysDict` 외
- [ ] `LockWindow` — `endBandFrom`·`endBandTo` 두 컬럼으로 밴드 표현. **단일 완료일 컬럼을 두지 않는다** (CON-T-05)
- [ ] `LockWindow.cachedOn` — 당일 캐시 컬럼 (`SRS-FR-037`)
- [ ] `StageEvent` — `transferId`·`stageNo`·`messageSeq` 필드 (FR-006의 멱등 유니크 대상)
- [ ] `AuditLog` — 화면 표시값 보존 필드 (`shownBandFrom`·`shownBandTo`·`pressedAt`·`authMethod`)
- [ ] 금액 필드를 `Decimal`로 선언 (`TEC-DOM-003` 정합)
- [ ] 관계 및 인덱스 정의

### 🧪 Acceptance Criteria
**Scenario 1 — 마이그레이션이 적용된다**
- Given: 정의된 스키마로
- When: `prisma migrate dev`를 실행하면
- Then: 16개 테이블이 생성되고 관계 제약이 적용된다

**Scenario 2 (구조 방어) — 단일 완료일 컬럼이 존재하지 않는다**
- Given: 생성된 `LockWindow` 테이블에서
- When: 컬럼 목록을 조회하면
- Then: `endDate` 같은 **단일 날짜 컬럼이 없어야 한다.** 밴드는 두 컬럼으로만 표현된다

### ⚙️ Constraints
- 금액은 `Decimal`. `Float`·`number` 금지 (`SRS-NFR-REL-011` 원 단위 일치)
- 단일 완료일 컬럼 금지 — 스키마 단계에서 밴드 위반을 원천 차단한다
- ⚠️ 마이그레이션 되돌리기가 어렵다. **관계 정의를 확정한 뒤 한 번에 적용**한다

### 🏁 DoD
- [ ] 16개 모델 마이그레이션 성공
- [ ] 금액 필드 전건 `Decimal` 확인
- [ ] 단일 완료일 컬럼 부재 확인
- [ ] ERD 문서([design/02-erd.md](../design/02_ERD.md))와 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-003
- **Blocks:** FR-006 · FR-007 · FR-020 · FR-033 · FR-038 · FR-041
- ⚠️ **임계 경로.** 직접 후행 6건 · 전이 후행 19건.

---

## FR-006 — 마이그레이션 SQL: 스키마 레벨 제약

**labels:** `feature, part:backend, epic:DAT, complexity:M, wave:W4`

### 🎯 Summary
Prisma만으로 표현할 수 없는 논리 제약을 SQL로 강제한다. **규칙을 코드가 아니라 DB에 새겨, 개발자가 실수해도 위반이 저장되지 않게 한다.**

### 🔗 References
- SRS-002 §5.3 스키마 레벨 제약 강제 — `TEC-DB-010` ~ `TEC-DB-014`
- SRS-002 §10 Impact — `SRS-SEC-012` 감사 로그 불변 · `SRS-IDEM-001` 멱등 키

### ✅ Task Breakdown
- [ ] `CHECK (end_band_from <= end_band_to)` — 밴드 순서 (`TEC-DB-011`)
- [ ] `CHECK (... >= 0)` — 재원 잔액·금액 음수 금지 (`TEC-DB-012`)
- [ ] 밴드 폭 2영업일 미만 저장 차단 — CHECK + 애플리케이션 검증 (`TEC-DB-010`, 영업일 판정은 앱에서)
- [ ] `REVOKE UPDATE, DELETE ON "AuditLog" FROM app_role` (`TEC-DB-013`)
- [ ] `BEFORE UPDATE OR DELETE` 트리거로 감사 로그 변경 차단 (`TEC-DB-013`)
- [ ] `@@unique([transferId, stageNo, messageSeq])` — 전문 멱등 키 (`TEC-DB-014`)

### 🧪 Acceptance Criteria
**Scenario 1 (실패 흐름) — 감사 로그 수정이 거부된다**
- Given: 적재된 `AuditLog` 행에 대해
- When: `UPDATE` 또는 `DELETE`를 시도하면
- Then: **예외가 발생하고 행이 변경되지 않는다** (WORM)

**Scenario 2 (실패 흐름) — 중복 전문이 저장되지 않는다**
- Given: 동일 `(transferId, stageNo, messageSeq)` 전문이 이미 저장된 상태에서
- When: 같은 값으로 다시 저장을 시도하면
- Then: **유니크 제약 위반으로 거부된다.** 애플리케이션 분기 없이 DB가 막는다

**Scenario 3 (실패 흐름) — 역전된 밴드가 저장되지 않는다**
- Given: `endBandFrom > endBandTo`인 값으로
- When: `LockWindow`에 저장을 시도하면
- Then: CHECK 제약 위반으로 거부된다

### ⚙️ Constraints
- `TEC-DB-013` — 감사 로그는 UPDATE·DELETE 불가여야 한다
- ⚠️ 감사 로그 **보존기간은 미확정**이다 (OPEN-TEC-006). 현재 설계 상한 10년으로 두되 법무·정보보호 정책 확정값으로 교체한다

### 🏁 DoD
- [ ] 제약 6종 마이그레이션 적용
- [ ] 실패 흐름 시나리오 3건 전부 시험으로 확인
- [ ] 트리거 동작 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-005
- **Blocks:** FR-022 · FR-028

---

## FR-007 — Supabase RLS 정책 (본인 계좌 한정 접근)

**labels:** `feature, part:backend, epic:DAT, complexity:H, wave:W4, critical-path`

### 🎯 Summary
행 단위 보안으로 "본인 계좌만 조회" 규칙을 DB에서 강제한다. **애플리케이션 검증과 이중화**하는 것이 요구사항이며, 어느 한쪽만으로는 불충분하다.

### 🔗 References
- SRS-002 §5.3 `TEC-DB-015` · §10 Impact — `SRS-SEC-002` 소유권 검증
- SRS-002 §5.3 주석 — "Server Action은 서비스 롤로 접속하므로 RLS만으로는 부족하다. 반대로 애플리케이션 검증만 두면 직접 DB 접근 경로에서 뚫린다"

### ✅ Task Breakdown
- [ ] 고객 데이터 테이블에 RLS 활성화
- [ ] 본인 계좌 한정 SELECT 정책 작성
- [ ] 서비스 롤과 애플리케이션 롤 분리
- [ ] 애플리케이션 검증(FR-019)과의 역할 경계 문서화
- [ ] 우회 경로 점검 — 직접 DB 접근·서비스 롤 오용

### 🧪 Acceptance Criteria
**Scenario 1 (실패 흐름) — 타인 계좌 조회가 차단된다**
- Given: 고객 A의 세션으로
- When: 고객 B의 계좌 데이터를 조회하면
- Then: **0행이 반환된다.** 애플리케이션 검증을 우회해도 DB가 막는다

**Scenario 2 — 본인 계좌는 정상 조회된다**
- Given: 고객 A의 세션으로
- When: 본인 계좌를 조회하면
- Then: 정상 반환된다

### ⚙️ Constraints
- `TEC-DB-015` — Supabase RLS 정책 + 애플리케이션 검증 **이중화**
- ⚠️ RLS만으로 충분하다고 판단해 FR-019의 소유권 가드를 생략하면 안 된다. **둘 다 요구사항이다**

### 🏁 DoD
- [ ] RLS 정책 적용 및 활성화 확인
- [ ] 타인 계좌 접근 차단 시험 통과
- [ ] 롤 분리 확인
- [ ] 이중화 근거 문서화

### 🚧 Dependencies & Blockers
- **Depends on:** FR-005
- **Blocks:** FR-019
- ⚠️ **임계 경로.** 이 태스크가 열려야 Server Action 계층 전체가 시작된다.
