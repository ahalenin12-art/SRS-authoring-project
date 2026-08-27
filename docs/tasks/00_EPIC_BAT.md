# Epic `BAT` — Batch (Vercel Cron)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.3 · §8.3 · §9.2 · §9.5

> **공통 제약** — `TEC-BATCH-001` 시크릿 검증 · `TEC-BATCH-002` 진입 직후 영업일 검증 · `TEC-BATCH-003` 멱등 · `TEC-BATCH-004` 페이지 분할 · `TEC-BATCH-005` 실행 결과 로그
>
> **Vercel Cron은 UTC 기준이고 공휴일을 모른다.** 핸들러가 직접 영업일을 판정해야 한다.

---

## 이 Epic의 태스크 4건

| ID | 태스크 | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: |
| [FR-030](FR-030.md) | 배치 공통 가드 (영업일 검증 · 페이지 분할 · 실행 로그) | M | W3 |
| [FR-031](FR-031.md) | `/api/cron/band-recalc` 밴드 재계산 (멱등 갱신) | H | W4 |
| [FR-032](FR-032.md) | `/api/cron/reconcile` 3자 정합성 보정 | H | W4 |
| [FR-033](FR-033.md) | 정기 점검 배치 2종 + `vercel.json` 스케줄 선언 | M | W5 |

---

**색인** → [00_INDEX.md](00_INDEX.md)
