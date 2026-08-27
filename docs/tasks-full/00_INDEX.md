# [풀버전 태스크] 연금플러스 — 색인

| 항목 | 내용 |
| --- | --- |
| 문서 ID | TASK-FULL-001 |
| 작성일 | 2026-08-25 |
| 근거 | [tasks/task-breakdown-v2-merged.md](../../tasks/task-breakdown-v2-merged.md) — 67건. 본 폴더가 그 풀버전이다 |
| 형식 | GitHub 이슈 템플릿 구조 — Summary · References · Task Breakdown · Acceptance Criteria · Constraints · DoD · Dependencies |

> **선행(Depends on)·후행(Blocks)은 손으로 유추하지 않았다.** 태스크 리스트의 의존 관계를 `tools/deps.mjs`가 파싱해 생성한 값이다. 값이 어긋나면 **태스크 리스트가 원천**이므로 그쪽을 먼저 고치고 이 폴더를 재동기화한다.

---

## 읽는 순서 = 추출 순서

작성 순서는 실행 순서가 아니라 **추출 순서**다. 기반이 확정되어야 그 위 문서가 인용할 수 있다.

| 단계 | 파일 | Epic | 건수 | 왜 이 순서인가 |
| --- | --- | :---: | ---: | --- |
| **P1 기반** | [01_PLATFORM.md](01_PLATFORM.md) | PLT | 4 | 이게 없으면 착수할 자리가 없다 |
| | [02_DATA.md](02_DATA.md) | DAT | 3 | 이후 모든 계층이 참조할 스키마 |
| | [03_DOMAIN.md](03_DOMAIN.md) | DOM | 9 | I/O 없는 순수 계산. **DB·화면 없이 검증 가능** |
| | [04_ADAPTER.md](04_ADAPTER.md) | ADP | 2 | 외부 연동 경계 |
| **P2 서버** | [05_ACTION.md](05_ACTION.md) | ACT | 7 | 고객 액션. 임계 경로 4건이 여기 |
| | [06_INTEGRATION.md](06_INTEGRATION.md) | ITG | 4 | 시스템 간 연동 |
| | [07_BATCH.md](07_BATCH.md) | BAT | 4 | Cron. 도메인·어댑터에 종속 |
| **P3 화면** | [08_UI.md](08_UI.md) | UIF | 4 | 컴포넌트 기반. 디자인 트랙과 만나는 지점 |
| | [09_SCREEN_F1.md](09_SCREEN_F1.md) | SF1 | 5 | 이체 진행 조회 |
| | [10_SCREEN_F2.md](10_SCREEN_F2.md) | SF2 | 7 | 인출순서 시뮬레이터. 기능1과 의존 없음 |
| **P4 품질** | [11_QUALITY.md](11_QUALITY.md) | QLT | 1 | 성능 실측. 앞 단계가 있어야 잴 대상이 생긴다 |
| **디자인** | [12_DESIGN.md](12_DESIGN.md) | DSG | 17 | 개발과 병행. UX-002·UX-003이 프론트를 막는다 |

**총 67건.**

---

## Epic별 대조

| Epic | 코드 | 태스크 리스트 | 이 폴더 | 일치 |
| --- | :---: | ---: | ---: | :---: |
| Platform | PLT | 4 | 4 | ✅ |
| Data Layer | DAT | 3 | 3 | ✅ |
| Domain Engine | DOM | 9 | 9 | ✅ |
| Adapters | ADP | 2 | 2 | ✅ |
| Server Actions | ACT | 7 | 7 | ✅ |
| System Integration | ITG | 4 | 4 | ✅ |
| Batch | BAT | 4 | 4 | ✅ |
| UI Foundation | UIF | 4 | 4 | ✅ |
| 화면 F1 | SF1 | 5 | 5 | ✅ |
| 화면 F2 | SF2 | 7 | 7 | ✅ |
| Quality Gate | QLT | 1 | 1 | ✅ |
| 디자인 (전 Epic) | DSG | 17 | 17 | ✅ |
| **합계** | | **67** | **67** | ✅ |

---

## 라벨 규약 (GitHub Project로 옮길 때)

```
유형   feature | chore | test
관점   part:backend | part:frontend | part:infra | part:design
도메인 epic:PLT | epic:DAT | epic:DOM | epic:ADP | epic:ACT | epic:ITG
       epic:BAT | epic:UIF | epic:SF1 | epic:SF2 | epic:QLT | epic:DSG
복잡도 complexity:H | complexity:M | complexity:L
착수   wave:W1 ~ wave:W8
특수   critical-path | blocked
```

`critical-path` 라벨은 8건에만 붙는다 — **FR-001 · FR-003 · FR-005 · FR-007 · FR-019 · FR-020 · FR-021 · FR-022.** 이 8건의 지연은 곧 전체 지연이다.

`blocked` 라벨은 5건에 붙는다 — **FR-018 · FR-022 · FR-028 · FR-032 · FR-033.**

---

## 착수 우선순위

후행이 많은 순. [개발 실행 계획 §2.3](../%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) 참조.

| 순위 | 태스크 | 직접 후행 | 전이 후행 | 파일 |
| :---: | --- | ---: | ---: | --- |
| 1 | FR-001 | 14 | **46** | [01_PLATFORM](01_PLATFORM.md) |
| 2 | FR-002 | 3 | 31 | [01_PLATFORM](01_PLATFORM.md) |
| 3 | UX-001 | 2 | 30 | [12_DESIGN](12_DESIGN.md) |
| 4 | UX-002 | 10 | 28 | [12_DESIGN](12_DESIGN.md) |
| 5 | FR-003 | 3 | 24 | [01_PLATFORM](01_PLATFORM.md) |
| 6 | UX-003 | 10 | 21 | [12_DESIGN](12_DESIGN.md) |
| 7 | FR-005 | 6 | 19 | [02_DATA](02_DATA.md) |
| 8 | FR-008 | 2 | 14 | [03_DOMAIN](03_DOMAIN.md) |

---

## 재동기화

```bash
node tools/deps.mjs   # 선행·후행 재생성 → 각 파일의 Dependencies 절과 대조
node tools/dag.mjs    # 웨이브·임계 경로 재계산
```
