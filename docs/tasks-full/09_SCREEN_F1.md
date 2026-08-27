# Epic `SF1` — 화면 F1 이체 진행 조회 (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.1 · §6.2

> **전부 Server Component다.** 밴드·세액 계산은 표현 계층에서 하지 않는다 (§2.2 계층 책임 · `SRS-FR-019`).
>
> ⚠️ **§13.3 — 전문 수신 경로(OPEN-TEC-004) 확정 전까지 폴백 사다리 ③단계 기준으로만 구현 가능하다.** 5건 모두 이 제약을 받는다.
>
> **공통 제약** — `TEC-UI-001` 완료일은 `<BandDisplay>` · `TEC-UI-002` 상태는 `<StatusLabel>` · `TEC-UI-003` 금액은 `<MoneyText>`

---

## FR-038 — `/home` F1-01 홈 · 진행 알림

**labels:** `feature, part:frontend, epic:SF1, complexity:M, wave:W5`

### 🎯 Summary
진행 중인 이관을 홈에서 알린다. Prisma 직접 조회 기반 Server Component.

### 🔗 References
- SRS-002 §3.1 `/home` (`SRS-FR-001`~`007`) · §6.1 진행 카드 = `Card`

### ✅ Task Breakdown
- [ ] 진행 중 이관 조회 (Prisma 직접, Server Component)
- [ ] 진행 카드 렌더 — `<StatusLabel>` 사용
- [ ] 진행 건이 없을 때의 빈 상태 처리
- [ ] 현황판(F1-04) 진입 링크

### 🧪 Acceptance Criteria
**Scenario 1 — 진행 중이면 카드가 뜬다**
- Given: 진행 중인 이관이 있으면
- When: 홈에 진입하면
- Then: 진행 카드가 표시되고 상태가 한글 표시명으로 나온다

**Scenario 2 — 내부 enum이 노출되지 않는다**
- Given: 임의의 상태에서
- When: 홈을 렌더하면
- Then: `TransferStatus` 원본 문자열이 DOM에 나타나지 않는다 (`SRS-FR-047`)

### ⚙️ Constraints
- 성능 목표 p95 ≤ 0.8초 (`SRS-NFR-PERF-001`) — **FR-050 실측 대상**
- 계산 금지. 조회 결과만 표시

### 🏁 DoD
- [ ] 진행/빈 상태 렌더 확인
- [ ] enum 미노출 확인
- [ ] 디자인 시안(UX-008) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-005 · FR-035 · UX-008
- **Blocks:** None

---

## FR-039 — `/transfer/terms` F1-02 유의사항

**labels:** `feature, part:frontend, epic:SF1, complexity:M, wave:W6`

### 🎯 Summary
이관 전 유의사항과 약관 전문을 보여주고, 고객센터 연결 경로를 제공한다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-008`~`015`) · §6.1 약관 전문 = `ScrollArea` · 고객센터 = `Sheet`

### ✅ Task Breakdown
- [ ] 유의사항 표시 (원장 어댑터 + Prisma)
- [ ] 약관 전문 `ScrollArea` 렌더
- [ ] 고객센터 연결 `Sheet` (`SRS-FR-010`·`011`)
- [ ] 다음 단계(F1-03) 진입 조건 처리

### 🧪 Acceptance Criteria
**Scenario 1 — 약관 전문이 스크롤된다**
- Given: 긴 약관 텍스트가 있으면
- When: 화면을 렌더하면
- Then: `ScrollArea` 내부에서 스크롤되고 페이지 본문은 가로 스크롤되지 않는다

**Scenario 2 — 고객센터 시트가 열린다**
- Given: 고객센터 연결을 선택하면
- When: 시트가 열리면
- Then: 문의 경로가 표시된다

### ⚙️ Constraints
- 안내 문구는 **매핑표 기반**. 생성형 변환 금지 (SRS-002 §7.3)

### 🏁 DoD
- [ ] 약관 스크롤 동작 확인
- [ ] 고객센터 시트 확인
- [ ] 디자인 시안(UX-009) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-017 · FR-034 · UX-009
- **Blocks:** None

---

## FR-040 — `/transfer/draft` F1-03 예약 · 잠금 미리보기

**labels:** `feature, part:frontend, epic:SF1, complexity:H, wave:W8`

### 🎯 Summary
이관 예약을 만들고, **이관 후 무엇이 잠기는지 미리 보여준다.** 3그룹 판정과 밴드가 여기서 처음 고객에게 표시된다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-016`~`032`) · §6.1 3그룹 판정 = `Accordion`+`Badge` · 전송 확인 = `AlertDialog`
- SRS-002 §10 Impact — `SRS-FR-019` 병목 종목 서버 지목 · `SRS-FR-028` 감사 로그 3요소

### ✅ Task Breakdown
- [ ] `saveDraft`(FR-021) 호출 및 결과 표시
- [ ] 3그룹 판정 `Accordion` + `Badge` 렌더
- [ ] 밴드 표시 — **`<BandDisplay>` 필수**
- [ ] 잠금 미리보기 (제한 업무 `Table`)
- [ ] 전송 확인 `AlertDialog`
- [ ] **화면에 표시된 밴드 값을 `shownBand`로 전송에 전달** (`SRS-FR-028`)

### 🧪 Acceptance Criteria
**Scenario 1 — 3그룹과 밴드가 표시된다**
- Given: 예약을 저장하면
- When: 화면이 렌더되면
- Then: 보유 종목이 3그룹으로 분류되고 완료 밴드가 **두 값으로** 표시된다

**Scenario 2 — 표시값이 전송에 전달된다**
- Given: 화면에 밴드가 표시된 상태에서
- When: 전송을 확정하면
- Then: **화면에 표시된 그 값**이 `shownBand`로 서버에 전달된다 (서버 재산출값이 아니다)

**Scenario 3 (실패 흐름) — 단일 날짜가 표시되지 않는다**
- Given: 어떤 폴백 단계에서도
- When: 완료일을 표시하면
- Then: 항상 범위로 표시된다. 단일 날짜 표시 경로가 존재하지 않는다

### ⚙️ Constraints
- 병목 종목 지목은 **서버 결과만 표시**한다. 클라이언트에서 산출하지 않는다 (`SRS-FR-019`)
- ⚠️ 폴백 ③④단계에서는 `approximate` 병기 (FR-015 판정 결과 사용)

### 🏁 DoD
- [ ] 3그룹·밴드 렌더 확인
- [ ] `shownBand` 전달 확인
- [ ] 단일 날짜 표시 경로 부재 확인
- [ ] 디자인 시안(UX-010) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-017 · FR-021 · FR-035 · UX-010
- **Blocks:** FR-054

---

## FR-041 — `/transfer/[transferId]` F1-04 현황판

**labels:** `feature, part:frontend, epic:SF1, complexity:H, wave:W6`

### 🎯 Summary
이관 진행 상황을 단계별로 보여준다. **상태 12종과 예외 배너를 전부 다뤄야 하는 가장 복잡한 화면**이다. 당일 캐시된 밴드를 사용한다.

### 🔗 References
- SRS-002 §3.1 (`SRS-FR-033`~`050`) · §6.1 단계 타임라인 = `Progress`+커스텀 · 제한 업무 표 = `Table` · 예외 배너 = `Alert`
- SRS-002 §10 Impact — `SRS-FR-037` 당일 캐시

### ✅ Task Breakdown
- [ ] 단계 타임라인 렌더 (`SRS-FR-033`)
- [ ] 상태 12종 표시 — `<StatusLabel>` (`SRS-FR-047`)
- [ ] 확정/추정 구분 — `<LayerBadge>` (`SRS-FR-034`·`035`)
- [ ] 밴드 표시 — `<BandDisplay>`, **당일 캐시 값 사용** (`SRS-FR-037`)
- [ ] 제한 업무 표 (`SRS-FR-046`)
- [ ] 예외 상태 배너 (`SRS-FR-040`)
- [ ] 거절 사유 표시 — **매핑표 기반** (`SRS-FR-042`)

### 🧪 Acceptance Criteria
**Scenario 1 — 상태 12종이 전부 표시 가능하다**
- Given: 각 상태의 이관 건에 대해
- When: 현황판을 렌더하면
- Then: 12종 전부 한글 표시명과 적절한 배너로 표시된다

**Scenario 2 — 같은 날 밴드가 흔들리지 않는다**
- Given: 같은 날 현황판을 여러 번 조회하면
- When: 매번 렌더되면
- Then: **밴드 값이 동일하다** (`SRS-FR-037` 당일 캐시)

**Scenario 3 — 확정과 추정이 다르게 보인다**
- Given: `CONFIRMED` / `ESTIMATED` 데이터에 대해
- When: 렌더하면
- Then: 전자는 분단위 시각, 후자는 비단정 서술로 구분 표시된다

**Scenario 4 — 거절 사유가 매핑 문구로 나온다**
- Given: 거절된 건에 대해
- When: 사유를 표시하면
- Then: 같은 사유 코드는 **항상 같은 문구**로 표시된다 (생성형 변환 금지)

### ⚙️ Constraints
- 성능 목표 p95 ≤ 1.2초 (`SRS-NFR-PERF-002`) — **FR-050 실측 대상**
- ⚠️ 폴백 ③단계 기준 구현 (§13.3). OPEN-TEC-004 해제 후 ①②단계 활성화

### 🏁 DoD
- [ ] 상태 12종 렌더 시험 통과
- [ ] 당일 캐시 일관성 시험 통과
- [ ] 확정/추정 구분 확인
- [ ] 디자인 시안(UX-011) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-005 · FR-035 · UX-011
- **Blocks:** FR-042 · FR-054

---

## FR-042 — `/transfer/[transferId]/` 하위 — F1-05 완료일 근거 · F1-06 완료

**labels:** `feature, part:frontend, epic:SF1, complexity:M, wave:W7`

### 🎯 Summary
같은 라우트 세그먼트의 형제 화면 2종. 완료일이 왜 그 범위인지 설명하는 화면과, 완료를 알리는 화면이다.

### 🔗 References
- SRS-002 §3.1 `/basis` (`SRS-FR-051`~`056`) · `/completion` (`SRS-FR-057`~`064`)

### ✅ Task Breakdown
- [ ] **F1-05 완료일 근거** — 밴드 산출 근거 표시 (`SRS-FR-051`~`056`)
- [ ] F1-05 — 폴백 단계별 근거 문구 분기, `approximate`면 대략치 병기
- [ ] **F1-06 완료** — 완료 상태 표시 및 잔고 반영 안내 (`SRS-FR-057`~`064`)
- [ ] F1-06 — 매매 재개 안내
- [ ] 두 화면 모두 현황판(F1-04)에서 진입

### 🧪 Acceptance Criteria
**Scenario 1 — 근거가 밴드와 일치한다**
- Given: 현황판에 표시된 밴드에 대해
- When: 근거 화면에 진입하면
- Then: **같은 밴드 값**에 대한 산출 근거가 표시된다 (두 화면의 값이 다르면 안 된다)

**Scenario 2 — 폴백 단계가 근거에 드러난다**
- Given: 폴백 ③단계 상태에서
- When: 근거를 표시하면
- Then: 대략치임이 명시된다 (`approximate`)

**Scenario 3 — 완료 화면이 재개를 안내한다**
- Given: 완료 상태에서
- When: 완료 화면에 진입하면
- Then: 잔고 반영 여부와 매매 재개 가능 여부가 표시된다

### ⚙️ Constraints
- 근거 문구는 매핑 기반. 생성형 변환 금지
- 두 화면의 밴드 값은 **동일 출처(당일 캐시)** 를 써야 한다

### 🏁 DoD
- [ ] 화면 2종 렌더 확인
- [ ] 현황판과 밴드 값 일치 시험 통과
- [ ] 디자인 시안(UX-012) 대조 일치

### 🚧 Dependencies & Blockers
- **Depends on:** FR-012 · FR-041 · UX-012
- **Blocks:** FR-054
