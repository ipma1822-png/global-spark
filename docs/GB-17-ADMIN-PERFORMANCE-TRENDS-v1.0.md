# GB-17 — 관리자 주간·월간 성과 스냅샷·추세·개선추천 시스템

버전: v3.33.0

## 목적
GB-16의 현재 성과 지표를 주간·월간 스냅샷으로 축적해 완료율, 첫 대응시간, 완료시간, 기한초과 흐름을 기간별로 비교한다.

## 구현
- `spark_admin_performance_snapshots`에 `period_type`, `recommendation` 추가
- 주간/월간 중복방지 unique index
- 내부 함수 `spark_internal.performance_metrics`
- 내부 함수 `spark_internal.performance_recommendation`
- 내부 함수 `spark_internal.save_performance_snapshot`
- 내부 함수 `spark_internal.run_performance_snapshots`
- 사용자 RPC `spark_my_performance_trend`
- HQ RPC `spark_hq_performance_trend`
- 화면 `admin-performance-trends.html`

## 자동화
Cron job: `global-spark-admin-performance-daily`
스케줄: `15 23 * * *` UTC = 08:15 KST
- KST 월요일: 직전 주간 스냅샷 저장
- KST 매월 1일: 직전 월간 스냅샷 저장

## 개선추천 규칙
- 평가 업무 0건: 데이터 부족 안내
- 기한초과 미완료 존재: 기한초과 우선 정리
- 평균 첫 대응 >24h: 당일 확인 권장
- 완료율 <70%: 미완료 우선순위/기한 재점검
- 이전 기간 대비 완료율 +10%p 이상: 개선 유지 권장
- 기타: 안정적 운영 유지

## 권한·보안
- 스냅샷 테이블 직접 anon/authenticated 접근 차단
- `spark_my_performance_trend`: 로그인 사용자 자기 데이터만 반환
- `spark_hq_performance_trend`: 내부 HQ 권한 재검증
- 신규 RPC anon execute 차단
- 내부 저장 함수는 `spark_internal` 스키마에 유지

## 검증
- 트랜잭션 안에서 HQ 사용자 주간 스냅샷 생성 후 `spark_my_performance_trend` 조회 성공
- metrics 0건일 때 recommendation=`평가할 운영업무가 아직 없습니다.` 확인
- rollback 후 실제 snapshot count=0 확인
- Cron job active=true 확인
- 신규 두 RPC anon=false, authenticated=true 확인

## 주의
현재 실제 운영업무가 0건이므로 실제 영구 스냅샷은 아직 없다. 첫 주간/월간 스냅샷은 실제 운영업무가 발생한 뒤 예약 실행 시 자동 생성된다.
