---
name: 개발 태스크
about: 연금플러스 태스크 리스트(FR-* / UX-*)의 1건을 이슈로 올린다
title: '[FR-000] 태스크 제목'
labels: feature
assignees: ''
---

<!--
근거: docs/06_[태스크 리스트] 연금플러스_병합판.md
상세: docs/tasks/<태스크ID>.md 의 내용을 그대로 옮긴다 (1파일 = 1이슈).
선행·후행은 손으로 유추하지 않는다 — `node tools/deps.mjs` 출력을 사용한다.
-->

**labels:** `feature, part:backend, epic:PLT, complexity:M, wave:W1`

<!--
관점   part:backend | part:frontend | part:infra | part:design
도메인 epic:PLT | DAT | DOM | ADP | ACT | ITG | BAT | UIF | SF1 | SF2 | QLT | TST | DSG
복잡도 complexity:H | M | L
착수   wave:W1 ~ wave:W8
특수   critical-path (9건만) | blocked (5건만)
-->

## 🎯 Summary

<!-- 목적 한두 줄. 왜 이게 필요한지. -->

## 🔗 References

<!--
- SRS §N.N 조항 — 이 태스크의 근거
- 태스크 리스트 해당 행
-->

## ✅ Task Breakdown

- [ ]
- [ ]
- [ ]

## 🧪 Acceptance Criteria

**Scenario 1 — <정상 흐름>**
- Given:
- When:
- Then:

**Scenario 2 (실패 흐름) — <위반이 차단되는지>**
- Given:
- When:
- Then: **실패해야 한다**

<!--
실패 흐름을 반드시 하나 이상 넣는다.
규칙 강제 태스크는 "위반 시 컴파일/빌드/DB가 거부한다"를 시나리오로 쓴다.
-->

## ⚙️ Constraints

<!--
- `TEC-*` 규약 ID와 내용
- 성능 목표가 있으면 p95 값과 FR-050 실측 대상 여부
- ⚠️ 미해결(OPEN-TEC-*)에 걸린다면 명시
-->

## 🏁 Definition of Done

- [ ]
- [ ]
- [ ] 관련 시험 통과

## 🚧 Dependencies & Blockers

- **Depends on:**
- **Blocks:**

<!--
⚠️ 임계 경로 9건 — FR-001 · FR-003 · FR-005 · FR-007 · FR-019 · FR-020 · FR-021 · FR-022 · FR-052
   이 중 하나면 `critical-path` 라벨을 붙이고 지연 시 즉시 에스컬레이션한다.

⛔ 차단 5건 — FR-018 · FR-022 · FR-028 · FR-032 · FR-033
   `blocked` 라벨 + 답변 기한을 적는다. 기한 −5일에 에스컬레이션.
-->
