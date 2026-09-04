# GB-23 — HQ 온보딩 관제·미완료 성장기지 자동감지 시스템

버전: v3.39.0

## 목적
공식 성장기지 지정 이후 HQ가 STAFF 연결, 첫 회원, 첫 활동, 승인센터 준비, LEVEL 첫 평가, 공식 프로필 확인 단계의 지연을 자동 감지하고 지원 우선순위를 확인한다.

## 자동 감지 기준
- 지정 후 1일: 활성 STAFF 0명 → HIGH
- 지정 후 3일: 활성 회원 0명 → MEDIUM
- 지정 후 7일: 첫 SPARK 활동 0건 → HIGH
- 지정 후 14일: 승인센터 준비 미확인 → MEDIUM
- 지정 후 14일: 공식 프로필 미확인 → MEDIUM
- 지정 후 30일: LEVEL 평가 이력 0건 → HIGH

조건이 해소되면 기존 신호는 자동 resolved 처리된다.

## Supabase
신규 테이블: `spark_center_onboarding_signals`

내부 함수:
- `spark_internal.upsert_center_onboarding_signal(...)`
- `spark_internal.refresh_center_onboarding_signals()`

HQ RPC:
- `spark_hq_onboarding_watch()`

Cron:
- `global-spark-onboarding-watch-daily`
- `45 23 * * *` UTC = 매일 08:45 KST

## 보안
- 신규 신호 테이블 RLS 활성화
- anon/authenticated 직접 테이블 권한 차단
- 내부 감지함수 browser role 실행 차단
- HQ 관제 RPC는 authenticated만 실행 가능하며 내부에서 `spark_is_hq_admin()` 재검사
- 아이 이름·연락처·정밀 위치는 관제 데이터에 포함하지 않음

## UI
`hq-onboarding-watch.html`

공식 성장기지별 지정 후 경과일, STAFF 수, 회원 수, 활동 수, LEVEL 이력, 수동 확인 상태 및 미해결 신호를 표시한다.

## 검증
작업 시점 실제 DB에는 공식 지정 성장기지가 0곳이므로 신호 0건이 정상이다. Cron job active=true와 `45 23 * * *` 일정을 확인했다. 가짜 공식 성장기지나 테스트 신호를 영구 저장하지 않았다.
