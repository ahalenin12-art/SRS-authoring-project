# Epic `PLT` — Platform & Infrastructure (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §2 · §5.1 · §8 · §9.1 · §9.4

---

## FR-001 — 리포지토리 스캐폴딩 및 5계층 구조 수립

**labels:** `feature, part:infra, epic:PLT, complexity:M, wave:W1, critical-path`

### 🎯 Summary
두 기능(이체 진행 조회 · 인출순서 시뮬레이터)이 공유할 프로젝트 골격을 만든다. **전이 후행 46건 — 67건 중 69%가 이 태스크에 걸려 있다.** 가장 먼저, 가장 짧게 끝내야 한다.

### 🔗 References
- SRS-002 §2.2 계층 책임 · §2.3 디렉터리 구조
- SRS-002 §5.4 `TEC-DOM-001~003` 도메인 모듈 격리
- SRS-002 §6 C-TEC-004 Tailwind + shadcn/ui

### ✅ Task Breakdown
- [ ] Next.js App Router 프로젝트 초기화 (C-TEC-001 — 별도 백엔드 서버를 두지 않는다)
- [ ] §2.3 디렉터리 구조 생성 — `app/` `lib/actions` `lib/domain` `lib/db` `lib/adapters` `prisma/` `components/ui` `components/domain`
- [ ] Tailwind CSS + shadcn/ui 초기 설정
- [ ] `decimal.js` 도입 및 금액 타입 규약 수립 (`TEC-DOM-003` — `number` 부동소수 연산 금지)
- [ ] `lib/domain/*`이 Prisma를 import하지 못하도록 린트 경계 설정 (`TEC-DOM-001`)
- [ ] 정적 분석·타입 체크 파이프라인 연결

### 🧪 Acceptance Criteria
**Scenario 1 — 골격 위에서 빌드된다**
- Given: 초기화된 리포지토리에서
- When: 빈 홈 화면을 빌드하면
- Then: 에러 없이 빌드되고 §2.3의 5계층 디렉터리가 전부 존재한다

**Scenario 2 (실패 흐름) — 도메인 계층의 Prisma import가 차단된다**
- Given: `lib/domain/` 내 파일이 `@prisma/client`를 import하면
- When: 린트 또는 빌드를 실행하면
- Then: **실패해야 한다** (`TEC-DOM-001` 위반을 사람 리뷰가 아니라 도구가 막는다)

### ⚙️ Constraints
- `TEC-DOM-001` — `lib/domain/*`은 Prisma Client를 import하지 않아야 한다
- `TEC-DOM-002` — 도메인 함수는 순수 함수여야 하며 `Date.now()` 등 비결정적 호출을 인자로 받아야 한다
- `TEC-DOM-003` — 금액은 `Decimal`로 다루어야 한다

### 🏁 DoD
- [ ] 5계층 디렉터리 존재
- [ ] 빈 화면 빌드 성공
- [ ] 정적 분석 0 warning
- [ ] 도메인 계층 import 위반이 빌드 실패로 이어짐을 시험으로 확인

### 🚧 Dependencies & Blockers
- **Depends on:** None — **조건 없이 즉시 착수 가능**
- **Blocks:** FR-003 · FR-004 · FR-008 · FR-009 · FR-010 · FR-011 · FR-012 · FR-013 · FR-014 · FR-017 · FR-018 · FR-019 · FR-034 · FR-037
- ⚠️ **직접 후행 14건 · 전이 후행 46건.** 임계 경로의 시작점이다. 3일을 넘기면 즉시 에스컬레이션한다.

---

## FR-002 — 클라우드 리소스 프로비저닝

**labels:** `feature, part:infra, epic:PLT, complexity:M, wave:W1`

### 🎯 Summary
Supabase(Production/Preview)와 Vercel 프로젝트를 만들고 환경 변수 12종을 등록한다. C-TEC-003·007이 지정한 인프라를 실체화하는 작업이다.

### 🔗 References
- SRS-002 §5.1 환경 구성 · §8.1 배포 파이프라인 · §8.2 환경 변수 목록
- SRS-002 §8.2 `TEC-OPS-010` — 비밀 값의 `NEXT_PUBLIC_` 접두사 금지

### ✅ Task Breakdown
- [ ] Supabase 프로젝트 생성 — Production / Preview 분리 (§8.1 브랜치 표)
- [ ] Vercel 프로젝트 생성 및 Git 저장소 연결 (`TEC-OPS-002` — Git Push로 자동 배포)
- [ ] 환경 변수 12종 등록 — `DATABASE_URL` `DIRECT_URL` `SUPABASE_SERVICE_ROLE_KEY` `CRON_SECRET` `INTERNAL_API_KEY` `LEDGER_API_BASE` `MYDATA_API_BASE` `KSD_WEBHOOK_SECRET` `TAX_TABLE_STALE_DAYS` `TAX_TABLE_WARN_DAYS` `AI_MODEL_ID` `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] 세율 임계값을 환경 변수로 분리 (`TEC-OPS-011` — 배포 없이 조정 가능해야 한다)
- [ ] `NEXT_PUBLIC_` 접두사 사용 여부를 빌드 시 검사하는 스크립트 추가

### 🧪 Acceptance Criteria
**Scenario 1 — Push가 배포로 이어진다**
- Given: main 브랜치에 커밋을 push하면
- When: Vercel 빌드가 실행되면
- Then: 별도 CI/CD 설정 없이 Production 배포가 완료된다 (`TEC-OPS-001`)

**Scenario 2 (실패 흐름) — 비밀 값의 클라이언트 노출이 차단된다**
- Given: 비밀 성격의 변수에 `NEXT_PUBLIC_` 접두사를 붙이면
- When: 빌드를 실행하면
- Then: **실패해야 한다** (`TEC-OPS-010`)

### ⚙️ Constraints
- `TEC-OPS-001` — 별도 CI/CD 파이프라인을 구성하지 않는다
- `TEC-OPS-010` — 모든 비밀 값은 `NEXT_PUBLIC_` 접두사를 사용하지 않아야 한다
- ⚠️ `GOOGLE_GENERATIVE_AI_API_KEY`·`AI_MODEL_ID`는 **자리만 만든다.** SRS-002 §7.1이 "현재 AI 적용 대상 없음"으로 판정했다

### 🏁 DoD
- [ ] Preview·Production 환경 분리 확인
- [ ] 환경 변수 12종 등록 완료
- [ ] Push → 자동 배포 1회 성공
- [ ] 접두사 검사 스크립트 통과

### 🚧 Dependencies & Blockers
- **Depends on:** None — **조건 없이 즉시 착수 가능**
- **Blocks:** FR-003 · FR-016 · FR-026
- ⚠️ 전이 후행 31건. FR-001과 함께 W1에서 병렬 착수한다.

---

## FR-003 — Prisma 구성 및 마이그레이션 파이프라인

**labels:** `feature, part:backend, epic:PLT, complexity:M, wave:W2, critical-path`

### 🎯 Summary
Prisma Client를 커넥션 풀러 경유로 구성하고, enum 7종을 정의하며, 배포 시 마이그레이션이 자동 수행되게 한다. **§9.4 CONFLICT-04(서버리스 커넥션 폭증)의 완화 지점**이다.

### 🔗 References
- SRS-002 §5.1 환경 구성 · §5.2 Prisma 스키마 (enum 7종)
- SRS-002 §9.4 CONFLICT-04 · `TEC-DB-002` 풀러 경유 필수
- SRS-002 §8.1 `TEC-OPS-004` — 빌드 단계 `prisma migrate deploy`

### ✅ Task Breakdown
- [ ] `lib/db/prisma.ts` — 전역 싱글턴 구성 (개발 시 HMR 커넥션 폭증 방지)
- [ ] `DATABASE_URL`을 **Supabase 커넥션 풀러**로, `DIRECT_URL`을 마이그레이션 직결로 분리
- [ ] enum 7종 정의 — `TransferStatus`(12) · `TradingWindowValue`(4) · `HoldingStatus`(3) · `DataLayer`(2) · `AccountType`(4) · `WithdrawalReason`(7) · `TransferRoute`(2)
- [ ] 빌드 단계에 `prisma migrate deploy` 편입 (`TEC-OPS-004`)
- [ ] 풀러 경유 시 제약되는 Prisma 기능(prepared statement 등) 확인 및 기록

### 🧪 Acceptance Criteria
**Scenario 1 — 풀러를 경유해 접속한다**
- Given: `DATABASE_URL`이 풀러 주소로 설정된 상태에서
- When: Server Action이 DB에 질의하면
- Then: 풀러를 경유해 정상 응답하고, 동시 요청이 늘어도 커넥션 한도를 초과하지 않는다

**Scenario 2 — 배포가 스키마를 자동 반영한다**
- Given: 새 마이그레이션이 포함된 커밋을 push하면
- When: 빌드가 실행되면
- Then: `prisma migrate deploy`가 수행되고 배포된 앱이 새 스키마로 동작한다

### ⚙️ Constraints
- `TEC-DB-002` — Supabase 커넥션 풀러 경유가 필수다
- `TEC-OPS-004` — 마이그레이션은 배포 파이프라인의 빌드 단계에서 수행한다
- ⚠️ 마이그레이션은 되돌리기가 까다롭다. 스키마 변경은 FR-005에서 신중히 확정한다

### 🏁 DoD
- [ ] 전역 싱글턴 적용 확인
- [ ] enum 7종 정의 완료
- [ ] 마이그레이션 자동 수행 1회 성공
- [ ] 풀러 기능 제약 사항 문서화

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001 · FR-002
- **Blocks:** FR-005 · FR-013 · FR-035
- ⚠️ **임계 경로.** 전이 후행 24건. 데이터 계층 전체의 문이다.

---

## FR-004 — 매매창 판정 Edge Runtime 배포 및 콜드 스타트 완화

**labels:** `feature, part:infra, epic:PLT, complexity:M, wave:W2`

### 🎯 Summary
§9.1 CONFLICT-01의 완화책 3종을 구현한다. **콜드 스타트가 고객의 정상 주문을 막는 문제**를 줄이기 위한 작업으로, 완화 여부의 판정은 FR-050(실측)이 한다.

### 🔗 References
- SRS-002 §9.1 CONFLICT-01 — 완화 ① Edge Runtime ② 짧은 TTL 캐시 ③ 주기적 워밍
- SRS-002 §10 Impact — `SRS-IF-006` 매매창 판정 = Route Handler + Edge Runtime
- OPEN-TEC-003 — 판정 응답 시간 실측

### ✅ Task Breakdown
- [ ] `/api/internal/trading-window` 경로에 Edge Runtime 지정
- [ ] 판정 결과 짧은 TTL 캐시 적용 (TTL 값을 환경 변수로 노출)
- [ ] 주기적 워밍 구성
- [ ] Edge Runtime에서 사용 불가한 Node API 의존 여부 확인 및 회피

### 🧪 Acceptance Criteria
**Scenario 1 — Edge에서 실행된다**
- Given: 판정 엔드포인트를 배포한 상태에서
- When: 요청을 보내면
- Then: Edge Runtime에서 처리되고 응답 헤더로 확인 가능하다

**Scenario 2 — 캐시가 같은 판정을 재사용한다**
- Given: 동일 계좌에 대한 판정 요청이 TTL 내에 반복되면
- When: 두 번째 요청이 오면
- Then: 캐시된 결과를 반환하고 DB 질의가 발생하지 않는다

### ⚙️ Constraints
- ⚠️ **이 태스크는 완화일 뿐 해결이 아니다.** §9.1이 "완화 후에도 p95 500ms 보장이 확정되지 않는다. Phase 0에서 실측 후 판정"이라고 명시했다
- 캐시 TTL이 길면 잠금 상태 변화 반영이 늦어진다. **트레이드오프를 값으로 기록한다**

### 🏁 DoD
- [ ] Edge Runtime 배포 확인
- [ ] TTL 캐시 동작 확인
- [ ] 워밍 스케줄 등록
- [ ] **FR-050 실측 대상으로 등록**

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** FR-027 · FR-050
- ⚠️ 실측(FR-050) 결과가 나쁘면 **아키텍처 재검토**가 필요하다. [개발 실행 계획 §4.2](../09_%5B%EC%B4%9D%EA%B4%84%5D%20%EA%B0%9C%EB%B0%9C%20%EC%8B%A4%ED%96%89%20%EA%B3%84%ED%9A%8D%20%28%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4%29.md)는 실측을 계획표보다 앞당길 것을 권고한다.
