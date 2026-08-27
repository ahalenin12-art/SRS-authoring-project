# Epic `DOM` — Domain Engine

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §2.3 · §5.4 · §9.3

> **이 Epic 전체가 I/O 없는 순수 TypeScript다.** DB도 화면도 없이 검증할 수 있어 **가장 먼저 끝나야 한다.** 선행이 FR-001 하나뿐이라 W2에 6건을 동시 착수할 수 있다.
>
> 공통 제약: `TEC-DOM-001` Prisma import 금지 · `TEC-DOM-002` 순수 함수(`Date.now()` 등은 인자로) · `TEC-DOM-003` 금액은 `Decimal`

---

## 이 Epic의 태스크 9건

| ID | 태스크 | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: |
| [FR-008](FR-008.md) | `business-day.ts` 영업일 · Cut-off 엔진 | H | W2 |
| [FR-009](FR-009.md) | `pension-limit.ts` 연금수령한도 산출 | H | W2 |
| [FR-010](FR-010.md) | `withdrawal-order.ts` 3층 재원 인출순서 판정 | H | W2 |
| [FR-011](FR-011.md) | `tax.ts` 세액 산출 | H | W3 |
| [FR-012](FR-012.md) | `band.ts` 완료일 밴드 산출 | H | W3 |
| [FR-013](FR-013.md) | `state-machine.ts` 상태 전이 판정 | H | W3 |
| [FR-014](FR-014.md) | `trading-window.ts` 매매 가능 판정 | M | W2 |
| [FR-015](FR-015.md) | 폴백 사다리 단계 판정 및 `approximate` 산출 | M | W4 |
| [FR-016](FR-016.md) | 검증 데이터셋 6건 단위 시험 및 배포 전 회귀 게이트 | M | W4 |

---

**색인** → [00_INDEX.md](00_INDEX.md)
