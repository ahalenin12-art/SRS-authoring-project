# 태스크 색인 — 연금플러스

| 항목 | 내용 |
| --- | --- |
| 문서 ID | TASK-DETAIL-001 |
| 작성일 | 2026-08-27 |
| 근거 | [06 태스크 리스트 병합판](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) — 72건 |
| 구성 | **태스크당 1파일 72개** + Epic 개요 13개 |
| 형식 | GitHub 이슈 템플릿 — Summary · References · Task Breakdown · AC · Constraints · DoD · Dependencies |

> **파일 1개 = 태스크 1건 = 이슈 1건.** 태스크를 고칠 때 그 파일만 바뀌고, `docs/tasks/FR-001.md`로 직접 링크된다.
>
> **Epic 공통 제약은 `00_EPIC_*.md`에 있다.** 태스크 파일만 보고 구현하지 않는다 — 도메인 격리·표기 규약 같은 것이 개요에 있다.
>
> 선행·후행은 `node tools/deps.mjs`가 태스크 리스트에서 생성한 값이다. **손으로 유추하지 않았다.**

---

## Epic 13종 · 총 72건

| 단계 | Epic 개요 | 코드 | 건수 | 성격 |
| --- | --- | :---: | ---: | --- |
| **P1 기반** | [00_EPIC_PLT.md](00_EPIC_PLT.md) | `PLT` | 4 | 이게 없으면 착수할 자리가 없다 |
|  | [00_EPIC_DAT.md](00_EPIC_DAT.md) | `DAT` | 3 | 이후 모든 계층이 참조할 스키마 |
|  | [00_EPIC_DOM.md](00_EPIC_DOM.md) | `DOM` | 9 | I/O 없는 순수 계산. **DB·화면 없이 검증 가능** |
|  | [00_EPIC_ADP.md](00_EPIC_ADP.md) | `ADP` | 2 | 외부 연동 경계 |
| **P2 서버** | [00_EPIC_ACT.md](00_EPIC_ACT.md) | `ACT` | 7 | 고객 액션. 임계 경로 4건이 여기 |
|  | [00_EPIC_ITG.md](00_EPIC_ITG.md) | `ITG` | 4 | 시스템 간 연동 |
|  | [00_EPIC_BAT.md](00_EPIC_BAT.md) | `BAT` | 4 | Cron. 도메인·어댑터에 종속 |
| **P3 화면** | [00_EPIC_UIF.md](00_EPIC_UIF.md) | `UIF` | 4 | 컴포넌트 기반. 디자인 트랙과 만나는 지점 |
|  | [00_EPIC_SF1.md](00_EPIC_SF1.md) | `SF1` | 5 | 이체 진행 조회 |
|  | [00_EPIC_SF2.md](00_EPIC_SF2.md) | `SF2` | 7 | 인출순서 시뮬레이터. 기능1과 의존 없음 |
| **P4 품질** | [00_EPIC_QLT.md](00_EPIC_QLT.md) | `QLT` | 1 | 성능 실측. 앞 단계가 있어야 잴 대상이 생긴다 |
|  | [00_EPIC_TST.md](00_EPIC_TST.md) | `TST` | 5 | 요구사항 추적 · 전이 통합 · 예외 계열 · E2E |
| **디자인** | [00_EPIC_DSG.md](00_EPIC_DSG.md) | `DSG` | 17 | 개발과 병행. UX-002·UX-003이 프론트를 막는다 |
| | | **합계** | **72** | |

---

## 임계 경로 9건

이 9건의 지연은 곧 전체 지연이다. `critical-path` 라벨을 붙이고 **매일** 확인한다.

1. [FR-001](FR-001.md) — 리포지토리 스캐폴딩 및 5계층 구조 수립
2. [FR-003](FR-003.md) — Prisma 구성 및 마이그레이션 파이프라인
3. [FR-005](FR-005.md) — Prisma 스키마 모델 16종 정의
4. [FR-007](FR-007.md) — Supabase RLS 정책 (본인 계좌 한정 접근)
5. [FR-019](FR-019.md) — Server Action 공통 기반 (`ActionResult<T>` · 소유권 가드)
6. [FR-020](FR-020.md) — `requestId` 멱등 처리 공통 모듈
7. [FR-021](FR-021.md) — `saveDraft` (예약 저장 · 3그룹 판정 · 밴드 산출)
8. [FR-022](FR-022.md) — `submitTransfer` (전송 확정 + 감사 로그 원자 트랜잭션)
9. [FR-052](FR-052.md) — 상태 전이 통합 시험 (허용 16종 + 금지 5종)

---

## 차단 태스크 5건

`blocked` 라벨. 답변 기한은 [09 개발 실행 계획 §3.4](../09_%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)에 있다.

| 태스크 | 차단 원인 |
| --- | --- |
| [FR-018](FR-018.md) | ⛔ OPEN-TEC-004 |
| [FR-022](FR-022.md) | ⛔ OPEN-TEC-007 |
| [FR-028](FR-028.md) | ⛔ OPEN-TEC-004 |
| [FR-032](FR-032.md) | ⛔ OPEN-TEC-001/002 |
| [FR-033](FR-033.md) | ⛔ OPEN-TEC-001/002 |

**미해결 5건이 잡고 있는 것은 72건 중 10건(14%)뿐이다.** 나머지 62건은 조건 없이 착수할 수 있다.

---

## 전체 태스크 72건

| ID | 태스크 | Epic | 복잡도 | 웨이브 |
| --- | --- | :---: | :---: | :---: |
| [FR-001](FR-001.md) | 리포지토리 스캐폴딩 및 5계층 구조 수립 | `PLT` | M 🔴 | W1 |
| [FR-002](FR-002.md) | 클라우드 리소스 프로비저닝 | `PLT` | M | W1 |
| [FR-003](FR-003.md) | Prisma 구성 및 마이그레이션 파이프라인 | `PLT` | M 🔴 | W2 |
| [FR-004](FR-004.md) | 매매창 판정 Edge Runtime 배포 및 콜드 스타트 완화 | `PLT` | M | W2 |
| [FR-005](FR-005.md) | Prisma 스키마 모델 16종 정의 | `DAT` | H 🔴 | W3 |
| [FR-006](FR-006.md) | 마이그레이션 SQL: 스키마 레벨 제약 | `DAT` | M | W4 |
| [FR-007](FR-007.md) | Supabase RLS 정책 (본인 계좌 한정 접근) | `DAT` | H 🔴 | W4 |
| [FR-008](FR-008.md) | `business-day.ts` 영업일 · Cut-off 엔진 | `DOM` | H | W2 |
| [FR-009](FR-009.md) | `pension-limit.ts` 연금수령한도 산출 | `DOM` | H | W2 |
| [FR-010](FR-010.md) | `withdrawal-order.ts` 3층 재원 인출순서 판정 | `DOM` | H | W2 |
| [FR-011](FR-011.md) | `tax.ts` 세액 산출 | `DOM` | H | W3 |
| [FR-012](FR-012.md) | `band.ts` 완료일 밴드 산출 | `DOM` | H | W3 |
| [FR-013](FR-013.md) | `state-machine.ts` 상태 전이 판정 | `DOM` | H | W3 |
| [FR-014](FR-014.md) | `trading-window.ts` 매매 가능 판정 | `DOM` | M | W2 |
| [FR-015](FR-015.md) | 폴백 사다리 단계 판정 및 `approximate` 산출 | `DOM` | M | W4 |
| [FR-016](FR-016.md) | 검증 데이터셋 6건 단위 시험 및 배포 전 회귀 게이트 | `DOM` | M | W4 |
| [FR-017](FR-017.md) | 외부 연동 어댑터 3종 (원장 · 마이데이터 · 알림) | `ADP` | M | W2 |
| [FR-018](FR-018.md) | `ksd.ts` 예탁결제원 어댑터 | `ADP` | M ⛔ | W2 |
| [FR-019](FR-019.md) | Server Action 공통 기반 (`ActionResult<T>` · 소유권 가드) | `ACT` | M 🔴 | W5 |
| [FR-020](FR-020.md) | `requestId` 멱등 처리 공통 모듈 | `ACT` | H 🔴 | W6 |
| [FR-021](FR-021.md) | `saveDraft` (예약 저장 · 3그룹 판정 · 밴드 산출) | `ACT` | H 🔴 | W7 |
| [FR-022](FR-022.md) | `submitTransfer` (전송 확정 + 감사 로그 원자 트랜잭션) | `ACT` | H 🔴 ⛔ | W8 |
| [FR-023](FR-023.md) | `simulateWithdrawal` (층별 차감 · 세액 모의계산) | `ACT` | H | W6 |
| [FR-024](FR-024.md) | 예약 갱신 · 취소 액션 (`updateDraft` · `cancelTransfer`) | `ACT` | M | W8 |
| [FR-025](FR-025.md) | 읽기 전용 조회 액션 (`getPensionLimit` · `compareWithCertificate`) | `ACT` | M | W7 |
| [FR-026](FR-026.md) | Route Handler 인증 공통 (시스템 간 · Cron) | `ITG` | M | W2 |
| [FR-027](FR-027.md) | `GET /api/internal/trading-window` 매매 가능 판정 응답 | `ITG` | H | W3 |
| [FR-028](FR-028.md) | `POST /api/internal/stage-events` 전문 수신 | `ITG` | H ⛔ | W5 |
| [FR-029](FR-029.md) | `POST /api/internal/settlement` 잔고 반영 통보 수신 | `ITG` | M | W4 |
| [FR-030](FR-030.md) | 배치 공통 가드 (영업일 검증 · 페이지 분할 · 실행 로그) | `BAT` | M | W3 |
| [FR-031](FR-031.md) | `/api/cron/band-recalc` 밴드 재계산 (멱등 갱신) | `BAT` | H | W4 |
| [FR-032](FR-032.md) | `/api/cron/reconcile` 3자 정합성 보정 | `BAT` | H ⛔ | W4 |
| [FR-033](FR-033.md) | 정기 점검 배치 2종 + `vercel.json` 스케줄 선언 | `BAT` | M ⛔ | W5 |
| [FR-034](FR-034.md) | shadcn/ui 컴포넌트 14종 도입 및 매핑 | `UIF` | M | W3 |
| [FR-035](FR-035.md) | 공통 표기 컴포넌트 6종 구현 | `UIF` | M | W4 |
| [FR-036](FR-036.md) | 표기 규칙 위반 차단 ESLint 커스텀 룰 | `UIF` | M | W5 |
| [FR-037](FR-037.md) | 접근성 구현 (대비 토큰 · `break-keep` · ARIA 보존) | `UIF` | M | W2 |
| [FR-038](FR-038.md) | `/home` F1-01 홈 · 진행 알림 | `SF1` | M | W5 |
| [FR-039](FR-039.md) | `/transfer/terms` F1-02 유의사항 | `SF1` | M | W6 |
| [FR-040](FR-040.md) | `/transfer/draft` F1-03 예약 · 잠금 미리보기 | `SF1` | H | W8 |
| [FR-041](FR-041.md) | `/transfer/[transferId]` F1-04 현황판 | `SF1` | H | W6 |
| [FR-042](FR-042.md) | `/transfer/[transferId]/` 하위 — F1-05 완료일 근거 · F1-06 완료 | `SF1` | M | W7 |
| [FR-043](FR-043.md) | `/withdrawal` F2-01 출금관리 · F2-02 수령 대상 | `SF2` | M | W4 |
| [FR-044](FR-044.md) | 도메인 계산 모듈 클라이언트 동시 실행 구성 | `SF2` | H | W4 |
| [FR-045](FR-045.md) | 세율표 버전 동기화 및 클라이언트 계산 무효화 | `SF2` | H | W6 |
| [FR-046](FR-046.md) | `/withdrawal/amount` F2-03 인출금액 (Client 주도) | `SF2` | H | W8 |
| [FR-047](FR-047.md) | `/withdrawal/result` F2-04 인출순서 결과 (Client 주도) | `SF2` | H | W7 |
| [FR-048](FR-048.md) | `/withdrawal/tax-free` F2-05 비과세 관리 | `SF2` | M | W8 |
| [FR-049](FR-049.md) | `/withdrawal/inheritance` F2-06 타명의 조회 | `SF2` | L | W4 |
| [FR-050](FR-050.md) | 성능 SLO 실측 (p95 5종 · 콜드 스타트 영향) | `QLT` | M | W4 |
| [FR-051](FR-051.md) | GWT 인수 기준 76건 ↔ 시험 케이스 추적 매트릭스 | `TST` | H | W5 |
| [FR-052](FR-052.md) | 상태 전이 통합 시험 (허용 16종 + 금지 5종) | `TST` | H | W9 |
| [FR-053](FR-053.md) | 예외·멱등·정합성 시험 (E-01~12 · ID-1~5 · RC-1~5) | `TST` | H | W7 |
| [FR-054](FR-054.md) | E2E 고객 여정 시험 | `TST` | M | W9 |
| [FR-055](FR-055.md) | 접근성 자동 검사 파이프라인 편입 | `TST` | M | W3 |
| [UX-001](UX-001.md) | 디자인 토큰 정의 (색 · 타이포 · 간격 · 대비 · 줄바꿈) | `DSG` | M | W1 |
| [UX-002](UX-002.md) | shadcn/ui 14종 시각 스타일 정의 | `DSG` | H | W2 |
| [UX-003](UX-003.md) | 표기 규칙 시각 규격 7종 | `DSG` | M | W3 |
| [UX-004](UX-004.md) | 단계 타임라인 디자인 | `DSG` | H | W4 |
| [UX-005](UX-005.md) | 한도 게이지 3구간 디자인 | `DSG` | H | W3 |
| [UX-006](UX-006.md) | 3층 재원 소진 시각화 디자인 | `DSG` | H | W4 |
| [UX-007](UX-007.md) | shadcn variant 정의 3종 (3그룹 판정 · 예외 배너 · 고객센터 시트) | `DSG` | M | W4 |
| [UX-008](UX-008.md) | F1-01 홈 · 진행 알림 화면 설계 | `DSG` | M | W4 |
| [UX-009](UX-009.md) | F1-02 유의사항 화면 설계 | `DSG` | M | W5 |
| [UX-010](UX-010.md) | F1-03 예약 · 잠금 미리보기 화면 설계 | `DSG` | H | W5 |
| [UX-011](UX-011.md) | F1-04 현황판 화면 설계 | `DSG` | H | W5 |
| [UX-012](UX-012.md) | F1-05 완료일 근거 · F1-06 완료 화면 설계 | `DSG` | M | W6 |
| [UX-013](UX-013.md) | F2-01 출금관리 · F2-02 수령 대상 화면 설계 | `DSG` | M | W3 |
| [UX-014](UX-014.md) | F2-03 인출금액 화면 설계 | `DSG` | H | W4 |
| [UX-015](UX-015.md) | F2-04 인출순서 결과 화면 설계 | `DSG` | H | W5 |
| [UX-016](UX-016.md) | F2-05 비과세 관리 화면 설계 | `DSG` | M | W4 |
| [UX-017](UX-017.md) | F2-06 타명의 조회 화면 설계 | `DSG` | L | W3 |

🔴 임계 경로 · ⛔ 차단

---

## 라벨 규약 (GitHub Project로 옮길 때)

```
유형   feature | chore | test
관점   part:backend | part:frontend | part:infra | part:design
도메인 epic:PLT | DAT | DOM | ADP | ACT | ITG | BAT | UIF | SF1 | SF2 | QLT | TST | DSG
복잡도 complexity:H | M | L
착수   wave:W1 ~ wave:W9
특수   critical-path (9건) | blocked (5건)
```

---

## 재동기화

```bash
node tools/deps.mjs      # 선행·후행 재생성 → 각 파일과 대조
node tools/dag.mjs       # 웨이브·임계 경로 재계산
node tools/linkcheck.mjs # 링크 무결성
```

태스크가 바뀌면 [06 태스크 리스트](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md)가 **원천**이다. 그쪽을 먼저 고치고 이 폴더를 재동기화한다.
