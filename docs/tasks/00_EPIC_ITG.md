# Epic `ITG` — System Integration

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.2 · §4.1 · §9.1 · §9.6

> **Route Handler를 쓰는 이유** (§4.1 판정 기준): 호출자가 **시스템**이라 고객 세션이 없고, 응답을 상대가 파싱하므로 구조화된 응답 계약이 필요하다.

---

## 이 Epic의 태스크 4건

| ID | 태스크 | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: |
| [FR-026](FR-026.md) | Route Handler 인증 공통 (시스템 간 · Cron) | M | W2 |
| [FR-027](FR-027.md) | `GET /api/internal/trading-window` 매매 가능 판정 응답 | H | W3 |
| [FR-028](FR-028.md) | `POST /api/internal/stage-events` 전문 수신 | H | W5 |
| [FR-029](FR-029.md) | `POST /api/internal/settlement` 잔고 반영 통보 수신 | M | W4 |

---

**색인** → [00_INDEX.md](00_INDEX.md)
