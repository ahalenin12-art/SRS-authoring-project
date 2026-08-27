# Epic `ADP` — External Adapters (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §2.3 · §8.2 · §9.6

> **어댑터 4종 중 3종만 묶었다.** 예탁결제원 어댑터(FR-018)는 **차단 태스크**라 격리했다 — 함께 묶었으면 멀쩡한 어댑터 3종까지 OPEN-TEC-004에 걸렸을 것이다.

---

## FR-017 — 외부 연동 어댑터 3종 (원장 · 마이데이터 · 알림)

**labels:** `feature, part:backend, epic:ADP, complexity:M, wave:W2`

### 🎯 Summary
`lib/adapters/`의 어댑터 3종을 구현한다. 같은 디렉터리·같은 패턴이라 하나의 작업 단위로 묶었다. **전이 후행이 많아(직접 6건) 조기 완료가 중요하다.**

### 🔗 References
- SRS-002 §2.3 `lib/adapters/ledger.ts` · `mydata.ts` · `notification.ts`
- SRS-002 §8.2 `LEDGER_API_BASE` · `MYDATA_API_BASE`
- SRS-002 §4.4 `TEC-TX-002` — 외부 호출은 트랜잭션 **밖**에서

### ✅ Task Breakdown
- [ ] `ledger.ts` — 연금 원장 조회 클라이언트 (잔고·평가액·계좌 정보)
- [ ] `mydata.ts` — 마이데이터 연동 클라이언트 (보유 종목·평가액)
- [ ] `notification.ts` — 알림 발송 클라이언트
- [ ] 공통 — 타임아웃·재시도 정책, 인증키를 환경 변수로 분리
- [ ] 공통 — 실패·타임아웃을 **구분 가능한 에러 신호**로 상위에 전달 (폴백 판정 FR-015의 입력)

### 🧪 Acceptance Criteria
**Scenario 1 — 정상 조회**
- Given: 유효한 인증 정보와 계좌 식별자로
- When: 원장·마이데이터를 조회하면
- Then: 타임아웃 내에 정상 응답을 반환한다

**Scenario 2 (실패 흐름) — 실패 유형이 구분된다**
- Given: 외부 시스템이 타임아웃 또는 오류를 반환하면
- When: 어댑터가 이를 받으면
- Then: **타임아웃과 오류가 구분 가능한 형태**로 상위에 전달된다 (둘의 폴백 대응이 다르다)

### ⚙️ Constraints
- `TEC-TX-002` — 알림 발송은 **트랜잭션 밖**에서 호출한다. 외부 실패가 상태를 오염시키면 안 된다
- 인증키를 코드에 하드코딩하지 않는다
- ⚠️ 어댑터는 **비즈니스 규칙을 포함하지 않는다** (§2.2 계층 책임)

### 🏁 DoD
- [ ] 어댑터 3종 구현 및 시험 통과
- [ ] 타임아웃/오류 구분 신호 확인
- [ ] 인증키 환경 변수 분리 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** FR-021 · FR-032 · FR-033 · FR-039 · FR-040 · FR-043

---

## FR-018 — `ksd.ts` 예탁결제원 어댑터

**labels:** `feature, part:backend, epic:ADP, complexity:M, wave:W2, blocked`

### 🎯 Summary
예탁결제원 단계 전문을 다루는 어댑터. **OPEN-TEC-004가 해결되기 전에는 인터페이스 규격을 확정할 수 없다.**

### 🔗 References
- SRS-002 §2.3 `lib/adapters/ksd.ts` · §9.6 CONFLICT-06
- SRS-002 §11 OPEN-TEC-004 — 예탁원 전문 수신 경로
- SRS-002 §8.2 `KSD_WEBHOOK_SECRET`

### ✅ Task Breakdown
- [ ] ⛔ **선결:** 중계 시스템 존재 여부 및 전문 규격 확인 (OPEN-TEC-004)
- [ ] 전문 파싱·직렬화 구현
- [ ] 서명 검증 유틸 (`KSD_WEBHOOK_SECRET`)
- [ ] 호출 원본 제한 검증
- [ ] 전문 규격 변경에 대비한 버전 필드 처리

### 🧪 Acceptance Criteria
**Scenario 1 — 정상 전문 파싱**
- Given: 유효한 서명이 붙은 단계 전문이 주어지면
- When: 파싱하면
- Then: `transferId` · `stageNo` · `messageSeq`가 정확히 추출된다

**Scenario 2 (실패 흐름) — 서명 불일치 거부**
- Given: 서명이 일치하지 않는 전문
- When: 검증하면
- Then: **거부되고 처리되지 않는다**

### ⚙️ Constraints
- ⛔ **Blocks Development.** SRS-002 §9.6 — "Vercel의 엔드포인트는 공개 인터넷 경로다. 금융 전용망을 통해 전문이 오가는 경우 직접 수신이 성립하지 않는다"
- 잔여 위험: "중계 시스템의 존재 여부가 확인되지 않았다"
- 완화 전제: ① 내부 중계 시스템이 본 시스템의 Route Handler를 호출 ② 요청 서명 검증 ③ 호출 원본 제한

### 🏁 DoD
- [ ] OPEN-TEC-004 해제 확인
- [ ] 전문 파싱·서명 검증 시험 통과
- [ ] 호출 원본 제한 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-001
- **Blocks:** None
- ⛔ **차단 태스크.** 답변 기한 — 표준안 D+46 / 압축안 D+34. 에스컬레이션은 기한 −5일.
