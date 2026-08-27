# SRS 작성 프로젝트 — 연금플러스

연금계좌 이체 진행 조회(기능1)와 인출순서 시뮬레이터(기능2)의 **요구사항 문서 · 설계 문서 · 개발 태스크 · 실행 계획** 일체.

**시작점 → [docs/00_INDEX.md](docs/00_INDEX.md)**

---

## 무엇이 있는가

| 단계 | 문서 | 결론 |
| --- | --- | --- |
| 요구사항 | [01 PRD v3.1](docs/01_PRD_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_v3.1.md) | FR 83 · GWT 76 · Gate 3 |
| | [02 SRS v1.0](docs/02_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_v1.0.md) | 요구사항 명세 |
| | [03 SRS ISO29148 v0.1](docs/03_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_ISO29148_v0.1.md) | 표준 양식판 |
| | [04 SRS 기술제약반영 v1.0](docs/04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) | **CONDITIONAL READY** · 충돌 7 · 미해결 7 |
| 설계 | [design/](docs/design/) | 다이어그램 9종 |
| 태스크 | [05 전체판](docs/05_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EC%A0%84%EC%B2%B4%ED%8C%90.md) | 102건 (추적용) |
| | [06 병합판](docs/06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) | **67건 (실행 기준)** |
| | [tasks-full/](docs/tasks-full/) | 착수 가능한 단위 67건 |
| 분석 | [07 적합성 평가](docs/07_%5B%EB%B6%84%EC%84%9D%5D%20%ED%83%9C%EC%8A%A4%ED%81%AC%20%EC%B6%94%EC%B6%9C%20%EB%B0%A9%EB%B2%95%EB%A1%A0%20%EC%A0%81%ED%95%A9%EC%84%B1%20%ED%8F%89%EA%B0%80%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | **조건부 적합** — 결함 3건 중 1건 보정 |
| | [08 축약 검증](docs/08_%5B%EB%B6%84%EC%84%9D%5D%20%ED%83%9C%EC%8A%A4%ED%81%AC%20%EC%B6%95%EC%95%BD%20%EC%88%98%ED%96%89%20%EA%B2%B0%EA%B3%BC%20%EA%B2%80%EC%A6%9D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | 공수 −72일, **기간은 +3일** |
| 계획 | [09 개발 실행 계획](docs/09_%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | **표준안 dev4/des2 · 57일** |
| | [10 압축 수행 일정](docs/10_%5B%EC%B4%9D%EA%B4%84%5D%20%EC%95%95%EC%B6%95%20%EC%88%98%ED%96%89%20%EC%9D%BC%EC%A0%95%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md) | 압축안 dev5/des2 · 45일 |
| 학습 | [guide/](docs/guide/) | PM용 HTML 덱 2종 |

---

## 이 프로젝트의 원칙

**① 문서에 없는 기능을 만들지 않는다.**
태스크는 SRS 조항에서만 도출했다. 근거가 없는 항목은 태스크로 만들지 않고 소관 문서로 되돌렸다 — [07 적합성 평가](docs/07_%5B%EB%B6%84%EC%84%9D%5D%20%ED%83%9C%EC%8A%A4%ED%81%AC%20%EC%B6%94%EC%B6%9C%20%EB%B0%A9%EB%B2%95%EB%A1%A0%20%EC%A0%81%ED%95%A9%EC%84%B1%20%ED%8F%89%EA%B0%80%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)가 결함 3건 중 1건만 보정하고 2건을 이관한 이유다.

**② 숫자를 지어내지 않는다.**
일정·임계 경로·병목은 전부 [tools/](tools/)의 스크립트가 태스크 리스트를 파싱해 계산한 값이다. 손으로 유추한 수치가 없다.

**③ 미해결을 숨기지 않는다.**
기술 제약과 충돌하는 지점 7건, 답을 받아야 하는 항목 7건을 별도 장으로 기록했다. 완화 가능한 것과 잔여 위험을 나눠 적었다.

---

## 제약이 지켜지게 하는 장치

SRS가 정한 기술 규약 **50건**은 문서에만 있으면 구현 단계에서 지켜지지 않는다. AI 코딩 도구가 코드를 쓰기 전에 읽는 규칙으로 옮겨 두었다.

| 스킬 | 무엇을 막는가 | 근거 |
| --- | --- | --- |
| [`300-tech-constraints-guardrails`](.claude/skills/300-tech-constraints-guardrails/SKILL.md) | 확정 제약 우회 — 별도 서버·워커·캐시 서버 추가 등 | C-TEC-001~007 |
| [`301-server-boundary-rules`](.claude/skills/301-server-boundary-rules/SKILL.md) | Server Action / Route Handler 오배치 · 트랜잭션 경계 위반 | SRS §4 |
| [`302-data-access-rules`](.claude/skills/302-data-access-rules/SKILL.md) | 도메인 모듈 오염 · 부동소수 금액 · 물리 제약 제거 | SRS §5 |
| [`303-display-rules`](.claude/skills/303-display-rules/SKILL.md) | 단일 날짜 표시 · enum 노출 · 규제 저촉 문구 | SRS §6 |

진입점은 [CLAUDE.md](CLAUDE.md)다. **구현이 시작되기 전까지는 대기 상태**이며, 코드를 쓰는 순간부터 발동한다.

---

## 계산 재현

```bash
node tools/dag.mjs      # 웨이브 · 임계 경로 · 병목
node tools/sched.mjs    # 편성안별 기간 · 가동률
node tools/blocked.mjs  # 차단 태스크 답변 기한
node tools/deps.mjs     # 선행 · 후행
node tools/cmp.mjs      # 전체판 · 병합판 비교
node tools/linkcheck.mjs # 문서 링크 무결성 검사
```

소요 모델(`L=1 · M=3 · H=6` 영업일)은 **가정**이다. 실측 확보 시 `DUR` 상수를 교체하면 전 문서 수치가 재계산된다.

---

## 구조

```
CLAUDE.md             AI 에이전트 작업 지침 (하네스 진입점)
.claude/skills/       기술 제약 가드레일 4종
.github/ISSUE_TEMPLATE/  태스크 이슈 템플릿
docs/                 문서 일체 — 01~10 최상위 + 3개 폴더
├── design/           설계 다이어그램 9
├── tasks-full/       풀버전 태스크 13
└── guide/            학습 자료 2
source/               원본 프로토타입 (변경하지 않음)
tools/                계산·검사 스크립트 6
```

---

## 면책

학습·포트폴리오 목적의 문서다. 실제 금융 서비스 적용에는 법무·정보보호·컴플라이언스 검토가 별도로 필요하다 — [04 SRS §9.7](docs/04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md)에 그 한계를 기록했다.
