# Epic `DOM` — Domain Engine (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §2.3 · §5.4 · §9.3

> **이 Epic 전체가 I/O 없는 순수 TypeScript다.** DB도 화면도 없이 검증할 수 있어 **가장 먼저 끝나야 한다.** 선행이 FR-001 하나뿐이라 W2에 6건을 동시 착수할 수 있다.
>
> 공통 제약: `TEC-DOM-001` Prisma import 금지 · `TEC-DOM-002` 순수 함수(`Date.now()` 등은 인자로) · `TEC-DOM-003` 금액은 `Decimal`

---

## FR-008 — `business-day.ts` 영업일 · Cut-off 엔진

**labels:** `feature, part:backend, epic:DOM, complexity:H, wave:W2`

### 🎯 Summary
영업일 판정과 Cut-off 처리를 담당한다. **밴드 산출과 배치 전체의 시간 기준**이며, 여기가 틀리면 고객이 보는 날짜가 조용히 틀린다.

### 🔗 References
- SRS-002 §2.3 `lib/domain/business-day.ts` · §8.3 `TEC-BATCH-002`
- PRD v3.1 §8.8 영업일·Cut-off (BD-1~12 · Asia/Seoul · Cut-off 15:30)

### ✅ Task Breakdown
- [ ] 영업일 판정 함수 — 주말 및 휴장일 제외
- [ ] N영업일 후 날짜 산출
- [ ] Cut-off 15:30 기준 당일/익영업일 판정
- [ ] 시간대 Asia/Seoul 고정. 현재 시각은 **인자로 받는다** (`TEC-DOM-002`)
- [ ] 영업일 달력 데이터의 주입 인터페이스 정의 (출처는 미확정 — Constraints 참조)

### 🧪 Acceptance Criteria
**Scenario 1 — Cut-off 직전·직후가 갈린다**
- Given: 기준 시각 15:29(KST)와 15:31(KST)에 대해
- When: 접수 영업일을 판정하면
- Then: 전자는 당일, 후자는 익영업일로 판정된다

**Scenario 2 — 비영업일이 제외된다**
- Given: 금요일 기준 2영업일 후를 구하면
- When: 주말이 포함되면
- Then: 화요일이 반환된다 (토·일 제외)

### ⚙️ Constraints
- 현재 시각을 함수 내부에서 읽지 않는다 (`TEC-DOM-002`) — 그래야 시험에서 시각을 고정할 수 있다
- ⚠️ **영업일 달력의 출처가 미확정이다.** 한국 금융 영업일은 공휴일 + 증시 휴장일이 겹친다. 데이터 원천과 갱신 주기 확정 필요 — [개발 실행 계획 §1.3](../09_%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) 선결 항목

### 🏁 DoD
- [ ] 단위 시험 통과 (Cut-off 경계 · 주말 · 연휴)
- [ ] Prisma import 0건
- [ ] 시각 인자 주입 방식 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** FR-012 · FR-030

---

## FR-009 — `pension-limit.ts` 연금수령한도 산출

**labels:** `feature, part:backend, epic:DOM, complexity:H, wave:W2`

### 🎯 Summary
소득세법 시행령 §40의2 기준 연금수령한도를 계산한다. **법정 산식이며 재량 판단이 아니다.**

### 🔗 References
- SRS-002 §5.4 `calcPensionLimit` 예시 코드
- PRD v3.1 §7 계산 규칙 · `SRS-FR-083` 11년차 이상 한도 없음 · `SRS-BR-019b` 부득이한 사유 한도 미산입

### ✅ Task Breakdown
- [ ] `calcPensionLimit(evalAmountAtPeriodStart, paymentYear, withdrawnThisYear, unavoidableWithdrawn)` 구현
- [ ] 연차 11 이상이면 `noLimit: true` 반환 (`SRS-FR-083`)
- [ ] 한도 = 평가액 ÷ (11 − 연차) × 1.2
- [ ] 잔여 한도 = 한도 − (기인출 − 부득이한 사유 인출) (`SRS-BR-019b`)
- [ ] 전 연산 `Decimal` (`TEC-DOM-003`)

### 🧪 Acceptance Criteria
**Scenario 1 — 검증 데이터셋 일치**
- Given: 평가액 84,000,000원 · 57세 · 연차 3년 · 기인출 2,000,000원
- When: 한도를 계산하면
- Then: 한도 **12,600,000원** · 잔여 **10,600,000원** (원 단위 일치)

**Scenario 2 — 11년차 이상은 한도가 없다**
- Given: 연차 11년
- When: 한도를 계산하면
- Then: `noLimit: true`이고 `limit`·`remaining`은 `null`이다

### ⚙️ Constraints
- 법정 산식이다. **AI·추정 적용 금지** (SRS-002 §7.3)
- `SRS-NFR-REL-011` 원 단위 일치 — 부동소수 오차가 허용되지 않는다

### 🏁 DoD
- [ ] 검증 데이터셋 해당 항목 원 단위 일치
- [ ] `Decimal` 전용 확인
- [ ] Prisma import 0건

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** FR-016 · FR-025 · FR-044

---

## FR-010 — `withdrawal-order.ts` 3층 재원 인출순서 판정

**labels:** `feature, part:backend, epic:DOM, complexity:H, wave:W2`

### 🎯 Summary
소득세법 시행령 §40의3의 인출순서(3층 재원)를 판정한다. 층별 차감 결과가 세액 계산(FR-011)의 입력이 된다.

### 🔗 References
- SRS-002 §2.3 `lib/domain/withdrawal-order.ts`
- PRD v3.1 §7 계산 규칙 — 인출순서 3층 재원

### ✅ Task Breakdown
- [ ] 재원 3층 구조 정의 및 차감 우선순위 구현
- [ ] 인출액에 대한 층별 차감액 산출
- [ ] 층 소진 시 다음 층으로 이월
- [ ] 인출 사유(`WithdrawalReason`)별 분기 처리
- [ ] 전 연산 `Decimal`

### 🧪 Acceptance Criteria
**Scenario 1 — 순서대로 차감된다**
- Given: 3층 재원 잔액과 인출액이 주어지면
- When: 인출순서를 계산하면
- Then: 법정 순서대로 차감되고 층별 차감액 합계가 인출액과 **원 단위로 일치**한다

**Scenario 2 — 잔액을 초과할 수 없다**
- Given: 총 재원 잔액을 초과하는 인출액
- When: 계산하면
- Then: 초과분이 식별 가능한 형태로 반환된다 (음수 차감이 발생하지 않는다)

### ⚙️ Constraints
- 법정 산식. AI 적용 금지 (SRS-002 §7.3)
- 차감 합계 = 인출액 (원 단위)

### 🏁 DoD
- [ ] 검증 데이터셋 해당 항목 일치
- [ ] 차감 합계 항등식 시험 통과
- [ ] Prisma import 0건

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** FR-011 · FR-016 · FR-023 · FR-044

---

## FR-011 — `tax.ts` 세액 산출

**labels:** `feature, part:backend, epic:DOM, complexity:H, wave:W3`

### 🎯 Summary
층별 차감 결과에 세율을 적용해 세액을 산출한다. **확인서 제출 전/후, 부득이한 사유 적용 여부에 따라 결과가 달라진다.**

### 🔗 References
- SRS-002 §2.3 `lib/domain/tax.ts` · §7.3 세액 계산 AI 금지
- PRD v3.1 §7 — 소득세법 §129①5호의3 감면율 · §20의2 부득이한 사유

### ✅ Task Breakdown
- [ ] 층별 차감액에 세율 적용
- [ ] 이연퇴직소득 세율 반영
- [ ] 확인서 제출 전/후 분기
- [ ] 부득이한 사유 적용 분기
- [ ] 세율표 버전을 결과에 포함 (`TEC-CALC-002` — 클라이언트 무효화 판정에 사용)

### 🧪 Acceptance Criteria
**Scenario 1 — 검증 데이터셋 3종 일치**
- Given: 평가액 84,000,000원 · 이연퇴직소득 28,000,000원 @6.6%
- When: 세액을 계산하면
- Then: 기본 **465,960원** · 확인서 후 **355,080원** · 부득이한 사유 **378,840원** (전부 원 단위 일치)

**Scenario 2 — 세율표 버전이 결과에 포함된다**
- Given: 임의의 계산 요청
- When: 결과를 받으면
- Then: 사용된 세율표 버전이 함께 반환된다 (`TEC-CALC-002`)

### ⚙️ Constraints
- 법정 산식. **AI 적용 금지** — SRS-002 §7.3이 "확률적 생성으로 원 단위 일치를 충족할 수 없다"고 명시
- 세율 **신선도 판정은 서버 전용**이다 (`TEC-CALC-004`). 이 모듈은 판정하지 않고 버전만 보고한다

### 🏁 DoD
- [ ] 검증 데이터셋 3종 원 단위 일치
- [ ] 세율표 버전 반환 확인
- [ ] Prisma import 0건

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001 · FR-010
- **Blocks:** FR-016 · FR-023 · FR-044

---

## FR-012 — `band.ts` 완료일 밴드 산출

**labels:** `feature, part:backend, epic:DOM, complexity:H, wave:W3`

### 🎯 Summary
완료 예정일을 **범위(밴드)로** 산출한다. 이 제품의 정체성에 해당하는 계산이며, 단일 날짜를 내보내면 안 된다.

### 🔗 References
- SRS-002 §2.3 `lib/domain/band.ts` · §10 Impact (`SRS-BR-011` 밴드 산출 규격)
- PRD v3.1 §7 계산 규칙 · `SRS-FR-018`·`036` 밴드 표시

### ✅ Task Breakdown
- [ ] 결제 소요일(`settle_days`) 기반 밴드 시작·종료 산출
- [ ] 영업일 엔진(FR-008)으로 영업일 환산
- [ ] 밴드 폭 최소 2영업일 보장 (`TEC-DB-010` 정합)
- [ ] `businessDaysMin`·`businessDaysMax` 동시 반환
- [ ] **단일 날짜를 반환하는 경로를 만들지 않는다**

### 🧪 Acceptance Criteria
**Scenario 1 — 밴드가 두 값으로 나온다**
- Given: 결제 소요일과 기준일이 주어지면
- When: 밴드를 산출하면
- Then: `endBandFrom ≤ endBandTo`이고 폭이 **2영업일 이상**이다

**Scenario 2 — 같은 날 같은 입력은 같은 값**
- Given: 동일 입력으로
- When: 같은 날 두 번 계산하면
- Then: 동일한 밴드가 반환된다 (`SRS-FR-037` 당일 일관성의 계산 측 전제)

### ⚙️ Constraints
- 단일 날짜 반환 금지 — 타입에 단일 날짜 반환형을 정의하지 않는다
- ⚠️ `settle_days` **실측값이 미확정**이다 (PRD SYS-Q3, Phase 1 착수 Gate). 잠정값으로 구현하되 상수 교체가 쉬운 구조로 만든다

### 🏁 DoD
- [ ] 밴드 폭 ≥ 2영업일 시험 통과
- [ ] 당일 일관성 시험 통과
- [ ] 단일 날짜 반환형 부재 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001 · FR-008
- **Blocks:** FR-015 · FR-021 · FR-031 · FR-042

---

## FR-013 — `state-machine.ts` 상태 전이 판정

**labels:** `feature, part:backend, epic:DOM, complexity:H, wave:W3`

### 🎯 Summary
허용 전이를 판정하고 **금지 전이를 차단**한다. 되는 것만이 아니라 **안 되어야 하는 것**을 막는 것이 이 모듈의 핵심이다.

### 🔗 References
- SRS-002 §2.3 `lib/domain/state-machine.ts` · §4.4 `assertTransition` 사용 예
- PRD v3.1 §8.6 상태 전이 매트릭스 (T-01~T-16 + 금지 전이 5종)

### ✅ Task Breakdown
- [ ] `TransferStatus` 12종에 대한 전이표 구현
- [ ] 허용 전이 16종(T-01~T-16) 정의
- [ ] **금지 전이 5종 명시적 차단**
- [ ] `assertTransition(from, to)` — 위반 시 예외
- [ ] `trading_window`·`holding_status` 전이 판정

### 🧪 Acceptance Criteria
**Scenario 1 — 허용 전이가 통과한다**
- Given: `DRAFT` 상태에서
- When: `RECEIVED`로 전이를 판정하면
- Then: 통과한다 (T-02)

**Scenario 2 (실패 흐름) — 금지 전이가 차단된다**
- Given: `COMPLETED` 상태에서
- When: 진행 중 상태로 되돌리는 전이를 시도하면
- Then: **예외가 발생한다.** 고객에게 완료를 알린 뒤 되돌아가는 것은 회복 불가 사고다

### ⚙️ Constraints
- 금지 전이 5종은 **각각 시험 케이스를 가져야 한다.** 허용 전이만 시험하면 절반만 검증한 것이다
- 순수 함수 — DB 조회 없이 상태 값만으로 판정한다

### 🏁 DoD
- [ ] 허용 16종 + 금지 5종, **총 21건 전부 시험 케이스 존재**
- [ ] PRD §8.6 전이 매트릭스와 1:1 대조 완료
- [ ] Prisma import 0건

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001 · FR-003
- **Blocks:** FR-022 · FR-024 · FR-028 · FR-029 · FR-052
- 💡 FR-003 의존은 `TransferStatus` enum 정의 때문이다 — 전이표가 enum 값을 참조한다.

---

## FR-014 — `trading-window.ts` 매매 가능 판정

**labels:** `feature, part:backend, epic:DOM, complexity:M, wave:W2`

### 🎯 Summary
계좌의 매매 가능 여부를 판정한다. **주문 시스템이 매 주문마다 호출**하는 판정의 계산 본체다.

### 🔗 References
- SRS-002 §2.3 `lib/domain/trading-window.ts` · §9.1 CONFLICT-01 (`SRS-IF-006`)
- PRD v3.1 §8 `trading_window` 상태 (OPEN / SELL_ONLY / LOCKED / REOPENED)

### ✅ Task Breakdown
- [ ] 이관 상태·잠금 창 기준 매매 가능 여부 판정
- [ ] `TradingWindowValue` 4종 반환
- [ ] 판정 근거를 함께 반환 (디버깅·감사용)
- [ ] 순수 함수 — 상태 값만 입력으로 받는다

### 🧪 Acceptance Criteria
**Scenario 1 — 이관 중 매도만 허용**
- Given: 이관이 진행 중이고 잠금 창 안이면
- When: 판정하면
- Then: `SELL_ONLY`가 반환된다

**Scenario 2 — 판정 근거가 함께 온다**
- Given: 임의의 판정 요청
- When: 결과를 받으면
- Then: 값과 함께 그 판정에 이른 근거가 반환된다

### ⚙️ Constraints
- ⚠️ 이 판정이 늦으면 상위(FR-027)에서 **안전한 쪽인 `LOCKED`로 강등**된다. 계산 자체는 빨라야 한다
- 순수 함수. I/O 금지

### 🏁 DoD
- [ ] 4종 값 전부 시험 케이스 존재
- [ ] 판정 근거 반환 확인
- [ ] Prisma import 0건

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** FR-027

---

## FR-015 — 폴백 사다리 단계 판정 및 `approximate` 산출

**labels:** `feature, part:backend, epic:DOM, complexity:M, wave:W4`

### 🎯 Summary
데이터 신선도에 따라 폴백 단계를 판정하고, ③④단계일 때 **"대략치입니다" 병기 플래그**를 산출한다.

### 🔗 References
- SRS-002 §6.2 `BandDisplayProps.approximate` — "폴백 ③④단계 시 대략치입니다 병기"
- SRS-002 §13.3 — 전문 수신 경로 확정 전까지 **폴백 ③단계 기준으로만** 구현

### ✅ Task Breakdown
- [ ] 폴백 사다리 단계 판정 로직
- [ ] ③④단계 시 `approximate: true` 산출
- [ ] 각 단계의 데이터 출처 및 신뢰도 기록
- [ ] 단계별 표시 문구 매핑 키 반환 (문구 자체는 UI 계층)

### 🧪 Acceptance Criteria
**Scenario 1 — ③단계에서 대략치 플래그가 선다**
- Given: 폴백 ③단계 조건에서
- When: 판정하면
- Then: `approximate: true`가 반환된다

**Scenario 2 — ①단계에서는 플래그가 서지 않는다**
- Given: 확정 데이터가 있는 ①단계에서
- When: 판정하면
- Then: `approximate: false`

### ⚙️ Constraints
- ⚠️ **OPEN-TEC-004 미해결 상태에서는 ③단계가 기본 동작이다** (§13.3). 전문 수신 경로가 확정되면 ①②단계가 활성화된다
- 문구 생성 금지 — 매핑 키만 반환한다 (SRS-002 §7.3 생성형 변환 금지)

### 🏁 DoD
- [ ] 단계별 판정 시험 통과
- [ ] `approximate` 플래그 시험 통과
- [ ] ③단계 기본 동작 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-012
- **Blocks:** None

---

## FR-016 — 검증 데이터셋 6건 단위 시험 및 배포 전 회귀 게이트

**labels:** `test, part:backend, epic:DOM, complexity:M, wave:W4`

### 🎯 Summary
법정 계산이 **원 단위로 맞는지**를 자동 검증하고, 그 시험을 배포 게이트로 만든다. **G1 게이트에 해당하는 태스크**이며, 여기가 실패하면 그 위에 쌓은 모든 것이 무의미하다.

### 🔗 References
- SRS-002 §5.4 `TEC-DOM-004` — 검증 데이터셋 6건이 단위 시험으로 자동 검증되어야 한다
- SRS-002 §8.1 `TEC-OPS-003` — Preview 배포에서 회귀 시험이 통과해야 한다
- PRD v3.1 검증 데이터셋

### ✅ Task Breakdown
- [ ] 검증 데이터셋 6건을 시험 픽스처로 등록
- [ ] 한도·인출순서·세액 계산 결과를 **원 단위 비교**로 단정
- [ ] Preview 배포 파이프라인에 회귀 시험 편입 (`TEC-OPS-003`)
- [ ] 실패 시 Production 배포를 차단하는 게이트 구성
- [ ] 시험 실행 결과를 배포 로그로 남김

### 🧪 Acceptance Criteria
**Scenario 1 — 6건 전건 일치**
- Given: 검증 데이터셋 6건으로
- When: 도메인 모듈 시험을 실행하면
- Then: 6건 모두 기대값과 **원 단위로 일치**한다 (한도 12,600,000 · 잔여 10,600,000 · 세액 465,960 / 355,080 / 378,840 포함)

**Scenario 2 (실패 흐름) — 불일치 시 배포가 막힌다**
- Given: 계산 결과가 1원이라도 다르면
- When: Preview 배포 게이트가 실행되면
- Then: **Production 배포가 차단된다**

### ⚙️ Constraints
- `TEC-OPS-003` — 회귀 시험 통과가 Production 배포의 전제 조건이다
- ⚠️ **부동소수 비교 금지.** `Decimal` 동등 비교로 단정한다
- ⚠️ 밴드 검증값은 [PRD와 프로토타입 간 불일치(OI-15)](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md)가 있어 **합격 판정에서 제외**한다

### 🏁 DoD
- [ ] 6건 시험 케이스 작성 및 통과
- [ ] Preview 게이트 동작 확인 (의도적 실패 주입 시 배포 차단)
- [ ] **G1 게이트 통과 기록**

### 🚧 Dependencies & Blockers
- **Depends on:** FR-002 · FR-009 · FR-010 · FR-011
- **Blocks:** FR-051
- 💡 **권고: 계획표의 W10을 기다리지 말고, 각 계산 모듈 완료 직후 부분 실행한다.** 계산 오류를 늦게 발견할수록 재작업 범위가 커진다 ([개발 실행 계획 §4.1 R2](../09_%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)).
