# 연금플러스 — 문서 색인

| 항목 | 내용 |
| --- | --- |
| 문서 ID | DOC-INDEX-001 |
| 최종 갱신 | 2026-08-25 |
| 대상 서비스 | 연금계좌 이체 진행 조회(기능1) · 인출순서 시뮬레이터(기능2) |

---

## 1. 문서 계보

문서는 **위에서 아래로 근거가 흐른다.** 아래 문서는 위 문서를 인용하되 위 문서의 결정을 바꾸지 않는다.

```
프로토타입 (V7 HTML)
   │
   ├─ PRD v3.1 ──────────────── 무엇을 왜 만드는가 (FR 83 · AC 76 · Gate 3)
   │     │
   │     ├─ SRS v1.0 ─────────── 무엇을 만드는가 (REQ-FUNC/NF)
   │     │
   │     └─ SRS-002 ─────────── 정해진 기술로 어떻게 만드는가 (TEC 49 · 충돌 7)
   │            │
   │            ├─ 태스크 v1.0 (102건) ── 무엇을 작업 단위로 자르는가
   │            │      │
   │            │      ├─ [분석] 추출 방법론 적합성 평가 ── 잘 잘랐는가
   │            │      └─ [분석] 축약 수행 결과 검증 ───── 줄여도 되는가
   │            │             │
   │            │             └─ 태스크 v2.0 (67건) ───── 실행 기준
   │            │                     │
   │            │                     ├─ [총괄] 개발 실행 계획 ── 언제 누가
   │            │                     ├─ [총괄] 압축 수행 일정 ── 더 빨리 하려면
   │            │                     └─ tasks-full/ ────────── 착수 가능한 단위까지
   │            │
   │            └─ 설계 문서 8종 (design/)
   │
   └─ 학습 자료 2종 (guide/)
```

---

## 2. 문서 목록

### 2.1 요구사항

| 문서 | 위치 | 역할 |
| --- | --- | --- |
| PRD v3.1 | [source/ai-place-prd-v3_1.md](../source/ai-place-prd-v3_1.md) | Source of Truth. FR 83 · GWT 76 · 상태 설계 · 컴플라이언스 11 · Gate 3 |
| SRS v1.0 | [ai-place-srs-v1_0.md](../ai-place-srs-v1_0.md) | PRD를 요구사항 명세로 변환 |
| **SRS-002** | [SRS/srs-002-pension-plus-nextjs-v1_0.md](../SRS/srs-002-pension-plus-nextjs-v1_0.md) | **기술 제약(C-TEC 7) 반영판.** 라우트 19 · Action 7 · 모델 16 · 충돌 7 · 미해결 7 |
| 프로토타입 | [source/통합_프로토타입_최종_V7.md](../source/통합_프로토타입_최종_V7.md) | 원본 HTML의 무손실 Markdown 변환 |

### 2.2 태스크

| 문서 | 위치 | 건수 | 역할 |
| --- | --- | ---: | --- |
| 태스크 v1.0 | [tasks/task-breakdown-v1-full.md](../tasks/task-breakdown-v1-full.md) | 102 | 전체판. **추적용** |
| **태스크 v2.0** | [tasks/task-breakdown-v2-merged.md](../tasks/task-breakdown-v2-merged.md) | **67** | 병합 66 + 감사 보정 1. **실행 기준** |
| 풀버전 | [docs/tasks-full/](./tasks-full/) | 67 | 이슈 템플릿 형식. 착수 가능한 단위 |

### 2.3 분석

| 문서 | 결론 |
| --- | --- |
| [[분석] 태스크 추출 방법론 적합성 평가](./%5B%EB%B6%84%EC%84%9D%5D%20%ED%83%9C%EC%8A%A4%ED%81%AC%20%EC%B6%94%EC%B6%9C%20%EB%B0%A9%EB%B2%95%EB%A1%A0%20%EC%A0%81%ED%95%A9%EC%84%B1%20%ED%8F%89%EA%B0%80%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | **조건부 적합.** 결함 3건 중 1건만 태스크 추가(FR-050), 2건은 상위 문서로 이관 |
| [[분석] 태스크 축약 수행 결과 검증](./%5B%EB%B6%84%EC%84%9D%5D%20%ED%83%9C%EC%8A%A4%ED%81%AC%20%EC%B6%95%EC%95%BD%20%EC%88%98%ED%96%89%20%EA%B2%B0%EA%B3%BC%20%EA%B2%80%EC%A6%9D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | **타당하나 기간은 안 줄었다.** 102→66으로 공수 −72일이지만 최단 기간은 **+3일** |

### 2.4 총괄

| 문서 | 결론 |
| --- | --- |
| [[총괄] 개발 실행 계획](./%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | **표준안 dev4/des2 · 57일** (대외 63일). 임계 경로 39일 · 즉시 착수 59건 |
| [[총괄] 압축 수행 일정](./%5B%EC%B4%9D%EA%B4%84%5D%20%EC%95%95%EC%B6%95%20%EC%88%98%ED%96%89%20%EC%9D%BC%EC%A0%95%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | **압축안 dev5/des2 · 45일.** dev6부터 단축 효과 0. **범위 분리가 인원 추가보다 싸다** |

### 2.5 설계·학습

| 문서 | 위치 |
| --- | --- |
| 설계 문서 8종 (UseCase · ERD · CLD · Component · Sequence · State · Flowchart · CLD) | [design/](../design/) |
| SRS 독해 가이드 (PM용 24장) | [guide/srs-002-pm-study-guide.html](../guide/srs-002-pm-study-guide.html) |
| PM 엔지니어링 로드맵 (30장 · 17키워드) | [guide/pm-engineering-roadmap.html](../guide/pm-engineering-roadmap.html) |

---

## 3. 핵심 수치

| 항목 | 값 | 출처 |
| --- | ---: | --- |
| 기능 요구사항 (FR) | 83 | PRD §5 |
| 인수 기준 (GWT) | 76 | PRD §5 |
| 기술 규약 (TEC-*) | 49 | SRS-002 §12.1 |
| 제약 충돌 | 7 | SRS-002 §9 |
| 기술 미해결 (OPEN-TEC) | 7 | SRS-002 §11 |
| **실행 태스크** | **67** | 태스크 v2.0 |
| 총 공수 (1인 환산) | 287일 | `tools/dag.mjs` |
| **임계 경로 (기간 하한)** | **39일** | `tools/dag.mjs` |
| 표준 편성 기간 | 57일 | `tools/sched.mjs` |
| 차단 무관 즉시 착수 | 59건 (88%) | `tools/blocked.mjs` |

---

## 4. 착수 판정

**CONDITIONAL READY FOR IMPLEMENTATION** (SRS-002 §13.1)

| 구분 | 건수 | 항목 |
| --- | :---: | --- |
| **Blocks Development** | 2 | OPEN-TEC-004 전문 수신 경로 · OPEN-TEC-007 본인 인증 수단 |
| **Blocks Release** | 3 | OPEN-TEC-001 60초 알림 · OPEN-TEC-003 응답 시간 실측 · OPEN-TEC-005 규제 적합성 |
| 승계된 PRD Gate | 3 | SYS-Q3 · SYS-Q7 (Phase 1 착수) · LEGAL-Q1 (기능2 Release) |

> **미해결 5건이 잡고 있는 것은 67건 중 8건(12%)뿐이다.** 나머지 59건은 조건 없이 착수할 수 있다. 답변 기한은 [개발 실행 계획 §3.4](./%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)에 날짜로 계산되어 있다.

---

## 5. 계산 재현

일정·의존성 수치는 전부 태스크 리스트에서 자동 산출된다. 문서를 손으로 고치지 말고 재계산한다.

```bash
node tools/dag.mjs      # 웨이브 · 임계 경로 · 병목 · Epic별 공수
node tools/sched.mjs    # 편성안별 기간 · 가동률 · 주차 배치
node tools/blocked.mjs  # 차단 태스크 답변 기한
node tools/cmp.mjs      # v1 · v2 비교
```

**소요 모델 `L=1일 · M=3일 · H=6일`은 가정이다.** 팀 실측 속도가 확보되면 각 스크립트의 `DUR` 상수를 교체하고 전 문서를 재계산해야 한다.
