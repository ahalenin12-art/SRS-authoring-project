# 05. 시퀀스 다이어그램 (Sequence Diagram)

> 출처: `ai-place-srs-v1_0.md` §6.6 · §6.7.2 인수 조건
> 이 문서는 **시간 순서로 무엇이 무엇을 부르는가**를 정의한다. 각 시퀀스는 인수 조건과 1:1로 대응한다.

---

## 목록

| ID | 시퀀스 | 대응 인수 조건 |
|---|---|---|
| [SD-01](#sd-01-예약-저장과-밴드-산출) | 예약 저장과 밴드 산출 | F1-03 #1, #2, #7, #11 |
| [SD-02](#sd-02-이체-신청-전송) | 이체 신청 전송 | F1-03 #4, #8, #10 |
| [SD-03](#sd-03-병목-종목-사전-정리와-밴드-재계산) | 병목 종목 사전 정리와 밴드 재계산 | F1-03 #5, #6 |
| [SD-04](#sd-04-진행-단계-갱신과-알림) | 진행 단계 갱신과 알림 | F1-01 #5, F1-04 #3 |
| [SD-05](#sd-05-매매-가능-여부-판정-가드레일) | 매매 가능 여부 판정 (가드레일) | F1-03 #3, #4, #9 |
| [SD-06](#sd-06-이체-완료-판정) | 이체 완료 판정 | F1-06 #1, #2, #5 |
| [SD-07](#sd-07-인출순서세액-시뮬레이션) | 인출순서·세액 시뮬레이션 | F2-03 #8, F2-04 #1, #3 |
| [SD-08](#sd-08-공제확인서-제출과-버킷-이동) | 공제확인서 제출과 버킷 이동 | F2-04 #2, F2-05 #1 |
| [SD-09](#sd-09-세율표-노후화-차단) | 세율표 노후화 차단 | F2-04 #6 |
| [SD-10](#sd-10-지연-감지와-밴드-확장) | 지연 감지와 밴드 확장 | F1-04 #4 |

---

## SD-01 예약 저장과 밴드 산출

마이데이터 응답이 3초를 넘으면 **폴백 사다리로 강등**해 개략 밴드를 낸다. 빈 화면이나 무한 로딩은 실패다.

```mermaid
sequenceDiagram
    actor C as 고객
    participant UI as F1-03 화면
    participant TS as TransferService
    participant MD as 마이데이터 어댑터
    participant LD as 연금 원장
    participant DICT as 결제규정 사전
    participant BC as BandCalculator
    participant DB as 이관 상태 저장소

    C->>UI: 예약 화면 진입
    UI->>TS: saveDraft(accountId)
    TS->>LD: 계좌·보유종목 조회
    LD-->>TS: 자사 보유 종목

    par 타사 계좌 병행 조회
        TS->>MD: 평가액·개설일 조회 (타임아웃 3초)
    end

    alt 3초 이내 응답
        MD-->>TS: 종목 상세
        TS->>DICT: settle_days 조회 (종목별)
        DICT-->>TS: 결제일수 (일부 null 가능)
        Note over TS,DICT: settle_days 가 null 인 종목은<br/>밴드 계산에서 제외 · 임의 추정 금지
        TS->>BC: calculate(holdings)
        BC->>BC: 병목 지목 (가장 느린 settle_days)
        BC->>BC: 최소 폭 2영업일 강제
        BC-->>TS: LockWindow (fallbackLevel=1~3)
    else 3초 초과 (타임아웃)
        MD--xTS: timeout
        TS->>BC: calculate(자산구성 기준만)
        BC-->>TS: LockWindow (fallbackLevel=3)
        Note over TS,UI: "대략치입니다" 병기 필수
    end

    TS->>DB: DRAFT 저장 + LOCK_WINDOW 저장
    TS-->>UI: 3그룹 판정 + 밴드 + 제한 매트릭스
    UI-->>C: 시작시각·해제밴드·영업일수 3요소 표시

    Note over C,UI: DRAFT 상태에서는 매수·매도·납입·수령<br/>4건 모두 제한되지 않음 (trading_window = OPEN)
```

---

## SD-02 이체 신청 전송

**감사 로그 적재 실패 시 전송을 롤백한다.** 기록 없는 의사표시는 허용하지 않는다.

```mermaid
sequenceDiagram
    actor C as 고객
    participant UI as F1-03 화면
    participant GW as API 게이트웨이
    participant TS as TransferService
    participant AL as AuditLogger
    participant TW as TradingWindowService
    participant KSD as 예탁원 어댑터
    participant NS as 알림 서비스
    participant DB as 이관 상태 저장소

    C->>UI: 전송 버튼
    UI->>GW: 본인 인증 요청
    GW-->>UI: 인증 완료 (수단 반환)
    Note over UI: 인증 전에는 버튼 비활성

    UI->>TS: submit(transferId, authResult, shownBand)
    Note over UI,TS: 화면에 표시 중이던 밴드 값을<br/>함께 전달 — 나중에 복원 불가

    TS->>AL: recordSubmit(시각, 인증수단, 표시밴드)

    alt 감사 로그 적재 성공
        AL-->>TS: Result.ok
        TS->>DB: transfer_status = RECEIVED
        TS->>TW: transitionOn(RECEIVED)
        TW->>DB: trading_window = SELL_ONLY
        TS->>KSD: 이체 요청 전문 송신

        alt 전문 송신 성공
            KSD-->>TS: ack
            TS->>DB: transfer_status = REQUESTED
        else 전문 송신 실패
            KSD--xTS: error
            TS->>TS: 재시도 큐 적재
            Note over TS: RECEIVED 유지<br/>화면은 "요청 전달 중"
        end

        TS->>NS: notifyReceived()
        NS-->>C: 접수 완료 알림
        TS-->>UI: 성공
        UI-->>C: F1-04 현황판으로 전환

    else 감사 로그 적재 실패
        AL--xTS: Result.fail
        TS->>TS: 전송 롤백
        TS->>DB: DRAFT 유지
        TS-->>UI: 실패 + 재시도 안내
        Note over TS,DB: 로그 누락률 0% 요구 (S-1)<br/>기록 없이 전송이 성립하면 안 됨
    end
```

**예외 — 전송 중 서버 오류**

```mermaid
sequenceDiagram
    actor C as 고객
    participant UI as F1-03 화면
    participant TS as TransferService
    participant DB as 이관 상태 저장소

    C->>UI: 전송 버튼
    UI->>TS: submit(...)
    TS--xUI: 5xx 서버 오류
    Note over TS,DB: 트랜잭션 롤백 · DRAFT 보존

    C->>UI: 화면 재진입
    UI->>TS: getTransfer(transferId)
    TS->>DB: 조회
    DB-->>TS: transfer_status = DRAFT
    TS-->>UI: DRAFT + 재전송 경로
    UI-->>C: "전송되지 않았습니다. 다시 시도하세요"

    Note over C,DB: "전송됐는지 모르는" 중간 상태로<br/>남으면 실패 (AC F1-03 #8)
```

---

## SD-03 병목 종목 사전 정리와 밴드 재계산

밴드는 **즉시 바뀌지 않는다.** 익영업일 09:00 배치 이전에 반영된다.

```mermaid
sequenceDiagram
    actor C as 고객
    participant UI as F1-03 화면
    participant TS as TransferService
    participant ORD as 주문 시스템
    participant BATCH as 밴드 재계산 배치
    participant BC as BandCalculator
    participant DB as 이관 상태 저장소

    UI-->>C: 병목 종목 안내 표시
    Note over UI,C: 당겨지는 영업일 수 + 확정 손실 금액을<br/>나란히 표시 · "정리하세요" 권유 금지

    C->>UI: 사전 매도 진행
    UI->>ORD: 매도 주문 (DRAFT 상태라 제한 없음)
    ORD-->>UI: 체결
    UI->>TS: 보유 종목 변경 통보
    TS->>DB: HOLDING 갱신 (is_critical_path 해제)

    Note over TS,DB: 이 시점에는 밴드가 아직 그대로

    BATCH->>BATCH: 익영업일 09:00 기동
    BATCH->>DB: 변경된 이관 건 조회
    DB-->>BATCH: 대상 목록
    BATCH->>BC: recalculate(transfer)
    BC->>BC: 남은 종목 기준 병목 재지목
    BC->>BC: 최소 폭 2영업일 강제
    BC-->>BATCH: 당겨진 LockWindow
    BATCH->>DB: LOCK_WINDOW 갱신 + cached_on 갱신

    C->>UI: 09:00 이후 재진입
    UI->>TS: getBand(transferId)
    TS->>DB: 조회
    DB-->>TS: 당겨진 밴드
    TS-->>UI: 밴드 + 갱신 시각
    UI-->>C: 당겨진 구간 표시

    Note over C,DB: 09:00 이후에도 이전 밴드가 남아 있으면<br/>실패 (AC F1-03 #5)
```

---

## SD-04 진행 단계 갱신과 알림

알림은 **상태 전이 시점에 60초 이내** 나간다. 야간 배치 일괄 발송은 실패다.

```mermaid
sequenceDiagram
    participant KSD as 예탁결제원
    participant AD as 예탁원 어댑터
    participant TS as TransferService
    participant BC as BandCalculator
    participant TW as TradingWindowService
    participant NS as 알림 서비스
    participant DB as 이관 상태 저장소
    actor C as 고객

    KSD->>AD: 단계 전문 수신 (③ 의사확인)
    AD->>TS: applyStageEvent(transferId, stage=3)
    TS->>DB: STAGE_EVENT 적재 (layer=확정)
    TS->>DB: transfer_status = VERIFYING

    TS->>BC: recalculate(transfer)
    Note over TS,BC: 단계 확인될 때마다 재계산<br/>신청 시점 값 고정은 실패 (AC F1-05 #1)
    BC-->>TS: 갱신된 LockWindow
    TS->>DB: LOCK_WINDOW 갱신

    TS->>NS: notifyVerificationCall(transfer)
    NS->>NS: 이관사 대표번호 조회

    alt 대표번호 존재
        NS-->>C: "1588-XXXX 로 전화가 옵니다" (60초 이내)
    else 대표번호 없음
        NS-->>C: KB증권 대표번호로 대체 안내
        Note over NS,C: 번호란 공란 발송은 실패 (AC F1-01 #6)
    end

    KSD->>AD: 단계 전문 수신 (④ 현금화 착수)
    AD->>TS: applyStageEvent(stage=4)
    TS->>DB: transfer_status = LIQUIDATING
    TS->>TW: transitionOn(LIQUIDATING)
    TW->>DB: trading_window = LOCKED
    TS->>NS: notifyLiquidationStarted()
    NS-->>C: 자산 정리 착수 알림
```

---

## SD-05 매매 가능 여부 판정 (가드레일)

이 경로가 **가드레일 지표를 만든다.** 화면이 "가능"이라 했는데 주문이 거부되면 신뢰가 무너진다.

```mermaid
sequenceDiagram
    actor C as 고객
    participant ORD as 주문 시스템
    participant TW as TradingWindowService
    participant TR as TradingWindowResolver
    participant DB as 이관 상태 저장소
    participant MON as 운영 대시보드

    C->>ORD: 매수 주문
    ORD->>TW: isOrderAllowed(accountId, BUY)
    TW->>DB: TRADING_WINDOW 조회
    DB-->>TW: value + confidence

    TW->>TR: resolve(status, confidence)

    alt confidence 임계 이상
        TR-->>TW: 매트릭스대로 판정
    else confidence 임계 미만
        TR-->>TW: LOCKED 로 강등
        Note over TR,TW: 막혔는데 열렸다고 표시하면<br/>회복 불가 · 반대는 회복 가능 (D-4)
    end

    alt 조회 타임아웃
        DB--xTW: timeout
        TW-->>ORD: LOCKED (보수 판정)
    end

    alt 허용
        TW-->>ORD: allowed
        ORD-->>C: 주문 접수
    else 거부
        TW-->>ORD: denied (reason=TRANSFER_LOCK)
        ORD-->>C: 주문 거부 안내
        ORD->>MON: 거부 로그 적재
        MON->>MON: 일간 거부율 집계
        alt 거부율 > 0.1%
            MON->>MON: 즉시 알람 + 기능 롤백
            Note over MON: 가드레일 초과 — 목표치가 아니라<br/>넘으면 멈추는 선
        end
    end
```

---

## SD-06 이체 완료 판정

**송금 통보만으로 완료를 표시하지 않는다.** 잔고 반영을 확인한 뒤에만 완료다.

```mermaid
sequenceDiagram
    participant KSD as 예탁결제원
    participant TS as TransferService
    participant BATCH as 잔고 반영 확인 배치
    participant LD as 연금 원장
    participant TW as TradingWindowService
    participant NS as 알림 서비스
    participant DB as 이관 상태 저장소
    actor C as 고객

    KSD->>TS: 송금 통보 전문 (⑤)
    TS->>DB: transfer_status = REMITTING
    TS->>DB: remitted_at 기록
    Note over TS,DB: 아직 COMPLETED 아님<br/>통보만으로 완료 표시하면 실패 (AC F1-06 #1)

    C->>TS: 현황판 조회
    TS-->>C: "송금 중" 표시

    loop 상시 배치
        BATCH->>LD: 수관 계좌 잔고 확인
        alt 잔고 미반영
            LD-->>BATCH: 미반영
            Note over BATCH: REMITTING 유지
        else 잔고 반영됨
            LD-->>BATCH: 반영 완료 + 금액
            BATCH->>DB: transfer_status = COMPLETED
            BATCH->>DB: settled_at 기록
            BATCH->>TW: transitionOn(COMPLETED)
            TW->>DB: trading_window = REOPENED

            BATCH->>BATCH: 밴드 적중 여부 판정
            BATCH->>DB: band_hit 적재

            BATCH->>NS: notifySettled() (60초 이내)
            NS-->>C: 입고 완료 알림 (야간·주말 무관)

            alt 입고 금액 차이 10% 이상
                BATCH->>DB: 차이 플래그
                Note over BATCH,C: 완료는 표시하되<br/>"금액을 확인해 주세요" + 대표번호 병기
            end
        end
    end

    C->>TS: 완료 화면 진입
    TS-->>C: 송금 시각 + 잔고 반영 시각 각각 표시
    TS-->>C: 확정 가입일 카드 (기능2 한도 산식 입력)
```

---

## SD-07 인출순서·세액 시뮬레이션

계산 **전에** 두 가드가 걸린다. 계산 후에 걸면 이미 틀린 값이 만들어진 뒤다.

```mermaid
sequenceDiagram
    actor C as 고객
    participant UI as F2-03/04 화면
    participant WS as WithdrawalService
    participant TRP as TaxRateProvider
    participant LD as 연금 원장
    participant PLC as PensionLimitCalculator
    participant URP as UnavoidableReasonPolicy
    participant WOC as WithdrawalOrderCalculator
    participant TC as TaxCalculator

    C->>UI: 인출액 15,000,000원 입력 + 사유 선택
    UI->>WS: simulate(accountId, amount, reason)

    WS->>TRP: isStale()
    alt 세율표 시행일 +30일 초과
        TRP-->>WS: true
        WS-->>UI: "세율 정보 업데이트 중입니다"
        Note over WS,UI: 낡은 값으로 계산하면 실패 (AC F2-04 #6)
    else 정상
        TRP-->>WS: false

        WS->>LD: 계좌·재원 잔액 조회
        LD-->>WS: Account + FundSourceBalance

        alt 타사 계좌
            WS->>PLC: calculate(account)
            PLC-->>WS: 한도만
            WS-->>UI: 한도 O · 세액란 공란 + 사유
            Note over WS,UI: 추정 계산하면 실패 (AC F2-03 #5)
        else 인출액 > 평가금액
            WS-->>UI: "최대 인출 가능액: N원"
            Note over WS,UI: 계산 결과를 내면 실패 (AC F2-03 #4)
        else 자사 계좌 · 정상
            WS->>URP: isUnavoidable(reason)
            URP-->>WS: 부득이 여부 + 한도 소진 여부
            Note over URP,WS: 주택 구입은 부득이한 사유가 아님<br/>한도 정상 소진 (AC F2-03 #2)

            WS->>PLC: calculate(account, 한도소진여부)
            alt 연차 11년 이상
                PLC-->>WS: 한도 없음 (산식 미적용)
            else
                PLC-->>WS: 한도 12,600,000 · 잔여 10,600,000
            end

            WS->>WOC: deduct(amount, balance, limit)
            WOC->>WOC: 1층 4버킷 순서 차감
            Note over WOC: 4호는 확인서 제출 전이면<br/>3층에 포함 (조건부)
            WOC->>WOC: 2층 이연퇴직소득 차감
            WOC->>WOC: 3층 차감
            WOC->>WOC: 한도 내/초과 분리
            WOC-->>WS: List~TaxBucket~

            WS->>TC: applyRates(buckets, account)
            TC->>TRP: rateFor(연금소득세, 57세)
            TRP-->>TC: 5.5% (지방소득세 포함)
            TC->>TC: 초과분 16.5% 적용
            TC->>TC: 잃은 감면액 산출
            TC->>TC: 1,500만원 판정
            alt 라목 미분리 계좌
                TC-->>WS: 판정 미제공
                Note over TC,WS: 게이지 숨김 + 안내 (§6.9.4)
            end
            TC-->>WS: 세액 465,960원

            WS-->>UI: 3층 소진 시각화 + 세액 + 감면 손실
            UI-->>C: 결과 표시 (p95 ≤ 1초)
            Note over UI,C: 모의계산 라벨 고정 노출<br/>실행 버튼·상담 진입점 없음
        end
    end

    C->>UI: 인출액 변경
    UI->>WS: 재계산 (≤ 300ms)
```

---

## SD-08 공제확인서 제출과 버킷 이동

4호 버킷이 **3층 → 1층으로 이동**하고 세액이 줄어든다.

```mermaid
sequenceDiagram
    actor C as 고객
    participant UI as F2-05 화면
    participant WS as WithdrawalService
    participant LD as 연금 원장
    participant WOC as WithdrawalOrderCalculator
    participant TC as TaxCalculator
    participant HT as 홈택스 (외부)

    C->>UI: 비과세 인출 관리 진입
    UI->>WS: previewWithCertificate(accountId, amount)
    WS->>LD: FundSourceBalance 조회
    LD-->>WS: bucket1~4 + is_submitted=false

    par 제출 전 계산
        WS->>WOC: deduct(제출 전 · 4호는 3층)
        WOC-->>WS: buckets_before
        WS->>TC: applyRates(buckets_before)
        TC-->>WS: 세액 465,960원
    and 제출 후 계산
        WS->>WOC: deduct(제출 후 · 4호는 1층)
        WOC-->>WS: buckets_after
        WS->>TC: applyRates(buckets_after)
        TC-->>WS: 세액 355,080원
    end

    WS-->>UI: 전/후 나란히 + 차액 110,880원
    UI-->>C: 비교 표시
    Note over UI,C: 한쪽만 표시하면 실패 (AC F2-05 #1)

    C->>UI: 확인서 발급 동선
    UI-->>C: 홈택스에서 직접 발급 안내
    Note over UI,C: 세무 전문가 알선 링크 금지<br/>(세무사법 §2조의2)
    C->>HT: 확인서 발급
    HT-->>C: 확인서
    C->>UI: 제출
    UI->>LD: DEDUCTION_CERT 등록 (confirmed_at)
    Note over LD: 확인되는 날부터 과세제외<br/>(시행령 §40의3 ② 단서)

    C->>UI: F2-04 재진입
    UI->>WS: simulate(...)
    WS-->>UI: 4호가 1층으로 이동한 결과
    UI-->>C: 세액 355,080원
```

---

## SD-09 세율표 노후화 차단

D+21에 경고, D+30에 차단. **이중화**한다 — 차단이 안 걸리면 낡은 값으로 계산된다.

```mermaid
sequenceDiagram
    participant BATCH as 세율 노후화 점검 배치
    participant CFG as 세율 설정 저장소
    participant MON as 운영 대시보드
    actor OP as 세율 운영자
    participant WS as WithdrawalService
    actor C as 고객

    loop 일간
        BATCH->>CFG: lastUpdatedAt() · effectiveFrom()
        CFG-->>BATCH: 갱신일 · 시행일

        alt 시행일 +21일 초과
            BATCH->>MON: 사전 경고
            MON-->>OP: "세율표 갱신 필요 · D+21"
        end

        alt 시행일 +30일 초과
            BATCH->>CFG: stale 플래그 설정
            BATCH->>MON: 차단 알람
            MON-->>OP: "계산 차단 발동"
        end
    end

    C->>WS: 인출 시뮬레이션 요청
    WS->>CFG: isStale()
    alt stale
        CFG-->>WS: true
        WS-->>C: "세율 정보 업데이트 중입니다"
        Note over WS,C: 결과 대신 안내 · 계산 자체를 하지 않음
    else 정상
        CFG-->>WS: false
        WS-->>C: 계산 결과 + 세율표 최종 갱신일 병기
    end

    OP->>CFG: 세율 갱신 (시행일 메타 포함)
    Note over OP,CFG: 코드 배포 없이 설정만 교체 (ADR-008)
    CFG->>CFG: stale 해제
```

---

## SD-10 지연 감지와 밴드 확장

예탁원 통보를 D+4까지 못 받으면 **단계는 유지하되** 지연을 알린다.

```mermaid
sequenceDiagram
    participant BATCH as 밴드 재계산 배치
    participant DB as 이관 상태 저장소
    participant BC as BandCalculator
    participant TS as TransferService
    actor C as 고객

    loop 익영업일 09:00
        BATCH->>DB: 진행 중 이관 건 조회
        DB-->>BATCH: 목록 + 최종 STAGE_EVENT 시각

        alt 마지막 전문 수신 후 D+4 경과
            BATCH->>BC: expand(밴드 폭 확대)
            BC-->>BATCH: 확장된 LockWindow
            BATCH->>DB: LOCK_WINDOW 갱신
            BATCH->>DB: delayed_flag = true
            Note over BATCH,DB: transfer_status 는 유지<br/>단계를 뒤로 돌리지 않음
        end
    end

    C->>TS: 현황판 조회
    TS->>DB: 상태 + 밴드 조회
    DB-->>TS: 단계 유지 + delayed_flag + 확장 밴드
    TS-->>C: 단계 표시 + "예정보다 늦어지고 있습니다" + 확장 밴드

    Note over C,DB: "접수됨"만 며칠째 그대로면 실패<br/>(AC F1-04 #4)
```

---

## 시퀀스 ↔ 요구사항 추적

| 시퀀스 | 요구사항 | 인수 조건 |
|---|---|---|
| SD-01 | FR-F1-03-01, 02, 03, 08, 10, 11 | F1-03 #1, #2, #7, #11 |
| SD-02 | FR-F1-03-04, 09 | F1-03 #4, #8, #10 |
| SD-03 | FR-F1-03-05, 06 | F1-03 #5, #6 |
| SD-04 | FR-F1-01-02, 03 · FR-F1-04-01, 02 | F1-01 #5, #6 · F1-04 #3 |
| SD-05 | FR-F1-03-07 · FR-F1-04-09 | F1-03 #3, #4, #9 |
| SD-06 | FR-F1-06-01 ~ 05 | F1-06 #1, #2, #3, #6 |
| SD-07 | FR-F2-03-02 ~ 11 · FR-F2-04-01 ~ 12 | F2-03 #1 ~ #9 · F2-04 #1, #3, #7, #8 |
| SD-08 | FR-F2-04-03 · FR-F2-05-01 ~ 03 | F2-04 #2 · F2-05 #1, #2, #4 |
| SD-09 | FR-F2-04-11 | F2-04 #6 |
| SD-10 | FR-F1-04-06 · FR-F1-05-01 | F1-04 #4 · F1-05 #1 |
