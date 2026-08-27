# Epic `SF2` — 화면 F2 인출순서 시뮬레이터 (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.1 · §9.3

> **F2-03·F2-04만 Client Component가 주도한다.** `SRS-NFR-PERF-005`가 인출액 변경 시 **p95 ≤ 300ms 재계산**을 요구하는데, 서버 왕복으로는 이 임계를 안정적으로 지킬 수 없다 (§9.3 CONFLICT-03).
>
> ⚠️ **기능2 전체가 LEGAL-Q1(투자자문업 해당 여부)에 걸려 있다.** 개발은 가능하되 **출시는 법무 판정 후**다 (§13.3). 기능1은 영향받지 않는다.

---

## FR-043 — `/withdrawal` F2-01 출금관리 · F2-02 수령 대상

**labels:** `feature, part:frontend, epic:SF2, complexity:M, wave:W4`

### 🎯 Summary
부모·자식 인접 라우트 2종. 출금관리 진입점과 수령 대상 선택 화면이다.

### 🔗 References
- SRS-002 §3.1 `/withdrawal` (`SRS-FR-065`~`068`) · `/withdrawal/recipient` (`SRS-FR-069`~`071`)

### ✅ Task Breakdown
- [ ] **F2-01** — 원장 어댑터로 계좌·재원 현황 조회 및 표시
- [ ] F2-01 — 인출 시뮬레이션 진입 경로
- [ ] **F2-02** — 수령 대상 선택 (Prisma 조회)
- [ ] 계좌번호 표시는 `<MaskedAccount>` 사용
- [ ] 금액 표시는 `<MoneyText>` 사용

### 🧪 Acceptance Criteria
**Scenario 1 — 재원 현황이 표시된다**
- Given: 계좌가 조회되면
- When: F2-01을 렌더하면
- Then: 3층 재원 잔액이 원 단위 확정 금액으로 표시된다

**Scenario 2 — 계좌번호가 마스킹된다**
- Given: 계좌번호를 표시하면
- When: 렌더되면
- Then: 중간 4자리가 마스킹된다 (`SRS-SEC-009`)

### ⚙️ Constraints
- 금액은 `<MoneyText>` 필수. **비율 단독 표기 금지** (`SRS-FR-093`)
- ⚠️ 기능2 — LEGAL-Q1 미해결 시 출시 보류

### 🏁 DoD
- [ ] 화면 2종 렌더 확인
- [ ] 마스킹 확인
- [ ] 디자인 시안(UX-013) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-017 · FR-034 · UX-013
- **Blocks:** None

---

## FR-044 — 도메인 계산 모듈 클라이언트 동시 실행 구성

**labels:** `feature, part:frontend, epic:SF2, complexity:H, wave:W4`

### 🎯 Summary
**§9.3 CONFLICT-03의 해법.** 도메인 모듈이 순수 TypeScript라 동일 코드를 클라이언트에서도 실행할 수 있다. 슬라이더 조작마다 서버에 다녀오지 않는다.

### 🔗 References
- SRS-002 §9.3 CONFLICT-03 · `TEC-CALC-001` — 서버와 클라이언트에서 **동일 코드**로 실행되어야 한다
- SRS-002 §5.4 `TEC-DOM-001` — 도메인 모듈은 I/O가 없다

### ✅ Task Breakdown
- [ ] 도메인 계산 모듈(FR-009~011)을 클라이언트 번들에 포함
- [ ] 재원 잔액·한도·세율을 **최초 1회 서버에서** 받아오는 구조
- [ ] 이후 인출액 변경은 클라이언트에서 재계산
- [ ] 서버·클라이언트 결과 일치 검증 시험
- [ ] 번들 크기 영향 측정

### 🧪 Acceptance Criteria
**Scenario 1 — 같은 코드가 같은 결과를 낸다**
- Given: 동일 입력에 대해
- When: 서버와 클라이언트에서 각각 계산하면
- Then: **결과가 원 단위로 일치한다** (`TEC-CALC-001`)

**Scenario 2 — 재계산이 서버를 거치지 않는다**
- Given: 초기 데이터를 받은 상태에서
- When: 인출액을 변경하면
- Then: 네트워크 요청 없이 재계산된다

### ⚙️ Constraints
- `TEC-CALC-003` — **실제 제출·저장 시점에는 서버 계산 결과만 사용한다.** 클라이언트 결과는 표시용이다
- ⚠️ 잔여 위험 (§9.3) — "클라이언트가 낡은 세율을 들고 있을 수 있다". FR-045가 이를 처리한다

### 🏁 DoD
- [ ] 서버·클라이언트 결과 일치 시험 통과
- [ ] 네트워크 요청 부재 확인
- [ ] 번들 크기 영향 기록

### 🚧 Dependencies & Blockers
- **Depends on:** FR-009 · FR-010 · FR-011
- **Blocks:** FR-045 · FR-046 · FR-047

---

## FR-045 — 세율표 버전 동기화 및 클라이언트 계산 무효화

**labels:** `feature, part:frontend, epic:SF2, complexity:H, wave:W6`

### 🎯 Summary
클라이언트가 **낡은 세율로 계산한 결과를 무효화**한다. §9.3의 잔여 위험을 닫는 태스크다.

### 🔗 References
- SRS-002 §9.3 `TEC-CALC-002` · `TEC-CALC-003` · `TEC-CALC-004`

### ✅ Task Breakdown
- [ ] 서버 응답에 세율표 버전 포함
- [ ] 클라이언트 계산 결과에 사용된 세율표 버전 부착 (`TEC-CALC-002`)
- [ ] 서버 버전과 다르면 **결과 무효화 후 재조회**
- [ ] 세율 신선도 판정은 **서버에서만** (`TEC-CALC-004`)
- [ ] 무효화 시 사용자 안내 처리

### 🧪 Acceptance Criteria
**Scenario 1 — 버전 불일치 시 무효화된다**
- Given: 클라이언트가 세율표 v1로 계산한 상태에서
- When: 서버 버전이 v2로 바뀌면
- Then: **클라이언트 결과가 무효화되고 재조회가 발생한다**

**Scenario 2 (실패 흐름) — 클라이언트가 신선도를 판정하지 않는다**
- Given: 세율표가 D+30을 초과한 상태에서
- When: 클라이언트가 캐시된 세율로 계산을 시도하면
- Then: **서버 판정에 따라 차단된다.** 클라이언트 판정으로 통과시키지 않는다 (`SRS-FR-098`)

### ⚙️ Constraints
- `TEC-CALC-004` — 신선도 판정은 서버 전용. 클라이언트 캐시 세율로 결과를 내면 `SRS-FR-098` 위반
- `TEC-CALC-003` — 제출 시점에는 서버 계산 결과만 사용

### 🏁 DoD
- [ ] 버전 불일치 무효화 시험 통과
- [ ] 신선도 서버 판정 시험 통과
- [ ] 무효화 안내 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-033 · FR-044
- **Blocks:** FR-046 · FR-047

---

## FR-046 — `/withdrawal/amount` F2-03 인출금액 (Client 주도)

**labels:** `feature, part:frontend, epic:SF2, complexity:H, wave:W8`

### 🎯 Summary
인출액을 조절하며 한도 소진과 세액 변화를 **즉시** 보여준다. p95 ≤ 300ms 재계산이 요구된다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-072`~`084`) · §9.3
- SRS-002 §6.1 한도 게이지 = `Progress`(3구간) · 인출액 입력 = `Input`+`Slider` · 계산 근거 = `Collapsible` · 사유 선택 = `Select`

### ✅ Task Breakdown
- [ ] 한도 게이지 3구간 렌더 (`SRS-FR-072`)
- [ ] 인출액 `Input` + `Slider` (`SRS-FR-074`)
- [ ] 인출 사유 `Select` (`SRS-FR-076`)
- [ ] 계산 근거 `Collapsible` (`SRS-FR-075`)
- [ ] 경고·주의 `Alert` (`SRS-FR-077`·`078`)
- [ ] 클라이언트 재계산 연결 (FR-044·FR-045)
- [ ] **모의계산 라벨 sticky 고정** — `<SimulationLabel>` (`SRS-FR-082`)
- [ ] 11년차 이상 한도 없음 표시 (`SRS-FR-083`)

### 🧪 Acceptance Criteria
**Scenario 1 — 슬라이더 조작이 즉시 반영된다**
- Given: 인출액 슬라이더를 조작하면
- When: 값이 변하면
- Then: 한도 소진과 세액이 **서버 왕복 없이** 갱신된다

**Scenario 2 — 모의계산임이 항상 보인다**
- Given: 화면을 스크롤해도
- When: 어느 위치에서든
- Then: **모의계산 라벨이 sticky로 고정되어 보인다** (`SRS-FR-082`)

**Scenario 3 — 한도 초과가 경고된다**
- Given: 잔여 한도를 초과하는 인출액을 입력하면
- When: 재계산되면
- Then: 경고가 표시된다

**Scenario 4 — 11년차는 한도 표시가 다르다**
- Given: 연차 11년 이상 계좌에서
- When: 화면을 렌더하면
- Then: 한도 게이지 대신 "한도 없음"이 표시된다 (`SRS-FR-083`)

### ⚙️ Constraints
- 성능 목표 p95 ≤ 300ms (`SRS-NFR-PERF-005`) — **FR-050 실측 대상**
- 금액은 `<MoneyText>`. **비율 단독 표기 금지**
- ⚠️ 계산 근거는 매핑표 기반. 세무 관련 안내문 **생성 금지** (SRS-002 §7.3 — 세무사법 §2 4호)

### 🏁 DoD
- [ ] 즉시 재계산 확인
- [ ] sticky 라벨 확인
- [ ] 시나리오 4건 전부 통과
- [ ] 디자인 시안(UX-014) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-025 · FR-035 · FR-044 · FR-045 · UX-014
- **Blocks:** None

---

## FR-047 — `/withdrawal/result` F2-04 인출순서 결과 (Client 주도)

**labels:** `feature, part:frontend, epic:SF2, complexity:H, wave:W7`

### 🎯 Summary
3층 재원이 어떤 순서로 얼마씩 소진되는지, 세액이 얼마인지 보여준다. **이 제품의 핵심 산출물 화면**이다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-085`~`101`) · §6.1 3층 소진 시각화 = 커스텀 · 경고 = `Alert`

### ✅ Task Breakdown
- [ ] 3층 재원 소진 시각화 (`SRS-FR-085`)
- [ ] 층별 차감액·세액 표시 — `<MoneyText>` (`SRS-FR-093`)
- [ ] 경고·주의 `Alert`
- [ ] 즉시 재계산 연결 (`SRS-FR-101`)
- [ ] 모의계산 라벨 sticky
- [ ] 세율 차단 상태 처리 (`SRS-FR-098`)

### 🧪 Acceptance Criteria
**Scenario 1 — 층별 소진이 시각화된다**
- Given: 인출액이 정해지면
- When: 결과를 렌더하면
- Then: 3층 각각의 차감액이 시각적으로 표시되고 **합계가 인출액과 원 단위로 일치**한다

**Scenario 2 — 금액이 원 단위 확정값으로 나온다**
- Given: 세액이 계산되면
- When: 표시되면
- Then: 원 단위 금액으로 표시된다. **비율만 단독 표기하지 않는다** (`SRS-FR-093`)

**Scenario 3 (실패 흐름) — 세율이 낡으면 결과가 막힌다**
- Given: 세율표가 D+30을 초과하면
- When: 결과 화면에 진입하면
- Then: **계산 결과 대신 차단 안내가 표시된다** (`SRS-FR-098`)

### ⚙️ Constraints
- 종목 관련 문구 **생성 금지** — 자본시장법 §6⑦ (SRS-002 §7.3)
- 세무 안내문 **생성 금지** — 세무사법 §2 4호
- ⚠️ 기능2 — LEGAL-Q1 미해결 시 출시 보류

### 🏁 DoD
- [ ] 3층 시각화 렌더 확인
- [ ] 차감 합계 항등식 시험 통과
- [ ] 세율 차단 시험 통과
- [ ] 디자인 시안(UX-015) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-023 · FR-044 · FR-045 · UX-015
- **Blocks:** None

---

## FR-048 — `/withdrawal/tax-free` F2-05 비과세 관리

**labels:** `feature, part:frontend, epic:SF2, complexity:M, wave:W8`

### 🎯 Summary
확인서 제출 전/후 세액을 비교해 보여준다. 제출의 실익을 고객이 판단할 수 있게 한다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-102`~`106`) · §4.2 `compareWithCertificate`

### ✅ Task Breakdown
- [ ] `compareWithCertificate`(FR-025) 호출
- [ ] 제출 전/후 세액 나란히 표시 (`SRS-FR-104`)
- [ ] 차액 강조 표시 — `<MoneyText>`
- [ ] 제출 안내 (경로만 안내, 대행하지 않음)
- [ ] 모의계산 라벨

### 🧪 Acceptance Criteria
**Scenario 1 — 전/후가 비교된다**
- Given: 검증 데이터셋 조건에서
- When: 비교 화면을 렌더하면
- Then: 제출 전 **465,960원**, 제출 후 **355,080원**과 차액이 표시된다

**Scenario 2 — 원 단위로 표시된다**
- Given: 세액과 차액이 표시되면
- When: 렌더되면
- Then: 원 단위 확정 금액으로 표시된다 (비율 단독 표기 금지)

### ⚙️ Constraints
- 세무 상담·자문에 해당하는 문구 금지 (세무사법 §2 4호)
- 확인서 제출을 **대행하지 않는다.** 경로 안내만 한다

### 🏁 DoD
- [ ] 전/후 비교 렌더 확인
- [ ] 검증 데이터셋 값 일치
- [ ] 디자인 시안(UX-016) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-025 · FR-034 · UX-016
- **Blocks:** None

---

## FR-049 — `/withdrawal/inheritance` F2-06 타명의 조회

**labels:** `feature, part:frontend, epic:SF2, complexity:L, wave:W4`

### 🎯 Summary
타명의(상속 등) 관련 안내와 외부 경로 딥링크. 정적 콘텐츠 중심이라 독립성이 높다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-107`~`110`) — 정적 + 딥링크

### ✅ Task Breakdown
- [ ] 안내 콘텐츠 정적 렌더
- [ ] 외부 경로 딥링크 연결
- [ ] 문의 경로 안내

### 🧪 Acceptance Criteria
**Scenario 1 — 안내가 표시되고 딥링크가 동작한다**
- Given: 화면에 진입하면
- When: 렌더되면
- Then: 안내가 표시되고 딥링크가 정상 이동한다

### ⚙️ Constraints
- 정적 콘텐츠. 계산·조회 로직 없음
- 안내 문구는 매핑 기반. 생성형 변환 금지

### 🏁 DoD
- [ ] 렌더 및 딥링크 확인
- [ ] 디자인 시안(UX-017) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-034 · UX-017
- **Blocks:** None
- 💡 축소 후보 — [압축 수행 일정 §5.3](../10_%5B%EC%B4%9D%EA%B4%84%5D%20%EC%95%95%EC%B6%95%20%EC%88%98%ED%96%89%20%EC%9D%BC%EC%A0%95%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)에서 제외 시 약 1일 단축 가능한 항목으로 식별
