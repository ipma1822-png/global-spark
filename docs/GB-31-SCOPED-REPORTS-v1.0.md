# GB-31 — 성장기지 통계·보고서 자동생성

Version: v3.47.0

## 목적
GLOBAL SPARK의 운영·성장·캠페인 데이터를 HQ / 국가 / 지역 / 성장기지 권한별 일간·주간·월간·연간 보고서로 자동 저장하고 조회한다.

## 핵심 구조
- `public.spark_scoped_reports`: 기간별 보고서 스냅샷 저장
- `spark_internal.report_scope_metrics(...)`: 권역별 실제 지표 계산
- `spark_internal.save_scoped_report(...)`: 보고서 저장/갱신
- `spark_internal.save_all_reports_for_period(...)`: 전체 권역 저장
- `spark_internal.run_report_schedule()`: 일/주/월/연 자동 스케줄
- `public.spark_scoped_reports(...)`: 권한범위 내 보고서 조회
- `public.spark_generate_my_report(...)`: 권한범위 내 지정 기간 보고서 생성

## 자동 생성
Cron: `global-spark-scoped-reports-daily`
- 매일 10:00 KST: 전일 일간 보고서
- 월요일: 직전 7일 주간 보고서
- 매월 1일: 전월 월간 보고서
- 매년 1월 1일: 전년도 연간 보고서

## 주요 지표
성장기지 수, 공식 성장기지 수, 활성회원, 활동건수, 참여자, 순 XP, 캠페인 활동, 운영알림, HIGH/CRITICAL 알림, 완료업무, 기한초과 업무, 평균 운영건강도, 평균 LEVEL 점수.

## 권한
- HQ: 전체 권역
- 국가관리자: 담당 국가 보고서
- 지역관리자: 담당 지역 보고서
- 성장기지 STAFF: 자기 성장기지 보고서
- anon: 신규 보고서 RPC 실행 불가

## GB-31 최초 실제 스냅샷
2026-09-04 일간 보고서를 실제 데이터로 저장했다. HQ / KR / KR:울산 / KMT-000001 4개 권역이며, 활동 109건, 참여자 69명, 순 XP 545, 캠페인 활동 1건이다. 공식 성장기지는 0곳이다.

## UI
- `scoped-reports.html`
- COMMAND CENTER에서 `📑 통계·보고서`로 진입

## 비고
보고서는 통계 스냅샷이며 과거 회원 상태를 재구성하는 회계형 원장과는 다르다. 기존 활동·XP·캠페인·운영업무·알림 데이터는 수정하지 않는다.