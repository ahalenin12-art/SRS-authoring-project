# 02. 데이터 모델 (ERD)

> 출처: `02_SRS_연금플러스_v1.0.md` §6.4 · §6.4 · §6.4
> 이 문서는 **무엇을 어떤 관계로 저장하는가**를 정의한다. 물리 스키마가 아니라 논리 모델이다.

---

## 1. 설계 원칙

SRS §6.4의 4개 규칙이 이 모델 전체를 지배한다.

| # | 규칙 | 모델에서의 반영 |
|:---:|---|---|
| D-1 | 모든 추정 필드에 `layer` + `confidence`를 부여한다 | `HOLDING`, `LOCK_WINDOW`, `TRADING_WINDOW`, `STAGE_EVENT`에 두 컬럼이 있다 |
| D-2 | 날짜는 단일값이 아니라 밴드로 저장한다 | `LOCK_WINDOW`가 `end_band_from` / `end_band_to` 두 컬럼을 갖는다. 단일 `end_date`는 **없다** |
| D-3 | `critical_path_holding`은 서버가 지정한다 | `TRANSFER.critical_path_holding_id`가 FK로 존재. 프런트가 계산하지 않는다 |
| D-4 | `trading_window`는 `confidence`가 낮으면 `LOCKED`로 내려 쓴다 | `TRADING_WINDOW.confidence` 값에 따라 조회 시점에 강등 |

> **왜 날짜를 밴드로 저장하는가.** ③④ 구간은 이관사 내부 처리라 실시간 조회 경로가 없다(SRS L-1). 단일 날짜로 저장하면 그 값을 확정처럼 보여주게 되고, 금소법 §21①의 단정 금지에 걸린다. **저장 구조 자체가 단정을 막는다.**

---

## 2. 전체 ERD

```mermaid
erDiagram
    CUSTOMER ||--o{ ACCOUNT : "보유"
    ACCOUNT ||--o{ TRANSFER : "이관 대상"
    ACCOUNT ||--|| FUND_SOURCE_BALANCE : "재원 구성"
    ACCOUNT ||--o{ WITHDRAWAL_REQUEST : "인출 시뮬레이션"
    ACCOUNT ||--o| DEDUCTION_CERT : "공제확인서"

    TRANSFEROR ||--o{ TRANSFER : "이관사"
    TRANSFER ||--o{ HOLDING : "보유 종목"
    TRANSFER ||--|| LOCK_WINDOW : "잠금 구간"
    TRANSFER ||--|| TRADING_WINDOW : "매매 상태"
    TRANSFER ||--o{ STAGE_EVENT : "단계 전문"
    TRANSFER ||--o{ AUDIT_LOG : "감사 기록"
    HOLDING }o--|| SETTLE_DAYS_DICT : "결제 규정 참조"

    WITHDRAWAL_REQUEST ||--o{ TAX_BUCKET_BREAKDOWN : "재원별 차감"
    WITHDRAWAL_REQUEST ||--|| PENSION_LIMIT_INPUT : "한도 입력값"
    TAX_BUCKET_BREAKDOWN }o--|| TAX_RATE_CONFIG : "세율 참조"

    CUSTOMER {
        string customer_id PK
        string name
        date   birth_date
        bool   is_pb_assigned "PB 배정 여부 · 대상 선별"
    }

    ACCOUNT {
        string  account_id PK
        string  customer_id FK
        string  account_type "IRP · 연금저축 · DC · DB"
        bool    is_own_account "자사 여부 · 세액 산출 가부"
        date    opened_at "계좌 개설일"
        date    inherited_join_date "승계 가입일"
        bool    join_date_inherited "승계 플래그 · null 허용"
        bool    from_db_transfer "2013.3.1 전 DB 이체분"
        date    pension_start_applied_at "한도용 연차 기산"
        date    first_receipt_at "감면율용 연차 기산 · 위와 별개"
        decimal eval_amount_at_period_start "과세기간 개시일 평가액"
        decimal withdrawn_this_year "당해 누적 인출액"
    }

    FUND_SOURCE_BALANCE {
        string  account_id PK_FK
        decimal tax_free_bucket1 "당해 납입 연금보험료"
        decimal tax_free_bucket2 "당해 전환금액"
        decimal tax_free_bucket3 "세액공제 한도 초과 납입"
        decimal tax_free_bucket4 "세액공제 미수령 · 확인서 조건부"
        decimal deferred_severance "이연퇴직소득 잔액"
        decimal deferred_severance_rate "적용 퇴직소득세율"
        date    deferred_deposited_at "해외이주 3년 요건"
        decimal taxable_income "3층 세액공제분·운용수익"
        decimal item_ra_balance "라목 잔액"
        bool    item_ra_separated "라목 분리 관리 여부"
    }

    DEDUCTION_CERT {
        string  cert_id PK
        string  account_id FK
        bool    is_submitted
        decimal confirmed_amount
        date    confirmed_at "확인되는 날부터 과세제외"
    }

    TRANSFEROR {
        string transferor_id PK
        string name "이관사명"
        string main_phone "의사확인 대표번호"
    }

    TRANSFER {
        string   transfer_id PK
        string   account_id FK
        string   transferor_id FK
        string   transfer_status "DRAFT RECEIVED REQUESTED VERIFYING LIQUIDATING REMITTING COMPLETED"
        string   route "실물이전 · 계좌이체"
        datetime submitted_at "전송 확정 시각"
        datetime remitted_at "이관사 송금 시각"
        datetime settled_at "잔고 반영 시각 · 완료 판정 기준"
        string   critical_path_holding_id FK "서버가 지정"
        bool     band_hit "밴드 적중 여부 · 지표 적재"
    }

    HOLDING {
        string  holding_id PK
        string  transfer_id FK
        string  code "종목 코드"
        string  name
        string  holding_status "실물이전가능 · 현금화필요 · 판정불가"
        decimal eval_amount
        decimal realized_pl "확정 손익"
        int     settle_days "결제 소요 · null 이면 밴드 제외"
        bool    is_critical_path
        string  layer "확정 · 추정"
    }

    SETTLE_DAYS_DICT {
        string product_code PK
        string asset_class "예금 · 국내펀드 · 해외펀드 · 보험"
        int    settle_days
        date   measured_at "실측 기준일"
    }

    LOCK_WINDOW {
        string   transfer_id PK_FK
        datetime start_at "전송 확정 시각"
        date     end_band_from "해제 밴드 시작"
        date     end_band_to "해제 밴드 종료 · 최소 폭 2영업일"
        int      business_days_min
        int      business_days_max
        decimal  confidence
        int      fallback_level "1~4 폴백 사다리 단계"
        date     cached_on "당일 캐시 기준일"
    }

    TRADING_WINDOW {
        string  transfer_id PK_FK
        string  value "OPEN SELL_ONLY LOCKED REOPENED"
        bool    buy_allowed
        bool    sell_allowed
        bool    pay_allowed
        bool    claim_allowed
        decimal confidence "임계 미만이면 LOCKED 강등"
    }

    STAGE_EVENT {
        string   event_id PK
        string   transfer_id FK
        int      stage_no "1~6"
        datetime received_at "전문 수신 시각"
        string   layer "확정 · 추정"
    }

    AUDIT_LOG {
        string   log_id PK
        string   transfer_id FK
        datetime pressed_at "전송 버튼 누른 시각"
        string   auth_method "인증수단"
        date     shown_band_from "그때 표시된 밴드"
        date     shown_band_to
        datetime retain_until "10년 보존"
    }

    WITHDRAWAL_REQUEST {
        string  request_id PK
        string  account_id FK
        decimal withdrawal_amount
        string  withdrawal_reason "일반 · 주택 · 의료 · 요양 · 천재지변 · 해외이주"
        bool    is_unavoidable "부득이한 사유 여부"
        bool    exceeds_limit "한도 초과 플래그 · 지표 적재"
        bool    is_simulation_only "항상 true · 실행 아님"
    }

    PENSION_LIMIT_INPUT {
        string  request_id PK_FK
        decimal eval_amount
        int     payment_year "연금수령연차"
        int     age
        bool    has_retirement_fund "이연퇴직소득 보유"
        decimal limit_amount "산출된 한도"
        decimal remaining_amount "잔여 한도"
    }

    TAX_BUCKET_BREAKDOWN {
        string  breakdown_id PK
        string  request_id FK
        int     layer_no "1 2 3"
        int     bucket_no "1층 내부 1~4"
        decimal amount
        decimal tax_rate "실효세율"
        decimal tax_amount
        bool    within_limit "한도 내 · 초과 구분"
        decimal lost_reduction "초과로 잃은 감면액"
    }

    TAX_RATE_CONFIG {
        string  rate_id PK
        string  rate_type "연금소득세 · 기타소득세 · 퇴직소득감면"
        string  condition "연령대 · 수령연차 구간"
        decimal rate "지방소득세 포함 실효세율"
        date    effective_from "시행일"
        date    updated_at "D+30 초과 시 계산 차단"
    }
```

---

## 3. 핵심 엔터티 해설

### 3.1 `ACCOUNT` — 연차 필드가 **두 개**인 이유

| 필드 | 기산 방식 | 쓰이는 곳 |
|---|---|---|
| `pension_start_applied_at` | 최초로 연금수령할 수 있는 날이 속하는 과세기간부터 **실제 수령 여부와 무관하게** 누적 | 연금수령**한도** 산식의 분모 |
| `first_receipt_at` | **실제로 수령한** 연차만 카운트 | 이연퇴직소득 **감면율** (70/60/50%) |

이 둘을 한 필드로 합치면 한도나 감면율 중 하나가 반드시 틀린다. SRS §6.9.1이 원장 필드 분리를 명시적으로 요구한다.

### 3.2 `FUND_SOURCE_BALANCE` — 1층이 4개 버킷인 이유

인출은 법이 정한 순서로 강제된다(시행령 §40의3 ①). 1층 안에서도 순서가 있다(§40의3 ②).

| 버킷 | 재원 | 성격 |
|:---:|---|---|
| 1 | 당해 과세기간 납입 연금보험료 | 상시 존재 |
| 2 | 당해 과세기간 전환금액 (ISA 만기 전환분 등) | 상시 존재 |
| 3 | 세액공제 한도 초과 납입액 | 상시 존재 |
| **4** | **세액공제를 받지 않은 금액** | **조건부** — 공제확인서가 확인된 날부터만 1층 |

4호는 원장에 상시 존재하는 잔액이 아니다. `DEDUCTION_CERT.is_submitted`가 `false`인 동안 이 금액은 **3층에 포함되어 과세**된다. 확인서를 내는 순간 1층으로 이동하고 세액이 줄어든다 — 이것이 F2-05 화면의 존재 이유다.

`item_ra_separated`가 `false`면 연 1,500만원 판정을 수행하지 않는다. 두 조문(§40의3 ①3호 "나목~라목" vs §14③9호 나목 "나목·다목")의 적용 범위가 어긋나기 때문이다.

### 3.3 `LOCK_WINDOW` — 단일 날짜 컬럼이 없다

```
end_band_from ≤ end_band_to,  (end_band_to − end_band_from) ≥ 2영업일
```

이 제약이 스키마 레벨에서 강제된다. `cached_on`은 **당일 캐시** 키다 — 같은 날 여러 번 조회해도 값이 흔들리면 안 되기 때문이다(AC F1-04 #1).

`fallback_level`은 이 밴드가 어느 근거로 나왔는지 기록한다.

| 값 | 산출 근거 | 조건 |
|:---:|---|---|
| 1 | 이관사 × 자산구성 실측 | n ≥ 30 |
| 2 | 이관사 전체 실측 | n ≥ 30 |
| 3 | 자산구성 기준 소요 | 항상 사용 가능 |
| 4 | 업계 안내 기준 (최대 9영업일) | 최후 폴백 |

### 3.4 `AUDIT_LOG` — 왜 밴드 값을 함께 저장하는가

전송은 이체 신청이라는 전자적 의사표시다. 분쟁이 생기면 "그때 화면에 어떤 완료 예정일이 떠 있었느냐"가 쟁점이 된다. 밴드는 이후 재계산으로 바뀌므로 **전송 시점 스냅샷을 따로 남기지 않으면 복원할 수 없다.**

보존 기간은 법무·정보보호 정책으로 확정한다. 현재 설계 상한은 10년이다. 상법 §64의 상사채권 소멸시효는 5년이므로 10년의 직접 근거가 아니다.

### 3.5 `WITHDRAWAL_REQUEST.is_simulation_only` — 항상 `true`

이 엔터티는 **실제 출금 요청이 아니다.** 시뮬레이션 결과만 담는다. 실행으로 이어지는 경로를 스키마 차원에서 차단해 투자일임업 정의(자본시장법 §6⑧)에 걸리지 않게 한다.

---

## 4. 마이데이터로 채울 수 없는 필드

SRS L-2 · §3.2에 따라 **타사 계좌는 아래 필드가 비어 있다.** 세액 계산이 자사 전용인 근본 이유다.

| 엔터티 | 필드 | 마이데이터 제공 여부 |
|---|---|:---:|
| `ACCOUNT` | `eval_amount_at_period_start`, `opened_at` | **제공** |
| `FUND_SOURCE_BALANCE` | `tax_free_bucket1~4` | ✕ 미제공 |
| `FUND_SOURCE_BALANCE` | `deferred_severance`, `deferred_severance_rate` | ✕ 미제공 |
| `FUND_SOURCE_BALANCE` | `taxable_income` | ✕ 미제공 |

> `가입자부담금` / `사용자부담금` 구분은 재원 구분의 대체물이 될 수 없다. 이연퇴직소득은 사용자부담금과 다른 개념이고, 세액공제 수령 여부는 어느 필드에도 담기지 않는다.

따라서 **한도는 타사 계좌까지 계산 가능**(`eval_amount` + `opened_at`만 필요)하고, **세액은 자사 계좌 전용**이다.

---

## 5. 상태 전이가 건드리는 테이블

| 전이 | 갱신 대상 |
|---|---|
| `DRAFT` → `RECEIVED` | `TRANSFER.transfer_status`, `TRANSFER.submitted_at`, `TRADING_WINDOW`, `AUDIT_LOG` 신규 |
| `REQUESTED` → `VERIFYING` | `TRANSFER.transfer_status`, `STAGE_EVENT` 신규 |
| `VERIFYING` → `LIQUIDATING` | `TRANSFER.transfer_status`, `HOLDING.holding_status`, `TRADING_WINDOW.value = LOCKED` |
| `LIQUIDATING` → `REMITTING` | `TRANSFER.remitted_at`, `STAGE_EVENT` 신규 |
| `REMITTING` → `COMPLETED` | `TRANSFER.settled_at`, `TRANSFER.band_hit`, `TRADING_WINDOW.value = REOPENED` |
| 병목 정리 | `HOLDING.is_critical_path`, `LOCK_WINDOW` 전체 재계산 |
| 확인서 제출 | `DEDUCTION_CERT`, 이후 `TAX_BUCKET_BREAKDOWN` 재계산 |
