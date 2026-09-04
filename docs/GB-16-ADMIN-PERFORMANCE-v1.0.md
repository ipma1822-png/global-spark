# GB-16 · 관리자 개인 업무함·운영성과 · v3.32.0

## 목적
운영업무를 개인별로 분석하여 완료율, 평균 첫 대응시간, 평균 완료시간, 기한초과 미완료, 지연완료율을 확인한다. 업무량 자체를 성과로 보지 않고 처리 품질과 속도를 함께 본다.

## Supabase
- `spark_my_operational_performance(p_days)` : 로그인 사용자의 최근 7/30/90일 개인 운영성과와 최근 업무 반환.
- `spark_hq_admin_performance(p_days)` : HQ 전용 관리자별 성과 집계.
- `spark_admin_performance_snapshots` : 향후 기간 스냅샷 저장용 기반 테이블. RLS 활성화, 직접 anon/authenticated 접근 차단.

## 검증
ROLLBACK 테스트로 임시 업무 2건을 생성해 완료율 50%, 평균 첫 대응 4시간, 평균 완료 22시간, 기한초과 미완료 1건을 확인했다. 롤백 후 실제 운영업무 0건, 스냅샷 0건을 확인했다.

## 보안
신규 RPC는 anon EXECUTE 차단, authenticated만 실행 가능. HQ 비교 RPC는 함수 내부에서 HQ 권한을 재검증한다. Security Advisor의 `RLS enabled no policy` INFO는 직접 테이블 접근을 차단하고 RPC만 사용하는 구조에 따른 의도된 상태다.

## UI
- `admin-performance.html`
- 개인 지표: 배정업무, 완료, 완료율, 기한초과 미완료, 평균 첫 대응, 평균 완료
- HQ 지표: 관리자별 완료율, 미완료, 기한초과, 지연완료율, 첫 대응시간, 완료시간
- 기간 선택: 7일 / 30일 / 90일
- `operational-focus.html`에서 관리자 성과 화면으로 연결
