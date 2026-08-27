# Epic `SF2` — 화면 F2 인출순서 시뮬레이터 (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.1 · §9.3

> **F2-03·F2-04만 Client Component가 주도한다.** `SRS-NFR-PERF-005`가 인출액 변경 시 **p95 ≤ 300ms 재계산**을 요구하는데, 서버 왕복으로는 이 임계를 안정적으로 지킬 수 없다 (§9.3 CONFLICT-03).
>
> ⚠️ **기능2 전체가 LEGAL-Q1(투자자문업 해당 여부)에 걸려 있다.** 개발은 가능하되 **출시는 법무 판정 후**다 (§13.3). 기능1은 영향받지 않는다.

---

## 이 Epic의 태스크 7건

| ID | 태스크 | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: |
| [FR-043](FR-043.md) | `/withdrawal` F2-01 출금관리 · F2-02 수령 대상 | M | W4 |
| [FR-044](FR-044.md) | 도메인 계산 모듈 클라이언트 동시 실행 구성 | H | W4 |
| [FR-045](FR-045.md) | 세율표 버전 동기화 및 클라이언트 계산 무효화 | H | W6 |
| [FR-046](FR-046.md) | `/withdrawal/amount` F2-03 인출금액 (Client 주도) | H | W8 |
| [FR-047](FR-047.md) | `/withdrawal/result` F2-04 인출순서 결과 (Client 주도) | H | W7 |
| [FR-048](FR-048.md) | `/withdrawal/tax-free` F2-05 비과세 관리 | M | W8 |
| [FR-049](FR-049.md) | `/withdrawal/inheritance` F2-06 타명의 조회 | L | W4 |

---

**색인** → [00_INDEX.md](00_INDEX.md)
