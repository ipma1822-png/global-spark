# GLOBAL SPARK · GB-06 월간 LEVEL 성장리포트 v1.0

버전: v3.22.0

## 목적
GB-05의 현재 운영품질 평가를 월별 역사로 남겨 성장기지의 변화와 승급을 확인한다.

## 구현
- `spark_center_level_history`: 성장기지별 월간 평가 스냅샷. `center_id + period_month` 유일키로 같은 달 중복 방지.
- `spark_center_save_monthly_level(center_code)`: 현재 GB-05 평가를 월간 기록으로 저장/갱신하고 직전 월 LEVEL 대비 up/down/same을 반환.
- `spark_center_level_history_report(center_code, months)`: 최근 최대 36개월의 월별 점수·LEVEL·세부지표 반환.
- `spark_hq_level_candidates()`: HQ 전용. LEVEL 4 이상 또는 직전 기록 대비 10점 이상 성장한 성장기지를 우수 후보로 조회.
- `center-level.html`: 현재 평가 + 이번 달 평가 저장 + 지난달 대비 점수 + 승급/변동 이력 표시.

## 평가 원칙
평가식은 GB-05를 그대로 사용한다. 회원 수 또는 누적 SPARK 총량을 LEVEL의 직접 기준으로 사용하지 않는다.

## 보안
- 월간 기록 테이블 RLS 활성화.
- 해당 성장기지 STAFF 또는 HQ 관리자만 기록 조회.
- 저장/조회 RPC는 익명 실행 불가.
- HQ 후보 RPC는 HQ 관리자만 실행 가능.

## 회귀보호
기존 `spark_members`, `spark_activities`, `spark_ledger`, 개별/일괄 SPARK, 승인센터를 변경하지 않는다.
