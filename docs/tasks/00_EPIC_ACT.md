# Epic `ACT` — Server Actions

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §4

> **임계 경로 4건이 이 Epic에 있다** — FR-019 → FR-020 → FR-021 → FR-022. 39일 중 21일이 여기서 소비된다.
>
> 공통 제약: `TEC-ACT-001` 예외를 던지지 않고 `ActionResult<T>` 반환 · `TEC-ACT-003` 입력을 **서버에서 재검증** · `TEC-ACT-004` 소유권 검증을 진입 직후

---

## 이 Epic의 태스크 7건

| ID | 태스크 | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: |
| [FR-019](FR-019.md) | Server Action 공통 기반 (`ActionResult<T>` · 소유권 가드) | M | W5 |
| [FR-020](FR-020.md) | `requestId` 멱등 처리 공통 모듈 | H | W6 |
| [FR-021](FR-021.md) | `saveDraft` (예약 저장 · 3그룹 판정 · 밴드 산출) | H | W7 |
| [FR-022](FR-022.md) | `submitTransfer` (전송 확정 + 감사 로그 원자 트랜잭션) | H | W8 |
| [FR-023](FR-023.md) | `simulateWithdrawal` (층별 차감 · 세액 모의계산) | H | W6 |
| [FR-024](FR-024.md) | 예약 갱신 · 취소 액션 (`updateDraft` · `cancelTransfer`) | M | W8 |
| [FR-025](FR-025.md) | 읽기 전용 조회 액션 (`getPensionLimit` · `compareWithCertificate`) | M | W7 |

---

**색인** → [00_INDEX.md](00_INDEX.md)
