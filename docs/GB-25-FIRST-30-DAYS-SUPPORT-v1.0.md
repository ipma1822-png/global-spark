# GB-25 · 신규 공식 성장기지 초기 30일 운영지원 프로그램

버전: v3.41.0

## 목적
공식 지정된 성장기지가 첫 30일 동안 실제 운영에 안착하도록 1일·3일·7일·14일·30일 마일스톤을 자동 추적한다.

## 자동 마일스톤
- D+1: 대표자·STAFF 연결
- D+3: 첫 회원 등록
- D+7: 첫 SPARK 활동
- D+14: 승인센터 준비 + 공식 프로필 확인
- D+30: 첫 LEVEL 평가

각 항목은 실제 데이터 존재 여부로 자동 완료 판정하며, 기한을 넘긴 미완료 항목은 overdue로 계산한다.

## 상태
- on_track: 지연 없음
- attention: 지연 1건
- risk: 지연 2건 이상
- completed: 5개 핵심항목 모두 완료

## DB
### spark_center_30day_snapshots
센터별 일일 30일 지원상태 스냅샷. RLS 활성화, anon/authenticated 직접 접근 차단, RPC 전용.

### 내부 함수
- spark_internal.center_30day_support_rows()
- spark_internal.save_center_30day_snapshots()

### 공개 RPC
- spark_center_30day_support(center_code): HQ/해당 센터 관리권한 범위
- spark_hq_30day_support(): HQ 전용 전체 관제

## Cron
- job: global-spark-center-30day-daily
- schedule: 15 0 * * * UTC
- 한국시간: 매일 09:15 KST

## UI
- hq-30day-support.html
- 버전 GB-25 v3.41.0

## 현재 운영 검증
2026-09-05 기준 공식 지정 성장기지 0곳이므로 실제 30일 지원대상 및 스냅샷은 0건이 정상이다. 테스트용 공식센터나 가짜 스냅샷은 생성하지 않았다.

## 보호 원칙
- 공식 미지정 센터는 GB-25 대상에 포함하지 않는다.
- 기존 온보딩·위험신호·지원업무 체계는 유지한다.
- 아이 이름 등 개인 식별정보를 30일 HQ 화면에 노출하지 않는다.
- 마일스톤은 실제 운영데이터로 판정한다.
