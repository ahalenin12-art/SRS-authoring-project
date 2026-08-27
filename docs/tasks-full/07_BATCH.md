# Epic `BAT` — Batch (Vercel Cron) (풀버전)

근거: [태스크 리스트 v2.0](../06_%5B%ED%83%9C%EC%8A%A4%ED%81%AC%20%EB%A6%AC%EC%8A%A4%ED%8A%B8%5D%20%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EB%B3%91%ED%95%A9%ED%8C%90.md) · [SRS-002](../04_SRS_%EC%97%B0%EA%B8%88%ED%94%8C%EB%9F%AC%EC%8A%A4_%EA%B8%B0%EC%88%A0%EC%A0%9C%EC%95%BD%EB%B0%98%EC%98%81_v1.0.md) §3.3 · §8.3 · §9.2 · §9.5

> **공통 제약** — `TEC-BATCH-001` 시크릿 검증 · `TEC-BATCH-002` 진입 직후 영업일 검증 · `TEC-BATCH-003` 멱등 · `TEC-BATCH-004` 페이지 분할 · `TEC-BATCH-005` 실행 결과 로그
>
> **Vercel Cron은 UTC 기준이고 공휴일을 모른다.** 핸들러가 직접 영업일을 판정해야 한다.

---

## FR-030 — 배치 공통 가드 (영업일 검증 · 페이지 분할 · 실행 로그)

**labels:** `feature, part:backend, epic:BAT, complexity:M, wave:W3`

### 🎯 Summary
모든 Cron 핸들러가 공유할 가드를 만든다. **H 2건의 선행**이라 단독으로 두었다.

### 🔗 References
- SRS-002 §8.3 `TEC-BATCH-002` · `TEC-BATCH-004` · `TEC-BATCH-005`
- SRS-002 §3.3 — "공휴일 판정은 Cron이 하지 않는다. 핸들러 진입 직후 영업일 여부를 확인하고 비영업일이면 즉시 반환"
- SRS-002 §9.2 CONFLICT-02 — 실행 시간 한도

### ✅ Task Breakdown
- [ ] 영업일 가드 — 진입 직후 `isBusinessDay(nowInSeoul())` 확인, 비영업일이면 `{skipped:'non-business-day'}` 반환
- [ ] 페이지 분할 유틸 — `BATCH_PAGE_SIZE` 단위 처리 (`TEC-BATCH-004`)
- [ ] 실행 결과 로그 — **대상 건수 · 성공 · 실패 · 스킵** (`TEC-BATCH-005`)
- [ ] 실행 시간 한도 초과 방지 — 잔여 대상이 있으면 다음 실행으로 이월
- [ ] 시크릿 검증 연결 (FR-026)

### 🧪 Acceptance Criteria
**Scenario 1 — 비영업일에는 처리하지 않는다**
- Given: 공휴일에 Cron이 실행되면
- When: 핸들러가 진입하면
- Then: **아무 처리 없이 스킵 응답을 반환한다** (`TEC-BATCH-002`)

**Scenario 2 — 실행 결과가 남는다**
- Given: 배치가 실행되면
- When: 완료되면
- Then: 대상 건수·성공·실패·스킵이 로그에 기록된다

**Scenario 3 — 대상이 많아도 한도 내에 끝난다**
- Given: 처리 대상이 페이지 크기를 초과하면
- When: 실행되면
- Then: 페이지 단위로 처리하고 실행 시간 한도 내에 반환한다

### ⚙️ Constraints
- ⚠️ **Cron 스케줄은 UTC다.** `0 0 * * 1-5`가 KST 09:00 월~금이다. 요일은 Cron이, **공휴일은 핸들러가** 판정한다
- `TEC-BATCH-004` — 실행 시간 한도 내 완료

### 🏁 DoD
- [ ] 영업일 가드 시험 통과 (공휴일 스킵)
- [ ] 페이지 분할 동작 확인
- [ ] 실행 로그 4개 항목 기록 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-008 · FR-026
- **Blocks:** FR-031 · FR-032 · FR-033

---

## FR-031 — `/api/cron/band-recalc` 밴드 재계산 (멱등 갱신)

**labels:** `feature, part:backend, epic:BAT, complexity:H, wave:W4`

### 🎯 Summary
영업일 09:00 KST에 밴드를 재계산한다. **§9.5 CONFLICT-05** — Vercel Cron은 중복 실행 가능성을 배제하지 않으므로, 리더 선출 대신 **멱등 갱신**으로 해결한다.

### 🔗 References
- SRS-002 §3.3 (`SRS-FR-022` · `SRS-BR-047`) · §9.5 CONFLICT-05
- SRS-002 §10 Impact — `SRS-FR-037` 당일 캐시 = `LockWindow.cachedOn`

### ✅ Task Breakdown
- [ ] `cachedOn < today` 인 `LockWindow`만 대상으로 조회
- [ ] 밴드 재산출 (FR-012)
- [ ] **조건을 UPDATE에 포함**해 원자적 갱신 — `where: { cachedOn: { lt: today } }`
- [ ] `cachedOn = today` 설정
- [ ] `vercel.json`에 `0 0 * * 1-5` 등록 (FR-033과 함께)

### 🧪 Acceptance Criteria
**Scenario 1 — 밴드가 갱신된다**
- Given: `cachedOn`이 어제인 `LockWindow`가 있으면
- When: 배치가 실행되면
- Then: 밴드가 재산출되고 `cachedOn`이 오늘로 갱신된다

**Scenario 2 — 중복 실행이 무해하다**
- Given: 배치가 같은 날 두 번 실행되면
- When: 두 번째가 실행되면
- Then: **대상이 0건이고 밴드 값이 변하지 않는다** (`SRS-FR-037` 당일 일관성)

**Scenario 3 — 동시 실행이 한 번만 반영한다**
- Given: 두 실행이 동시에 같은 레코드를 읽으면
- When: 갱신을 시도하면
- Then: 조건이 UPDATE에 포함되어 있어 한 번만 반영된다

### ⚙️ Constraints
- `TEC-BATCH-003` — 중복 실행 시 동일 결과 보장
- ⚠️ **조건을 조회에만 두고 UPDATE에 두지 않으면 동시 실행에서 깨진다.** §9.5 잔여 위험 항목

### 🏁 DoD
- [ ] 중복 실행 시험 통과 (2회 실행 후 값 불변)
- [ ] 동시 실행 시험 통과
- [ ] 영업일 가드 적용 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-012 · FR-030
- **Blocks:** FR-033

---

## FR-032 — `/api/cron/reconcile` 3자 정합성 보정

**labels:** `feature, part:backend, epic:BAT, complexity:H, wave:W4, blocked`

### 🎯 Summary
원장·마이데이터·자체 상태 간 불일치를 찾아 보정한다. **주기가 미확정**이다 (OPEN-TEC-002).

### 🔗 References
- SRS-002 §3.3 (`SRS-REC-003`) · §9.2 CONFLICT-02 · §11 OPEN-TEC-002
- PRD v3.1 §8.7 정합성 규칙 RC-1~5

### ✅ Task Breakdown
- [ ] ⛔ **선결:** 배치 주기 확정 (OPEN-TEC-002). 잠정값으로 착수
- [ ] 3자 데이터 조회 및 대조
- [ ] 불일치 유형 분류 (RC-1~5)
- [ ] 보정 가능 항목 자동 보정, 불가 항목은 기록 후 에스컬레이션
- [ ] 보정 이력을 감사 가능한 형태로 기록
- [ ] 페이지 분할 처리

### 🧪 Acceptance Criteria
**Scenario 1 — 불일치가 검출된다**
- Given: 원장과 자체 상태가 다른 건이 있으면
- When: 배치가 실행되면
- Then: 불일치가 유형별로 분류되어 기록된다

**Scenario 2 — 중복 실행이 무해하다**
- Given: 배치가 두 번 실행되면
- When: 두 번째가 실행되면
- Then: 이미 보정된 건은 다시 보정되지 않는다 (`TEC-BATCH-003`)

**Scenario 3 (실패 흐름) — 자동 보정 불가 건이 남는다**
- Given: 자동 보정할 수 없는 불일치가 있으면
- When: 처리되면
- Then: **임의로 덮어쓰지 않고** 기록 후 에스컬레이션한다

### ⚙️ Constraints
- ⚠️ **주기 미확정** — OPEN-TEC-002. PRD는 "시간별"을 규정했으나 서버리스에서는 Cron 주기로 재정의된다 (§9.2 완화 ①)
- 자동 보정 범위를 넘어서는 불일치를 임의 판단으로 덮어쓰지 않는다

### 🏁 DoD
- [ ] 불일치 검출·분류 시험 통과
- [ ] 멱등 시험 통과
- [ ] 보정 이력 기록 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-017 · FR-030
- **Blocks:** None
- ⛔ **차단(주기 미확정).** 답변 기한 — 표준안 D+40 / 압축안 D+28. 잠정값으로 착수 가능.

---

## FR-033 — 정기 점검 배치 2종 + `vercel.json` 스케줄 선언

**labels:** `feature, part:backend, epic:BAT, complexity:M, wave:W5, blocked`

### 🎯 Summary
잔고 반영 확인과 세율 신선도 점검, 그리고 Cron 스케줄 선언. 같은 패턴의 핸들러 2종과 그 스케줄 파일을 하나로 묶었다.

### 🔗 References
- SRS-002 §3.3 `/api/cron/settlement-check` (`SRS-FR-057`) · `/api/cron/tax-freshness` (`SRS-FR-098`)
- SRS-002 §3.3 `vercel.json` 스케줄 선언 · §8.2 `TEC-OPS-011`
- SRS-002 §11 OPEN-TEC-001 — 잔고 반영 확인 주기

### ✅ Task Breakdown
- [ ] ⛔ **선결:** 잔고 확인 주기 확정 (OPEN-TEC-001). 잠정값으로 착수
- [ ] `settlement-check` — 원장 조회로 잔고 반영 확인, 완료 상태 전이
- [ ] `tax-freshness` — 세율표 신선도 점검. **D+21 경고 / D+30 차단**
- [ ] 임계값을 `TAX_TABLE_WARN_DAYS` · `TAX_TABLE_STALE_DAYS` 환경 변수로 (`TEC-OPS-011`)
- [ ] `vercel.json` crons 등록 — `band-recalc` `0 0 * * 1-5` · `tax-freshness` `0 21 * * *`
- [ ] push 경로(FR-029)와의 이중 반영 방지

### 🧪 Acceptance Criteria
**Scenario 1 — 잔고 반영이 감지된다**
- Given: 원장에 잔고가 반영된 건이 있으면
- When: 배치가 실행되면
- Then: 완료 상태로 전이되고 알림이 발송된다

**Scenario 2 — 세율 경과일에 따라 등급이 갈린다**
- Given: 세율표 갱신 후 22일 / 31일이 지난 상태에서
- When: 점검하면
- Then: 전자는 **경고**, 후자는 **차단** 상태가 된다

**Scenario 3 — 임계값이 배포 없이 바뀐다**
- Given: `TAX_TABLE_STALE_DAYS`를 변경하면
- When: 다음 실행이 되면
- Then: **재배포 없이** 새 임계값이 적용된다 (`TEC-OPS-011`)

### ⚙️ Constraints
- ⚠️ **60초 알림 요구를 폴링만으로는 충족할 수 없다.** §9.2 결론 — 주기를 1분으로 잡아도 최악의 경우 60초를 넘긴다. **FR-029 push 연동이 병행되어야 한다**
- 세율 신선도 판정은 **서버 전용** (`TEC-CALC-004`)

### 🏁 DoD
- [ ] 핸들러 2종 시험 통과
- [ ] 경고/차단 등급 시험 통과
- [ ] `vercel.json` 등록 및 스케줄 동작 확인
- [ ] 이중 반영 방지 확인

### 🚧 Dependencies & Blockers
- **Depends on:** FR-005 · FR-017 · FR-030 · FR-031
- **Blocks:** FR-045
- ⛔ **차단(주기 미확정).** 답변 기한 — 표준안 **D+22** / 압축안 D+22. **가장 이른 기한이다.**
