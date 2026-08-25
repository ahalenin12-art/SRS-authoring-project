# 개발 태스크 분해 v2.0 — M·L 병합판

| 항목 | 내용 |
| --- | --- |
| Document ID | PENSION-PLUS-TASK-V2 |
| Version | 2.0 |
| 작성일 | 2026-08-25 |
| 대상 문서 | [SRS/srs-002-pension-plus-nextjs-v1_0.md](../SRS/srs-002-pension-plus-nextjs-v1_0.md) |
| 선행 버전 | [task-breakdown-v1-full.md](task-breakdown-v1-full.md) — 전체 102개판 |
| 총 태스크 | 66 (개발·인프라 49 / UI·UX 디자인 17) |
| 감축 | 102 → 66 (−36) |

## 병합 원칙

**H(고복잡도) 30건은 병합 대상이 아니다.** 이름·SRS 섹션·선행 관계를 원본 그대로 유지한다. M·L만 병합했다.

병합은 아래 **셋 중 하나를 만족할 때만** 수행했다.

1. **같은 파일·모듈** — 예: `lib/adapters/` 3파일, `components/domain/` 6파일
2. **SRS 같은 절의 한 산출물** — 예: §5.3 스키마 레벨 제약 = 하나의 마이그레이션 SQL
3. **인접 라우트** — 부모·자식 또는 같은 세그먼트의 형제 라우트

"둘 다 M이니까"는 병합 근거로 쓰지 않았다.

## 병합하지 않은 M 태스크

아래는 M이지만 **H의 선행**이라, 병합하면 H 태스크의 착수가 늦어져 임계 경로가 길어진다. 단독으로 남겼다.

| 태스크 | 이유 |
| --- | --- |
| FR-019 Server Action 공통 기반 | H 4건(FR-020~023)의 선행 |
| FR-026 Route Handler 인증 공통 | H 2건(FR-027, FR-028)의 선행 |
| FR-030 배치 공통 가드 | H 2건(FR-031, FR-032)의 선행 |
| FR-018 예탁결제원 어댑터 | **차단 태스크.** 다른 어댑터 3종과 묶으면 멀쩡한 것까지 함께 막힌다 |

> **병합 원본** 열은 v1.0의 원본 ID다. 단일 ID만 적힌 H 태스크는 원본 그대로임을 뜻한다.

---

# 1. 개발 · 인프라 (73 → 49)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 | 복잡도 | 병합 원본 |
|---|---|---|---|---|:---:|---|
| FR-001 | Platform | 리포지토리 스캐폴딩 — App Router 5계층 디렉터리 · Tailwind/shadcn 설정 · 도메인 격리 규약(Decimal 포함) | 2.2 / 2.3 / 6 · TEC-DOM-001~003 | None | M | 舊 001+006+016 |
| FR-002 | Platform | 클라우드 리소스 프로비저닝 — Supabase(Prod/Preview) · Vercel 연결 · 환경 변수 12종 | 5.1 / 8.1 / 8.2 · TEC-OPS-001,002,010 | None | M | 舊 002+004+005 |
| FR-003 | Platform | Prisma 구성 — 풀러 경유 접속 · 전역 싱글턴 · enum 7종 · migrate deploy 파이프라인 | 5.1 / 5.2 / 9.4 · TEC-DB-002, TEC-OPS-004 | FR-001, FR-002 | M | 舊 003+007+010 |
| FR-004 | Platform | 매매창 판정 Edge Runtime 배포 + TTL 캐시 + 주기 워밍 | 9.1 CONFLICT-01 완화 ①②③ | FR-001 | M | 舊 009 |
| FR-005 | Data Layer | Prisma 스키마 — 모델 16종 정의 및 관계 설정 | 5.2 | FR-003 | **H** | 舊 011 |
| FR-006 | Data Layer | 마이그레이션 SQL — 스키마 레벨 제약 (CHECK · WORM 트리거 · 멱등 unique) | 5.3 · TEC-DB-010~014 | FR-005 | M | 舊 012+013+014 |
| FR-007 | Data Layer | Supabase RLS 정책 — 본인 계좌 한정 접근 | 5.3 · TEC-DB-015 | FR-005 | **H** | 舊 015 |
| FR-008 | Domain Engine | `business-day.ts` 영업일 · Cut-off 엔진 | 2.3 / 8.3 | FR-001 | **H** | 舊 017 |
| FR-009 | Domain Engine | `pension-limit.ts` 연금수령한도 산출 | 5.4 | FR-001 | **H** | 舊 018 |
| FR-010 | Domain Engine | `withdrawal-order.ts` 3층 재원 인출순서 | 2.3 | FR-001 | **H** | 舊 019 |
| FR-011 | Domain Engine | `tax.ts` 세액 산출 | 2.3 | FR-001, FR-010 | **H** | 舊 020 |
| FR-012 | Domain Engine | `band.ts` 완료일 밴드 산출 | 2.3 / 10 | FR-001, FR-008 | **H** | 舊 021 |
| FR-013 | Domain Engine | `state-machine.ts` 허용/금지 전이 판정 | 2.3 / 4.4 | FR-001, FR-003 | **H** | 舊 023 |
| FR-014 | Domain Engine | `trading-window.ts` 매매 가능 판정 | 2.3 | FR-001 | M | 舊 022 |
| FR-015 | Domain Engine | 폴백 사다리 단계 판정 · `approximate` 산출 | 6.2 / 13.3 | FR-012 | M | 舊 024 |
| FR-016 | Domain Engine | 검증 데이터셋 6건 단위 시험 및 배포 전 회귀 게이트 | 5.4 TEC-DOM-004 / 8.1 TEC-OPS-003 | FR-009, FR-010, FR-011, FR-002 | M | 舊 025+008 |
| FR-017 | Adapters | 외부 연동 어댑터 3종 — 원장 · 마이데이터 · 알림 | 2.3 / 8.2 / 4.4 TEC-TX-002 | FR-001 | M | 舊 026+027+029 |
| FR-018 | Adapters | `ksd.ts` 예탁결제원 어댑터 | 2.3 / 9.6 | FR-001 | M | 舊 028 |
| FR-019 | Server Actions | Server Action 공통 기반 — `ActionResult<T>` · 소유권 검증 가드 | 4.3 · TEC-ACT-001, 004 | FR-001, FR-007 | M | 舊 030+031 |
| FR-020 | Server Actions | `requestId` 멱등 처리 공통 모듈 | 4.3 · TEC-ACT-002 | FR-019, FR-005 | **H** | 舊 032 |
| FR-021 | Server Actions | `saveDraft` — 예약 저장 · 3그룹 판정 · 밴드 산출 | 4.2 | FR-019, FR-020, FR-012, FR-017 | **H** | 舊 033 |
| FR-022 | Server Actions | `submitTransfer` — 전송 확정 + 감사 로그 원자 트랜잭션 | 4.2 / 4.4 · TEC-TX-001~003 | FR-021, FR-013, FR-006 | **H** | 舊 035 |
| FR-023 | Server Actions | `simulateWithdrawal` — 층별 차감 · 세액 모의계산 | 4.2 · TEC-ACT-005 | FR-019, FR-010, FR-011 | **H** | 舊 038 |
| FR-024 | Server Actions | 예약 갱신 · 취소 액션 (`updateDraft` · `cancelTransfer`) | 4.2 | FR-021, FR-013 | M | 舊 034+036 |
| FR-025 | Server Actions | 읽기 전용 조회 액션 (`getPensionLimit` · `compareWithCertificate`) | 4.2 · TEC-ACT-005 | FR-019, FR-009, FR-023 | M | 舊 037+039 |
| FR-026 | System Integration | Route Handler 인증 공통 — 시스템 간(`INTERNAL_API_KEY`) · Cron(`CRON_SECRET`) | 3.2 / 8.2 / 8.3 · TEC-BATCH-001 | FR-002 | M | 舊 040+044 |
| FR-027 | System Integration | `GET /api/internal/trading-window` 판정 응답 | 3.2 (`SRS-IF-006`) / 10 | FR-026, FR-014, FR-004 | **H** | 舊 041 |
| FR-028 | System Integration | `POST /api/internal/stage-events` 전문 수신 + 서명 검증 + 중복 차단 | 3.2 (`SRS-IF-007`) / 9.6 | FR-026, FR-006, FR-013 | **H** | 舊 042 |
| FR-029 | System Integration | `POST /api/internal/settlement` 잔고 반영 push 수신 | 3.2 (`SRS-IF-010`) / 9.2 완화 ③ | FR-026, FR-013 | M | 舊 043 |
| FR-030 | Batch | 배치 공통 가드 — 영업일 검증 · 페이지 분할 · 실행 로그 | 8.3 · TEC-BATCH-002, 004, 005 | FR-026, FR-008 | M | 舊 045 |
| FR-031 | Batch | `/api/cron/band-recalc` 밴드 재계산 (조건부 UPDATE 멱등 갱신) | 3.3 / 9.5 · TEC-BATCH-003 | FR-030, FR-012 | **H** | 舊 046 |
| FR-032 | Batch | `/api/cron/reconcile` 3자 정합성 보정 | 3.3 (`SRS-REC-003`) / 9.2 | FR-030, FR-017 | **H** | 舊 049 |
| FR-033 | Batch | 정기 점검 배치 2종 (잔고 확인 · 세율 신선도) + `vercel.json` 스케줄 선언 | 3.3 / 8.2 · TEC-OPS-011 | FR-030, FR-017, FR-005, FR-031 | M | 舊 047+048+050 |
| FR-034 | UI Foundation | shadcn/ui 컴포넌트 14종 도입 및 매핑 적용 | 6.1 | FR-001, UX-002 | M | 舊 051 |
| FR-035 | UI Foundation | 공통 표기 컴포넌트 6종 구현 (BandDisplay · LayerBadge · SimulationLabel · StatusLabel · MoneyText · MaskedAccount) | 6.2 · TEC-UI-001~003 | FR-034, FR-003, UX-003 | M | 舊 052~057 |
| FR-036 | UI Foundation | 표기 규칙 위반 차단 ESLint 커스텀 룰 | 6.2 · TEC-UI-004 | FR-035 | M | 舊 058 |
| FR-037 | UI Foundation | 접근성 구현 — 대비 토큰 · `break-keep` 전역 · ARIA 보존 | 6.3 · TEC-UI-010~012 | FR-001, UX-001 | M | 舊 059 |
| FR-038 | 화면 F1 | `/home` F1-01 홈 · 진행 알림 | 3.1 (`SRS-FR-001~007`) | FR-005, FR-035, UX-008 | M | 舊 060 |
| FR-039 | 화면 F1 | `/transfer/terms` F1-02 유의사항 | 3.1 (`SRS-FR-008~015`) | FR-034, FR-017, UX-009 | M | 舊 061 |
| FR-040 | 화면 F1 | `/transfer/draft` F1-03 예약 · 잠금 미리보기 | 3.1 (`SRS-FR-016~032`) | FR-021, FR-035, FR-017, UX-010 | **H** | 舊 062 |
| FR-041 | 화면 F1 | `/transfer/[transferId]` F1-04 현황판 (당일 캐시) | 3.1 (`SRS-FR-033~050`) | FR-005, FR-035, UX-011 | **H** | 舊 063 |
| FR-042 | 화면 F1 | `/transfer/[transferId]/` 하위 — F1-05 완료일 근거 · F1-06 완료 | 3.1 (`SRS-FR-051~064`) | FR-041, FR-012, UX-012 | M | 舊 064+065 |
| FR-043 | 화면 F2 | `/withdrawal` F2-01 출금관리 · F2-02 수령 대상 | 3.1 (`SRS-FR-065~071`) | FR-034, FR-017, UX-013 | M | 舊 066+067 |
| FR-044 | 화면 F2 | 도메인 계산 모듈 클라이언트 동시 실행 구성 | 9.3 · TEC-CALC-001 | FR-009, FR-010, FR-011 | **H** | 舊 068 |
| FR-045 | 화면 F2 | 세율표 버전 동기화 및 클라이언트 계산 무효화 | 9.3 · TEC-CALC-002~004 | FR-044, FR-033 | **H** | 舊 069 |
| FR-046 | 화면 F2 | `/withdrawal/amount` F2-03 인출금액 (Client 주도) | 3.1 (`SRS-FR-072~084`) / 9.3 | FR-044, FR-045, FR-025, FR-035, UX-014 | **H** | 舊 070 |
| FR-047 | 화면 F2 | `/withdrawal/result` F2-04 인출순서 결과 (Client 주도) | 3.1 (`SRS-FR-085~101`) / 9.3 | FR-044, FR-045, FR-023, UX-015 | **H** | 舊 071 |
| FR-048 | 화면 F2 | `/withdrawal/tax-free` F2-05 비과세 관리 | 3.1 (`SRS-FR-102~106`) | FR-025, FR-034, UX-016 | M | 舊 072 |
| FR-049 | 화면 F2 | `/withdrawal/inheritance` F2-06 타명의 조회 | 3.1 (`SRS-FR-107~110`) | FR-034, UX-017 | L | 舊 073 |

---

# 2. UI/UX 디자인 (29 → 17)

| Task ID | Epic (도메인) | Feature (기능명) | 관련 SRS 섹션 | 선행 태스크 | 복잡도 | 병합 원본 |
|---|---|---|---|---|:---:|---|
| UX-001 | Design System | 디자인 토큰 정의 — 색 · 타이포 · 간격 · 대비 검증 팔레트 · 어절 줄바꿈 규칙 | 6.1 / 6.3 · TEC-UI-010, 011 | None | M | 舊 001+002+003 |
| UX-002 | Design System | shadcn/ui 14종 시각 스타일 정의 (ARIA 속성 보존 전제) | 6.1 / 6.3 · TEC-UI-012 | UX-001 | **H** | 舊 004 |
| UX-003 | 표기 규칙 디자인 | 표기 규칙 시각 규격 7종 — 밴드 · 확정/추정 · 모의계산 라벨 · 상태 12종 · 금액 · 마스킹 · 대략치 병기 | 6.2 | UX-002 | M | 舊 005~011 |
| UX-004 | 커스텀 시각화 | 단계 타임라인 디자인 (`Progress` + 커스텀) | 6.1 (`SRS-FR-033`) | UX-002, UX-003 | **H** | 舊 012 |
| UX-005 | 커스텀 시각화 | 한도 게이지 3구간 커스텀 디자인 | 6.1 (`SRS-FR-072`) | UX-002 | **H** | 舊 013 |
| UX-006 | 커스텀 시각화 | 3층 재원 소진 시각화 커스텀 디자인 | 6.1 (`SRS-FR-085`) | UX-002, UX-003 | **H** | 舊 014 |
| UX-007 | 커스텀 시각화 | shadcn variant 정의 3종 — 3그룹 판정 `Accordion` · 예외 배너 `Alert` · 고객센터 `Sheet` | 6.1 | UX-002, UX-003 | M | 舊 015+016+017 |
| UX-008 | 화면 설계 F1 | F1-01 홈 · 진행 알림 화면 설계 | 3.1 | UX-002, UX-003 | M | 舊 018 |
| UX-009 | 화면 설계 F1 | F1-02 유의사항 화면 설계 (`ScrollArea` 약관 전문) | 3.1 / 6.1 | UX-002, UX-007 | M | 舊 019 |
| UX-010 | 화면 설계 F1 | F1-03 예약 · 잠금 미리보기 화면 설계 | 3.1 | UX-003, UX-007 | **H** | 舊 020 |
| UX-011 | 화면 설계 F1 | F1-04 현황판 화면 설계 (상태 12종 · 예외 배너) | 3.1 | UX-004, UX-007, UX-003 | **H** | 舊 021 |
| UX-012 | 화면 설계 F1 | `/transfer/[id]/` 하위 — F1-05 완료일 근거 · F1-06 완료 화면 설계 | 3.1 | UX-011, UX-003 | M | 舊 022+023 |
| UX-013 | 화면 설계 F2 | `/withdrawal` F2-01 출금관리 · F2-02 수령 대상 화면 설계 | 3.1 | UX-002 | M | 舊 024+025 |
| UX-014 | 화면 설계 F2 | F2-03 인출금액 화면 설계 (`Input` + `Slider` · 계산 근거 `Collapsible`) | 3.1 / 6.1 | UX-005, UX-003 | **H** | 舊 026 |
| UX-015 | 화면 설계 F2 | F2-04 인출순서 결과 화면 설계 (경고·주의 `Alert`) | 3.1 / 6.1 | UX-006, UX-007 | **H** | 舊 027 |
| UX-016 | 화면 설계 F2 | F2-05 비과세 관리 화면 설계 (제출 전/후 비교) | 3.1 | UX-003 | M | 舊 028 |
| UX-017 | 화면 설계 F2 | F2-06 타명의 조회 화면 설계 (정적 + 딥링크) | 3.1 | UX-002 | L | 舊 029 |

---

# 3. 착수 차단 태스크 (v2.0 ID 기준)

| 차단 태스크 | 차단 원인 | 해제 조건 |
|---|---|---|
| FR-018, FR-028 | OPEN-TEC-004 전문 수신 경로 미확정 | 내부 중계 시스템 존재 여부 확인 |
| FR-022 | OPEN-TEC-007 본인 인증 수단 미확정 | `authResult` 규격 결정 |
| FR-038 ~ FR-042 (부분) | 폴백 사다리 ③단계 기준으로만 구현 가능 | OPEN-TEC-004 해제 |
| FR-032, FR-033 | Cron 주기 TBD (OPEN-TEC-001 · 002) | 잠정값 착수 가능, 실측 후 확정 |

---

# 4. 병합 결과

| 항목 | v1.0 | v2.0 | 감축 |
|---|---:|---:|---:|
| 개발 · 인프라 | 73 | **49** | −24 |
| UI/UX 디자인 | 29 | **17** | −12 |
| **총 태스크** | **102** | **66** | **−36** |
| H (건드리지 않음) | 30 | **30** | 0 |
| M | 52 | 34 | −18 |
| L | 20 | 2 | −18 |

**H 30건은 전부 원본 그대로다.** 병합 원본 열에 단일 ID만 적힌 것이 그것이며, 이름 · SRS 섹션 · 선행 관계를 바꾸지 않았다.

**총 66건으로 목표치 50에는 못 미친다.** H를 지키면서 진짜 겹치는 것만 묶은 결과가 여기까지다. 더 줄이려면 성격이 다른 태스크를 억지로 묶어야 해서 멈췄다.

**다만 개발 태스크만 보면 49건이다.** 일정 트래킹의 주 대상은 개발 쪽이고 디자인 17건은 별도 트랙으로 도는 것이 보통이므로, 실질적으로는 50건 수준에 들어왔다고 볼 수 있다.

**원본 102건은 전부 흡수되었다.** 병합 원본 열의 ID를 합산하면 개발 73건, 디자인 29건이 정확히 맞는다. 누락된 기능은 없다.
