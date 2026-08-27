# Epic `ITG` — System Integration (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.2 · §4.1 · §9.1 · §9.6

> **Route Handler를 쓰는 이유** (§4.1 판정 기준): 호출자가 **시스템**이라 고객 세션이 없고, 응답을 상대가 파싱하므로 구조화된 응답 계약이 필요하다.

---

## FR-026 — Route Handler 인증 공통 (시스템 간 · Cron)

**labels:** `feature, part:backend, epic:ITG, complexity:M, wave:W2`

### 🎯 Summary
세션 없이 호출되는 두 종류의 엔드포인트(시스템 간 · Cron) 인증을 공통화한다. **H 2건의 선행**이라 단독으로 두었다.

### 🔗 References
- SRS-002 §3.2 인증 열 · §8.2 `INTERNAL_API_KEY` · `CRON_SECRET`
- SRS-002 §8.3 `TEC-BATCH-001` — Cron은 `CRON_SECRET` 검증 없이 실행되지 않아야 한다

### ✅ Task Breakdown
- [ ] 시스템 간 인증 검증기 (`INTERNAL_API_KEY`)
- [ ] Cron 인증 검증기 (`CRON_SECRET`, `Authorization: Bearer`)
- [ ] 인증 실패 시 401 반환 및 본문 노출 금지
- [ ] 인증 실패 로그 기록 (본문·키는 기록하지 않는다)
- [ ] 모든 Route Handler가 검증기를 거치도록 강제

### 🧪 Acceptance Criteria
**Scenario 1 (실패 흐름) — 인증 없는 Cron 호출 거부**
- Given: `Authorization` 헤더 없이
- When: `/api/cron/*`를 호출하면
- Then: **401이 반환되고 어떤 처리도 수행되지 않는다** (`TEC-BATCH-001`)

**Scenario 2 (실패 흐름) — 잘못된 시스템 키 거부**
- Given: 유효하지 않은 `INTERNAL_API_KEY`로
- When: `/api/internal/*`를 호출하면
- Then: 401이 반환되고 내부 정보가 응답에 노출되지 않는다

### ⚙️ Constraints
- `TEC-BATCH-001` — Cron 엔드포인트는 시크릿 검증 없이 실행 금지
- 인증 실패 응답에 시스템 내부 정보를 담지 않는다

### 🏁 DoD
- [ ] 인증 검증기 2종 구현
- [ ] 미인증 호출 거부 시험 통과
- [ ] 전 Route Handler 적용 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-002
- **Blocks:** FR-027 · FR-028 · FR-029 · FR-030

---

## FR-027 — `GET /api/internal/trading-window` 매매 가능 판정 응답

**labels:** `feature, part:backend, epic:ITG, complexity:H, wave:W3`

### 🎯 Summary
주문 시스템이 **매 주문마다** 호출하는 판정 엔드포인트. **§9.1 CONFLICT-01의 가장 위험한 지점** — 응답이 늦으면 고객의 정상 주문이 거부된다.

### 🔗 References
- SRS-002 §3.2 (`SRS-IF-006`) · §9.1 CONFLICT-01 · §10 Impact (Route Handler + Edge Runtime)
- 선행 SRS `SRS-NFR-PERF-003` p95 ≤ 500ms · `SRS-ERR-011` 타임아웃 시 `LOCKED` 강등

### ✅ Task Breakdown
- [ ] Edge Runtime에서 판정 응답 (FR-004 구성 위에서)
- [ ] 도메인 판정(FR-014) 호출 및 `TradingWindowValue` 반환
- [ ] 구조화된 응답 계약 정의 (주문 시스템이 파싱)
- [ ] 타임아웃 시 **안전한 쪽인 `LOCKED`** 로 처리되도록 계약 명시
- [ ] 응답 시간 계측 로그 (FR-050 실측의 입력)

### 🧪 Acceptance Criteria
**Scenario 1 — 판정이 반환된다**
- Given: 유효한 시스템 인증과 계좌 식별자로
- When: 호출하면
- Then: `TradingWindowValue` 4종 중 하나와 판정 근거가 반환된다

**Scenario 2 (실패 흐름) — 실패 방향이 안전하다**
- Given: 판정을 산출할 수 없는 상황에서
- When: 응답하면
- Then: **`LOCKED`로 처리된다.** "막혔는데 열렸다"는 회복 불가 오류가 발생하지 않는다

### ⚙️ Constraints
- ⚠️ **잔여 위험이 남아 있다.** §9.1 — "완화 후에도 p95 500ms 보장이 확정되지 않는다"
- ⚠️ 정상 주문 거부는 가드레일 지표(`SRS-NFR-REL-004`, 일간 ≤ 0.1%)를 소진한다
- 판정 결과 캐시 TTL이 길면 잠금 변화 반영이 늦다 — FR-004의 TTL 값과 정합 확인

### 🏁 DoD
- [ ] 판정 응답 시험 통과
- [ ] 실패 방향(LOCKED) 시험 통과
- [ ] 응답 시간 계측 로그 확인
- [ ] **FR-050 실측 대상 등록**

### 🚧 Dependencies & Blockers
- **Depends on:** FR-004 · FR-014 · FR-026
- **Blocks:** FR-050

---

## FR-028 — `POST /api/internal/stage-events` 전문 수신

**labels:** `feature, part:backend, epic:ITG, complexity:H, wave:W5, blocked`

### 🎯 Summary
예탁결제원 단계 전문을 수신해 상태를 전이시킨다. **중복 수신은 DB 유니크 제약이 막는다** — 애플리케이션 분기에 의존하지 않는다.

### 🔗 References
- SRS-002 §3.2 (`SRS-IF-007`) · §9.6 CONFLICT-06 · §11 OPEN-TEC-004
- SRS-002 §5.3 `TEC-DB-014` 멱등 유니크 · §10 Impact (`SRS-IDEM-001`)

### ✅ Task Breakdown
- [ ] ⛔ **선결:** 전문 수신 경로 확정 (OPEN-TEC-004)
- [ ] 서명 검증 (`KSD_WEBHOOK_SECRET`)
- [ ] 호출 원본 제한
- [ ] `StageEvent` 저장 — 유니크 제약 위반 시 **중복으로 판단하고 성공 응답**
- [ ] `assertTransition`으로 상태 전이 (FR-013)
- [ ] 순서 뒤바뀜 수신 처리 (`messageSeq` 기준)

### 🧪 Acceptance Criteria
**Scenario 1 — 전문이 상태를 전이시킨다**
- Given: 유효한 서명의 단계 전문이 도착하면
- When: 처리되면
- Then: `StageEvent`가 저장되고 `Transfer` 상태가 허용 전이에 따라 갱신된다

**Scenario 2 — 중복 전문이 두 번 반영되지 않는다**
- Given: 동일 `(transferId, stageNo, messageSeq)` 전문이 재전송되면
- When: 두 번째가 도착하면
- Then: **DB 유니크 제약이 저장을 막고 상태는 한 번만 전이된다**

**Scenario 3 (실패 흐름) — 서명 불일치 거부**
- Given: 서명이 맞지 않는 전문
- When: 도착하면
- Then: 거부되고 상태가 변경되지 않는다

### ⚙️ Constraints
- ⛔ **Blocks Development** — OPEN-TEC-004
- 중복 판정을 애플리케이션 조건 분기로만 두지 않는다 (`TEC-DB-014`)

### 🏁 DoD
- [ ] OPEN-TEC-004 해제 확인
- [ ] 중복 수신 시험 통과
- [ ] 서명 검증 시험 통과
- [ ] 순서 뒤바뀜 처리 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-006 · FR-013 · FR-026
- **Blocks:** FR-053
- ⛔ **차단 태스크.** 답변 기한 — 표준안 D+34 / 압축안 **D+22**.

---

## FR-029 — `POST /api/internal/settlement` 잔고 반영 통보 수신

**labels:** `feature, part:backend, epic:ITG, complexity:M, wave:W4`

### 🎯 Summary
원장이 잔고 반영을 **밀어서 알려주는(push)** 경로. §9.2가 "폴링만으로는 60초 요구를 만족하지 못한다"고 결론 낸 데 대한 완화책이다.

### 🔗 References
- SRS-002 §3.2 (`SRS-IF-010`) · §9.2 CONFLICT-02 완화 ③
- SRS-002 §11 OPEN-TEC-001 — 완료 알림 60초

### ✅ Task Breakdown
- [ ] 시스템 인증 검증 (FR-026)
- [ ] 잔고 반영 통보 수신 및 상태 전이 (`assertTransition`)
- [ ] 중복 통보 멱등 처리
- [ ] 알림 발송 트리거 — **트랜잭션 밖** (`TEC-TX-002`)
- [ ] 폴링(FR-033)과의 이중 반영 방지

### 🧪 Acceptance Criteria
**Scenario 1 — push가 완료를 앞당긴다**
- Given: 원장이 잔고 반영을 통보하면
- When: 처리되면
- Then: 폴링 주기를 기다리지 않고 상태가 갱신되고 알림이 발송된다

**Scenario 2 — push와 폴링이 겹쳐도 한 번만**
- Given: push 수신 직후 폴링 배치가 같은 건을 확인하면
- When: 둘 다 처리를 시도하면
- Then: **상태 전이와 알림이 각각 한 번만 발생한다**

### ⚙️ Constraints
- ⚠️ **이 엔드포인트가 있어도 원장 측이 호출해주지 않으면 무용지물이다.** §9.2 결론 — "원장 측 push 연동이 필요하다". 외부 팀 요청은 착수 첫날 발송
- `TEC-TX-002` — 알림은 트랜잭션 밖

### 🏁 DoD
- [ ] push 수신 처리 시험 통과
- [ ] push/폴링 이중 반영 방지 시험 통과
- [ ] 원장 측 연동 요청 발송 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-013 · FR-026
- **Blocks:** None
