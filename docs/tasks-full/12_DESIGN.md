# Epic `DSG` — UI/UX 디자인 (풀버전)

근거: [태스크 리스트 v2.0](../../tasks/task-breakdown-v2-merged.md) · [SRS-002](../../SRS/srs-002-pension-plus-nextjs-v1_0.md) §6

> **디자인 트랙의 실질 마감은 UX-002와 UX-003이다.** 두 태스크가 각각 후행 10건을 막고 있고, 늦으면 FR-034·FR-035가 서면서 **화면 12종이 전부 선다.** [개발 실행 계획 §1.2](../%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)는 이 둘의 마감을 D+15로 못박을 것을 권고한다.
>
> **디자인이 지켜야 할 규칙은 미감이 아니라 표기 규약이다.** 완료일을 단일 날짜로 그리면 안 되고, 확정과 추정이 시각적으로 구분되어야 하며, 금액은 비율만 단독으로 보여서는 안 된다. 이건 취향이 아니라 요구사항이다.

---

## UX-001 — 디자인 토큰 정의 (색 · 타이포 · 간격 · 대비 · 줄바꿈)

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W1`

### 🎯 Summary
디자인 시스템의 뿌리. **전이 후행 30건** — 디자인 트랙 전체가 여기서 시작된다.

### 🔗 References
- SRS-002 §6.1 C-TEC-004 · §6.3 `TEC-UI-010` · `TEC-UI-011`

### ✅ Task Breakdown
- [ ] 색·타이포·간격 토큰 정의 — **Tailwind 토큰과 1:1 대응**
- [ ] 대비 검증 통과 팔레트 확정 (본문 4.5:1 · 큰 텍스트 3:1)
- [ ] 한글 어절 단위 줄바꿈 타이포 규칙
- [ ] 상태·경고·주의를 표현할 시맨틱 색 정의

### 🧪 Acceptance Criteria
**Scenario 1 — 대비가 전건 통과한다**
- Given: 확정된 팔레트의 모든 전경/배경 조합에 대해
- When: 대비를 측정하면
- Then: 본문 4.5:1 · 큰 텍스트 3:1을 **전건 만족한다**

**Scenario 2 — 토큰이 코드와 대응된다**
- Given: 정의된 토큰으로
- When: Tailwind 설정과 대조하면
- Then: 1:1 대응하며 임의값이 필요한 경우가 없다

### ⚙️ Constraints
- `TEC-UI-010` — 대비 검증 통과 팔레트로 **고정**. 화면별 임의 색상 금지
- 토큰 외 임의값을 쓰게 만드는 시안은 반려한다 (C-TEC-004의 목적이 일관성 강제다)

### 🏁 DoD
- [ ] 대비 검증 전건 통과
- [ ] Tailwind 토큰 대응표 작성
- [ ] 줄바꿈 규칙 문서화

### 🚧 Dependencies & Blockers
- **Depends on:** None — **조건 없이 즉시 착수 가능**
- **Blocks:** FR-037 · UX-002
- ⚠️ 전이 후행 30건. **W1에 FR-001·FR-002와 함께 출발해야 한다.**

---

## UX-002 — shadcn/ui 14종 시각 스타일 정의

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W2`

### 🎯 Summary
매핑 14종의 시각 언어를 확정한다. **직접 후행 10건** — 프론트 전체를 막는 디자인 태스크다.

### 🔗 References
- SRS-002 §6.1 컴포넌트 매핑 · §6.3 `TEC-UI-012`

### ✅ Task Breakdown
- [ ] 14종 시각 스타일 정의 — `Card` `Progress` `Table` `Accordion`+`Badge` `Sheet` `Collapsible` `Input`+`Slider` `Select` `Alert` `AlertDialog` `ScrollArea`
- [ ] 각 컴포넌트의 상태별(기본·호버·포커스·비활성·오류) 시안
- [ ] **키보드 포커스 가시성** 명시
- [ ] ARIA 속성을 해치지 않는 커스터마이즈 범위 정의

### 🧪 Acceptance Criteria
**Scenario 1 — 상태별 시안이 완비된다**
- Given: 14종 각각에 대해
- When: 시안을 확인하면
- Then: 5개 상태(기본·호버·포커스·비활성·오류)가 전부 정의되어 있다

**Scenario 2 — 포커스가 보인다**
- Given: 키보드로 이동하면
- When: 포커스가 이동하면
- Then: **시각적으로 명확히 구분된다**

### ⚙️ Constraints
- `TEC-UI-012` — 기본 ARIA 속성을 제거하는 커스터마이즈 금지
- 포커스 표시를 미감 이유로 제거하지 않는다

### 🏁 DoD
- [ ] 14종 × 5상태 시안 완료
- [ ] 포커스 가시성 확인
- [ ] ARIA 보존 범위 문서화

### 🚧 Dependencies & Blockers
- **Depends on:** UX-001
- **Blocks:** FR-034 · UX-003 · UX-004 · UX-005 · UX-006 · UX-007 · UX-008 · UX-009 · UX-013 · UX-017
- ⚠️ **직접 후행 10건 · 전이 후행 28건.** 디자인 트랙의 최대 병목.

---

## UX-003 — 표기 규칙 시각 규격 7종

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W3`

### 🎯 Summary
공통 표기 컴포넌트 6종 + 대략치 병기의 시각 규격. **직접 후행 10건.** 이 규격이 곧 FR-035의 구현 명세가 된다.

### 🔗 References
- SRS-002 §6.2 공통 표기 컴포넌트 · `TEC-UI-001` ~ `TEC-UI-003`

### ✅ Task Breakdown
- [ ] **밴드 표기** — 두 날짜를 범위로 보이게. **단일 날짜로 읽히는 시안 금지** (`SRS-FR-018`·`036`)
- [ ] **확정/추정 배지** — 확정은 분단위 시각, 추정은 비단정 서술 (`SRS-FR-034`·`035`)
- [ ] **모의계산 라벨** — sticky 고정 시 레이아웃 간섭 없게 (`SRS-FR-082`)
- [ ] **상태 표시** — `TransferStatus` 12종의 한글 표시명과 시각 규격 (`SRS-FR-047`)
- [ ] **금액 표기** — 원 단위 확정 금액. 비율 단독 표기가 나오지 않는 규격 (`SRS-FR-093`)
- [ ] **계좌 마스킹** — 중간 4자리 (`SRS-SEC-009`)
- [ ] **대략치 병기** — 폴백 ③④단계 표기 (`approximate`)

### 🧪 Acceptance Criteria
**Scenario 1 — 밴드가 범위로 읽힌다**
- Given: 완료 예정 밴드 시안을
- When: 사용자 시험으로 확인하면
- Then: **범위로 인지되고 특정 날짜로 오해되지 않는다**

**Scenario 2 — 확정과 추정이 구분된다**
- Given: 두 배지를 나란히 놓으면
- When: 확인하면
- Then: 색뿐 아니라 **형태·문구로도** 구분된다 (색만으로 구분하면 색각 이상에서 실패한다)

**Scenario 3 — 상태 12종에 표시명이 있다**
- Given: `TransferStatus` 12종 전부에 대해
- When: 표시명을 확인하면
- Then: 빠짐없이 한글 표시명이 정의되어 있다

### ⚙️ Constraints
- **색만으로 정보를 구분하지 않는다.** 형태·문구를 병행한다
- 상태 표시명은 내부 enum을 노출하지 않는 표현으로 (`SRS-FR-047`)
- 대략치 병기는 눈에 띄되 결과를 가리지 않아야 한다

### 🏁 DoD
- [ ] 7종 규격 시안 완료
- [ ] 상태 12종 표시명 전건 정의
- [ ] 색각 이상 시뮬레이션 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002
- **Blocks:** FR-035 · UX-004 · UX-006 · UX-007 · UX-008 · UX-010 · UX-011 · UX-012 · UX-014 · UX-016
- ⚠️ **직접 후행 10건.** FR-035의 선행이므로 표기 컴포넌트 구현이 여기 걸려 있다.

---

## UX-004 — 단계 타임라인 디자인

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W4`

### 🎯 Summary
이관 진행을 단계별로 보여주는 커스텀 시각화. `Progress` + 커스텀 구성이며 현황판의 핵심이다.

### 🔗 References
- SRS-002 §6.1 단계 타임라인 = `Progress` + 커스텀 (`SRS-FR-033`)

### ✅ Task Breakdown
- [ ] 단계 진행 시각화 (완료·진행 중·대기 구분)
- [ ] 각 단계의 확정/추정 배지 배치
- [ ] 예외 상태(중단·거절·부분 차단) 표현
- [ ] 좁은 화면에서의 축약 규칙

### 🧪 Acceptance Criteria
**Scenario 1 — 현재 단계가 즉시 읽힌다**
- Given: 진행 중인 이관에 대해
- When: 타임라인을 보면
- Then: 현재 단계가 한눈에 식별된다

**Scenario 2 — 예외가 진행과 구분된다**
- Given: 중단·거절 상태에서
- When: 렌더하면
- Then: 정상 진행과 **명확히 다르게** 표시된다

### ⚙️ Constraints
- 단계 수가 늘어도 깨지지 않는 구조
- 좁은 화면에서 가로 스크롤이 발생하지 않게

### 🏁 DoD
- [ ] 정상·예외 시안 완료
- [ ] 반응형 축약 규칙 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002 · UX-003
- **Blocks:** UX-011

---

## UX-005 — 한도 게이지 3구간 디자인

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W3`

### 🎯 Summary
연금수령한도의 소진 상태를 3구간으로 보여준다. **11년차 이상은 한도가 없어** 다른 표현이 필요하다.

### 🔗 References
- SRS-002 §6.1 한도 게이지 = `Progress`(3구간 커스텀) (`SRS-FR-072`) · `SRS-FR-083`

### ✅ Task Breakdown
- [ ] 3구간 게이지 시각화 (기인출 · 이번 인출 · 잔여)
- [ ] 한도 초과 시 표현
- [ ] **11년차 이상 "한도 없음" 표현** (`SRS-FR-083`)
- [ ] 부득이한 사유 인출의 한도 미산입 표현 (`SRS-BR-019b`)

### 🧪 Acceptance Criteria
**Scenario 1 — 세 구간이 구분된다**
- Given: 기인출·이번 인출·잔여가 있으면
- When: 게이지를 보면
- Then: 세 구간이 시각적으로 구분되고 합이 한도와 일치하게 읽힌다

**Scenario 2 — 한도 없음이 다르게 보인다**
- Given: 11년차 이상 계좌에서
- When: 렌더하면
- Then: 게이지가 아니라 **"한도 없음"** 표현이 나온다

### ⚙️ Constraints
- 비율만 보이고 금액이 안 보이는 시안 금지 (`SRS-FR-093`)
- 색만으로 구간을 구분하지 않는다

### 🏁 DoD
- [ ] 정상·초과·한도없음 3개 시안
- [ ] 금액 병기 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002
- **Blocks:** UX-014

---

## UX-006 — 3층 재원 소진 시각화 디자인

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W4`

### 🎯 Summary
인출액이 3층 재원에서 어떤 순서로 얼마씩 빠지는지 보여준다. **이 제품에서 가장 설명이 어려운 개념**을 그림으로 푸는 작업이다.

### 🔗 References
- SRS-002 §6.1 3층 소진 시각화 = 커스텀 (`SRS-FR-085`)

### ✅ Task Breakdown
- [ ] 3층 구조와 차감 순서 시각화
- [ ] 층별 차감액을 원 단위 금액으로 병기
- [ ] 층 소진 및 다음 층 이월 표현
- [ ] 인출 사유별 차이 표현

### 🧪 Acceptance Criteria
**Scenario 1 — 차감 순서가 읽힌다**
- Given: 3층 차감 결과에 대해
- When: 시각화를 보면
- Then: **어느 층에서 먼저 빠지는지**가 설명 없이 이해된다

**Scenario 2 — 합계가 인출액과 맞아 보인다**
- Given: 층별 차감액이 표시되면
- When: 합산하면
- Then: 인출액과 일치함이 화면에서 확인된다

### ⚙️ Constraints
- 층별 금액을 반드시 병기. 비율 단독 표기 금지 (`SRS-FR-093`)
- ⚠️ 특정 재원을 먼저 쓰라고 **권유하는 것처럼 읽히면 안 된다** — 법정 순서를 설명하는 것이지 조언이 아니다

### 🏁 DoD
- [ ] 3층 시각화 시안 완료
- [ ] 금액 병기 확인
- [ ] 권유로 읽히지 않는지 문구 검토

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002 · UX-003
- **Blocks:** UX-015

---

## UX-007 — shadcn variant 정의 3종 (3그룹 판정 · 예외 배너 · 고객센터 시트)

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W4`

### 🎯 Summary
`Accordion`·`Alert`·`Sheet`의 도메인 특화 variant를 정의한다. 셋 다 shadcn 기본 컴포넌트의 변형이라 하나로 묶었다.

### 🔗 References
- SRS-002 §6.1 — 3그룹 판정(`SRS-FR-016`) · 예외 배너(`SRS-FR-040`) · 고객센터 시트(`SRS-FR-010`·`011`)

### ✅ Task Breakdown
- [ ] **3그룹 판정** `Accordion` + `Badge` — 이관가능 / 현금화필요 / 미확정 3종 배지
- [ ] **예외 상태 배너** `Alert` variant 체계 — 정보 / 주의 / 경고 / 차단
- [ ] **고객센터 연결** `Sheet` — 문의 경로 표시
- [ ] 각 variant의 사용 기준 문서화 (언제 어느 것을 쓰는가)

### 🧪 Acceptance Criteria
**Scenario 1 — 3그룹이 구분된다**
- Given: 세 종류의 판정 결과에 대해
- When: 배지를 보면
- Then: 색뿐 아니라 문구로도 구분된다

**Scenario 2 — 배너 등급이 일관된다**
- Given: variant 사용 기준에 따라
- When: 각 화면에 적용하면
- Then: 같은 심각도는 항상 같은 variant로 표시된다

### ⚙️ Constraints
- variant 선택 기준이 없으면 화면마다 다르게 쓰인다. **기준을 문서로 남긴다**
- "미확정"을 부정적으로 보이게 하지 않는다 — 아직 판정 전일 뿐이다

### 🏁 DoD
- [ ] variant 3종 시안 완료
- [ ] 사용 기준 문서화
- [ ] 색각 이상 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002 · UX-003
- **Blocks:** UX-009 · UX-010 · UX-011 · UX-015

---

## UX-008 — F1-01 홈 · 진행 알림 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W4`

### 🎯 Summary
홈에서 진행 중인 이관을 알리는 카드. 진입점이라 **눈에 띄되 다른 홈 콘텐츠를 방해하지 않아야** 한다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-001`~`007`) · §6.1 진행 카드 = `Card`

### ✅ Task Breakdown
- [ ] 진행 카드 시안 (상태 표시 · 현황판 진입)
- [ ] 진행 건 없음 상태
- [ ] 복수 진행 건 처리
- [ ] 예외 상태(중단·거절)일 때의 카드

### 🧪 Acceptance Criteria
**Scenario 1 — 진행 상태가 카드에서 읽힌다**
- Given: 진행 중 이관이 있으면
- When: 홈을 보면
- Then: 현재 상태와 다음 행동이 카드에서 파악된다

**Scenario 2 — 없을 때 빈 자리가 어색하지 않다**
- Given: 진행 건이 없으면
- When: 홈을 보면
- Then: 빈 카드가 남지 않는다

### ⚙️ Constraints
- 상태는 한글 표시명 (`SRS-FR-047`)
- 완료일은 밴드 표기 (`TEC-UI-001`)

### 🏁 DoD
- [ ] 정상·빈 상태·복수·예외 4개 시안
- [ ] 표기 규격(UX-003) 준수 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002 · UX-003
- **Blocks:** FR-038

---

## UX-009 — F1-02 유의사항 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W5`

### 🎯 Summary
약관 전문과 유의사항. **긴 텍스트를 읽게 만드는 것**이 설계 과제다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-008`~`015`) · §6.1 `ScrollArea` · `Sheet`

### ✅ Task Breakdown
- [ ] 유의사항 요약 + 약관 전문 `ScrollArea` 구조
- [ ] 고객센터 연결 `Sheet` 배치
- [ ] 다음 단계 진입 버튼 상태 (읽기 전/후)
- [ ] 긴 한글 텍스트의 가독성 규격 (`break-keep` 반영)

### 🧪 Acceptance Criteria
**Scenario 1 — 전문이 본문을 밀어내지 않는다**
- Given: 긴 약관이 있으면
- When: 렌더하면
- Then: `ScrollArea` 내부에서만 스크롤되고 페이지가 가로로 밀리지 않는다

**Scenario 2 — 어절 단위로 끊긴다**
- Given: 좁은 화면에서
- When: 한글이 줄바꿈되면
- Then: 어절 경계에서 끊긴다

### ⚙️ Constraints
- 유의사항을 읽지 않고 넘어가게 유도하는 시안 금지
- 안내 문구는 매핑 기반 (생성형 변환 금지)

### 🏁 DoD
- [ ] 시안 완료
- [ ] 가독성 규격 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002 · UX-007
- **Blocks:** FR-039

---

## UX-010 — F1-03 예약 · 잠금 미리보기 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W5`

### 🎯 Summary
**이관하면 무엇이 잠기는지 미리 보여주는 화면.** 고객이 되돌릴 수 없는 결정을 하기 전 마지막 정보 제공 지점이다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-016`~`032`) · §6.1 3그룹 = `Accordion`+`Badge` · 전송 확인 = `AlertDialog`

### ✅ Task Breakdown
- [ ] 3그룹 판정 표시 (`Accordion` + `Badge`)
- [ ] **완료 밴드 표시** — `<BandDisplay>` 규격 (`TEC-UI-001`)
- [ ] 잠금 미리보기 — 제한 업무 표
- [ ] 전송 확인 `AlertDialog` — 되돌릴 수 없음을 명시
- [ ] 폴백 ③④단계의 대략치 병기

### 🧪 Acceptance Criteria
**Scenario 1 — 잠기는 것이 이해된다**
- Given: 잠금 미리보기를 보면
- When: 확인하면
- Then: 이관 후 **무엇을 못 하게 되는지** 목록으로 파악된다

**Scenario 2 — 완료일이 범위로 읽힌다**
- Given: 밴드를 표시하면
- When: 확인하면
- Then: 특정 날짜 약속으로 오해되지 않는다

**Scenario 3 — 확인 다이얼로그가 되돌릴 수 없음을 알린다**
- Given: 전송 확인 단계에서
- When: 다이얼로그가 뜨면
- Then: 되돌릴 수 없다는 점이 명시된다

### ⚙️ Constraints
- ⚠️ **병목 종목을 "이것부터 파세요"로 읽히게 하면 안 된다** — 자본시장법 §6⑦ 종목 지정 저촉 위험 (SRS-002 §7.3)
- 밴드는 반드시 범위. 단일 날짜 시안 반려

### 🏁 DoD
- [ ] 시안 완료 (정상 · 폴백 · 확인 다이얼로그)
- [ ] 종목 권유로 읽히지 않는지 문구 검토
- [ ] 밴드 표기 규격 준수

### 🚧 Dependencies & Blockers
- **Depends on:** UX-003 · UX-007
- **Blocks:** FR-040

---

## UX-011 — F1-04 현황판 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W5`

### 🎯 Summary
**가장 복잡한 화면.** 상태 12종 × 폴백 단계 × 예외 배너를 한 화면에서 다뤄야 한다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-033`~`050`) · §6.1 타임라인 · 제한 업무 표 · 예외 배너

### ✅ Task Breakdown
- [ ] 단계 타임라인 배치 (UX-004)
- [ ] **상태 12종 각각의 화면 상태** 정의
- [ ] 확정/추정 배지 배치 (`SRS-FR-034`·`035`)
- [ ] 제한 업무 표 (`SRS-FR-046`)
- [ ] 예외 상태 배너 (`SRS-FR-040`)
- [ ] 거절 사유 표시 영역 (`SRS-FR-042` 매핑 문구)
- [ ] 완료일 근거(F1-05) 진입 경로

### 🧪 Acceptance Criteria
**Scenario 1 — 상태 12종에 전부 시안이 있다**
- Given: `TransferStatus` 12종 각각에 대해
- When: 시안을 확인하면
- Then: **빠짐없이** 화면 상태가 정의되어 있다

**Scenario 2 — 예외가 눈에 띈다**
- Given: 중단·거절·부분 차단 상태에서
- When: 진입하면
- Then: 배너가 먼저 눈에 들어온다

**Scenario 3 — 확정과 추정이 구분된다**
- Given: 두 종류 데이터가 한 화면에 있으면
- When: 보면
- Then: 어느 것이 확정이고 어느 것이 추정인지 구분된다

### ⚙️ Constraints
- 상태 12종 중 하나라도 시안이 없으면 개발이 임의로 만든다 — **전건 정의가 요구사항이다**
- 거절 사유는 매핑 문구. **"압류 대상자" 같은 사람 규정 표현 금지** (SRS-002 §7.3)

### 🏁 DoD
- [ ] 상태 12종 전건 시안
- [ ] 예외 배너 3종 확인
- [ ] 거절 사유 문구 검토

### 🚧 Dependencies & Blockers
- **Depends on:** UX-003 · UX-004 · UX-007
- **Blocks:** FR-041 · UX-012

---

## UX-012 — F1-05 완료일 근거 · F1-06 완료 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W6`

### 🎯 Summary
같은 세그먼트의 형제 화면 2종. **"왜 이 범위인가"를 설명하는 화면**과 완료를 알리는 화면.

### 🔗 References
- SRS-002 §3.1 `/basis` (`SRS-FR-051`~`056`) · `/completion` (`SRS-FR-057`~`064`)

### ✅ Task Breakdown
- [ ] **F1-05** — 밴드 산출 근거 설명 구조
- [ ] F1-05 — 폴백 단계별 근거 표현 및 대략치 병기
- [ ] **F1-06** — 완료 표시 및 잔고 반영 안내
- [ ] F1-06 — 매매 재개 안내

### 🧪 Acceptance Criteria
**Scenario 1 — 근거가 납득된다**
- Given: 근거 화면에 진입하면
- When: 읽으면
- Then: **왜 특정 날짜가 아니라 범위인지**가 이해된다

**Scenario 2 — 완료 후 할 일이 보인다**
- Given: 완료 상태에서
- When: 화면을 보면
- Then: 매매 재개 가능 여부와 다음 행동이 파악된다

### ⚙️ Constraints
- 근거 설명이 현황판의 밴드와 **같은 값**을 보여야 한다
- 완료 화면에서 다음 상품을 권유하지 않는다

### 🏁 DoD
- [ ] 화면 2종 시안 완료
- [ ] 밴드 값 일치 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-003 · UX-011
- **Blocks:** FR-042

---

## UX-013 — F2-01 출금관리 · F2-02 수령 대상 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W3`

### 🎯 Summary
기능2의 진입 화면 2종. 부모·자식 인접 라우트라 하나로 묶었다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-065`~`071`)

### ✅ Task Breakdown
- [ ] **F2-01** — 계좌·3층 재원 현황 표시
- [ ] F2-01 — 시뮬레이션 진입 경로
- [ ] **F2-02** — 수령 대상 선택
- [ ] 계좌번호 마스킹 표기 적용

### 🧪 Acceptance Criteria
**Scenario 1 — 재원 현황이 원 단위로 보인다**
- Given: 재원 잔액이 있으면
- When: 렌더하면
- Then: 원 단위 확정 금액으로 표시된다

**Scenario 2 — 계좌번호가 마스킹된다**
- Given: 계좌번호를 표시하면
- When: 확인하면
- Then: 중간 4자리가 가려진다

### ⚙️ Constraints
- 금액 표기 규격(UX-003) 준수. 비율 단독 표기 금지

### 🏁 DoD
- [ ] 화면 2종 시안 완료
- [ ] 마스킹 표기 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002
- **Blocks:** FR-043

---

## UX-014 — F2-03 인출금액 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W4`

### 🎯 Summary
슬라이더를 움직이며 결과가 즉시 바뀌는 화면. **조작과 피드백이 붙어 있어야** 재계산 300ms의 의미가 산다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-072`~`084`) · §6.1 한도 게이지 · `Input`+`Slider` · `Collapsible` · `Select`

### ✅ Task Breakdown
- [ ] 한도 게이지(UX-005) 배치
- [ ] 인출액 `Input` + `Slider` (`SRS-FR-074`)
- [ ] 인출 사유 `Select` (`SRS-FR-076`)
- [ ] 계산 근거 `Collapsible` (`SRS-FR-075`)
- [ ] 경고·주의 `Alert` 배치 (`SRS-FR-077`·`078`)
- [ ] **모의계산 라벨 sticky** — 스크롤해도 보이게 (`SRS-FR-082`)

### 🧪 Acceptance Criteria
**Scenario 1 — 조작과 결과가 함께 보인다**
- Given: 슬라이더를 조작하면
- When: 값이 바뀌면
- Then: 결과 변화가 **같은 화면 안에서** 보인다 (스크롤해야 보이면 안 된다)

**Scenario 2 — 모의계산 라벨이 사라지지 않는다**
- Given: 화면을 스크롤하면
- When: 어느 위치에서든
- Then: 모의계산 라벨이 보인다

### ⚙️ Constraints
- ⚠️ **모의계산임이 항상 보여야 한다** (`SRS-FR-082`) — 실제 인출로 오해되면 안 된다
- 계산 근거는 매핑 문구. 세무 자문으로 읽히는 표현 금지

### 🏁 DoD
- [ ] 시안 완료
- [ ] sticky 라벨 레이아웃 검증
- [ ] 조작·결과 동시 가시성 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-003 · UX-005
- **Blocks:** FR-046

---

## UX-015 — F2-04 인출순서 결과 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:H, wave:W5`

### 🎯 Summary
기능2의 최종 산출물 화면. 3층 소진과 세액을 함께 보여준다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-085`~`101`) · §6.1 3층 시각화 · 경고 `Alert`

### ✅ Task Breakdown
- [ ] 3층 소진 시각화(UX-006) 배치
- [ ] 세액 표시 — 원 단위 (`SRS-FR-093`)
- [ ] 경고·주의 `Alert` 배치
- [ ] **세율 차단 상태 화면** (`SRS-FR-098`)
- [ ] 모의계산 라벨

### 🧪 Acceptance Criteria
**Scenario 1 — 결과가 한눈에 읽힌다**
- Given: 계산 결과가 있으면
- When: 화면을 보면
- Then: 층별 차감과 세액이 함께 파악된다

**Scenario 2 — 차단 상태가 결과를 가린다**
- Given: 세율표가 D+30을 초과하면
- When: 화면을 보면
- Then: **계산 결과 대신 차단 안내가 표시된다.** 낡은 결과를 보여주지 않는다

### ⚙️ Constraints
- ⚠️ 세액을 "절세"로 읽히게 하는 표현 금지 — 세무 자문 저촉 (세무사법 §2 4호)
- 결과를 확정 조언으로 읽히게 하는 단정 표현 금지 (금소법 §21①)

### 🏁 DoD
- [ ] 정상·차단 2개 시안
- [ ] 문구 규제 검토 완료

### 🚧 Dependencies & Blockers
- **Depends on:** UX-006 · UX-007
- **Blocks:** FR-047

---

## UX-016 — F2-05 비과세 관리 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:M, wave:W4`

### 🎯 Summary
확인서 제출 전/후 세액 비교. **제출의 실익을 스스로 판단하게** 하는 것이 목적이다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-102`~`106`)

### ✅ Task Breakdown
- [ ] 제출 전/후 나란히 비교 레이아웃 (`SRS-FR-104`)
- [ ] 차액 강조 — 원 단위 금액
- [ ] 제출 경로 안내 (대행 아님을 명시)
- [ ] 모의계산 라벨

### 🧪 Acceptance Criteria
**Scenario 1 — 차이가 즉시 보인다**
- Given: 제출 전/후 세액이 있으면
- When: 비교 화면을 보면
- Then: 차액이 원 단위 금액으로 강조되어 보인다

**Scenario 2 — 대행이 아님이 명시된다**
- Given: 제출 안내를 보면
- When: 확인하면
- Then: 이 서비스가 제출을 대행하지 않음이 분명하다

### ⚙️ Constraints
- 제출을 **권유**하는 표현 금지 — 세무 자문 저촉 위험
- 비율 단독 표기 금지

### 🏁 DoD
- [ ] 시안 완료
- [ ] 문구 규제 검토

### 🚧 Dependencies & Blockers
- **Depends on:** UX-003
- **Blocks:** FR-048

---

## UX-017 — F2-06 타명의 조회 화면 설계

**labels:** `feature, part:design, epic:DSG, complexity:L, wave:W3`

### 🎯 Summary
타명의(상속 등) 안내와 외부 딥링크. 정적 콘텐츠 중심.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-107`~`110`) — 정적 + 딥링크

### ✅ Task Breakdown
- [ ] 안내 콘텐츠 레이아웃
- [ ] 외부 딥링크 배치
- [ ] 문의 경로 안내

### 🧪 Acceptance Criteria
**Scenario 1 — 안내와 경로가 명확하다**
- Given: 화면에 진입하면
- When: 확인하면
- Then: 무엇을 해야 하고 어디로 가야 하는지 파악된다

### ⚙️ Constraints
- 정적 콘텐츠. 계산·조회 없음
- 안내 문구는 매핑 기반

### 🏁 DoD
- [ ] 시안 완료
- [ ] 딥링크 대상 확인

### 🚧 Dependencies & Blockers
- **Depends on:** UX-002
- **Blocks:** FR-049
