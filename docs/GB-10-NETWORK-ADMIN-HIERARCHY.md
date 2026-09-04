# GB-10 — 국가관리자·지역관리자 권한계층 시스템

버전: v3.26.0

## 목적
GLOBAL SPARK 성장기지 운영권한을 HQ → 국가관리자 → 지역관리자 → 성장기지로 분리한다.

## 권한 구조
- HQ: 전 세계 전체 관제, 국가·지역 관리자 지정/중지
- 국가관리자(country_admin): 지정 국가의 모든 성장기지 관제
- 지역관리자(region_admin): 지정 국가의 지정 지역 성장기지만 관제
- 성장기지 STAFF: 기존 센터 운영권한 유지

## DB
신규 테이블 `spark_network_admin_scopes`
- auth_user_id
- role: country_admin / region_admin
- country_code
- region_name
- active
- created_by / created_at / updated_at

RLS 적용. 직접 쓰기 권한은 열지 않고 HQ 전용 RPC로 지정/중지한다.

## RPC
- `spark_network_role_context()` : 현재 로그인 사용자의 HQ/범위관리자 권한 확인
- `spark_scoped_growth_base_network()` : 권한 범위에 포함된 국가·지역·성장기지만 반환
- `spark_hq_network_admins()` : HQ 전용 권한목록 조회
- `spark_hq_assign_network_admin(...)` : HQ 전용 국가/지역 관리자 지정
- `spark_hq_set_network_admin_status(...)` : HQ 전용 권한 활성/중지

모든 신규 RPC는 anon 실행권한을 제거하고 authenticated만 호출 가능하다. 함수 내부에서 다시 HQ 또는 범위권한을 검증한다.

## UI
- `network-command.html` : HQ/국가관리자/지역관리자 공용 범위 관제
- `hq-network-admins.html` : HQ 전용 국가·지역 관리자 지정/중지

## 검증
- 실제 운영데이터를 변경하지 않는 트랜잭션 ROLLBACK 테스트 수행
- HQ 세션 기준 KR 국가관리자 임시 지정 → 범위관제 호출 성공
- 롤백 후 `spark_network_admin_scopes` 영구 행 0건 확인
- anon: 범위관제/권한지정 실행 불가
- authenticated: RPC 호출 가능하나 함수 내부 권한검증 필수
- 기존 HQ, 센터 STAFF, 회원, SPARK, 활동, 승인 데이터 변경 없음

## 보안 메모
Supabase Security Advisor의 기존 SECURITY DEFINER 및 일부 RLS 경고는 프로젝트 전반에 남아 있다. 이번 GB-10 신규 함수는 anon EXECUTE를 명시적으로 제거했고, 사용자 메타데이터가 아닌 DB 권한 테이블과 `auth.uid()`를 기준으로 권한을 판단한다.
