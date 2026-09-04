# GB-13 — 일일 운영 브리핑·자동 위험점검 · v3.29.0

## 목적
HQ·국가관리자·지역관리자가 매일 우선 확인해야 할 성장기지와 운영위험을 자동 요약한다.

## 자동 실행
- Supabase Cron(pg_cron)
- Job: `global-spark-daily-briefing-kst-0800`
- Schedule: `0 23 * * *` (UTC) = 매일 08:00 KST
- Command: `select spark_internal.run_daily_briefing();`

## 데이터 구조
### `spark_daily_briefings`
- briefing_date
- scope_key
- scope_type: hq / country / region
- country_code / region_name
- summary JSON
- priorities JSON
- report_text
- generated_at
- 날짜+scope_key unique upsert

RLS 활성화. HQ는 전체, 국가관리자는 자기 국가, 지역관리자는 자기 지역만 조회한다.

## 내부 전용 함수
`spark_internal` 스키마은 `public`, `anon`, `authenticated`에서 직접 사용할 수 없다.
- `refresh_operational_alerts_all()`
- `build_daily_briefing(country, region)`
- `save_daily_briefing(...)`
- `run_daily_briefing()`

Cron은 로그인 JWT가 없으므로 내부 전용 함수가 전체 위험신호를 갱신하고 HQ/국가/지역 브리핑을 생성한다.

## 공개 API
- `spark_daily_briefing_center()` : 로그인 사용자의 허용범위 브리핑 조회
- `spark_refresh_my_daily_briefing()` : 현재 권한범위 수동 재생성
- anon EXECUTE 차단
- authenticated EXECUTE 허용 + 함수 내부 HQ/국가/지역 권한 재검증

## 화면
- `daily-briefing.html`
- `operational-alerts.html`에서 일일 브리핑으로 이동 가능
- 버전 GB-13 · v3.29.0

## 2026-09-05 초기 실제 브리핑
현재 운영데이터로 최초 브리핑을 생성했다.
- 성장기지 1곳
- 활성회원 69명
- 최근 7일 활동 57건
- 미해결 운영알림 1건
- 긴급 0건 / HIGH 0건
- 우선 확인 성장기지 1곳
- 현재 우선 신호: 계명태권도 최근 7일 참여율 저하

HQ 브리핑, KR 국가 브리핑, KR/울산 지역 브리핑 3건이 생성됐다.

## 검증
- Cron Job active=true 확인
- schedule=`0 23 * * *` 확인
- `spark_daily_briefings` RLS=true 확인
- 신규 공개 RPC anon EXECUTE=false 확인
- HQ JWT 컨텍스트에서 2026-09-05 브리핑 3건 정상 조회
- Security Advisor 재실행. 프로젝트 기존 SECURITY DEFINER/RLS 경고는 별도 보안정비 과제로 유지.

## 보존 원칙
- 기존 GB-01~GB-12 기능 변경 금지
- 아이 개인정보를 브리핑에 저장하지 않음
- 정확한 위치/전화/이메일 미포함
- 운영 알림은 센터 단위 집계만 사용
- 브라우저에 service_role/secret 미노출
