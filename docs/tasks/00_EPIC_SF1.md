# Epic `SF1` — 화면 F1 이체 진행 조회 (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.1 · §6.2

> **전부 Server Component다.** 밴드·세액 계산은 표현 계층에서 하지 않는다 (§2.2 계층 책임 · `SRS-FR-019`).
>
> ⚠️ **§13.3 — 전문 수신 경로(OPEN-TEC-004) 확정 전까지 폴백 사다리 ③단계 기준으로만 구현 가능하다.** 5건 모두 이 제약을 받는다.
>
> **공통 제약** — `TEC-UI-001` 완료일은 `<BandDisplay>` · `TEC-UI-002` 상태는 `<StatusLabel>` · `TEC-UI-003` 금액은 `<MoneyText>`

---

## 이 Epic의 태스크 5건

| ID | 태스크 | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: |
| [FR-038](FR-038.md) | `/home` F1-01 홈 · 진행 알림 | M | W5 |
| [FR-039](FR-039.md) | `/transfer/terms` F1-02 유의사항 | M | W6 |
| [FR-040](FR-040.md) | `/transfer/draft` F1-03 예약 · 잠금 미리보기 | H | W8 |
| [FR-041](FR-041.md) | `/transfer/[transferId]` F1-04 현황판 | H | W6 |
| [FR-042](FR-042.md) | `/transfer/[transferId]/` 하위 — F1-05 완료일 근거 · F1-06 완료 | M | W7 |

---

**색인** → [00_INDEX.md](00_INDEX.md)
