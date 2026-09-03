# GLOBAL SPARK HQ v0.7.0 — Minimal Update

이번 단계는 **실제 GLOBAL SPARK Supabase MVP 데이터베이스 설치 패키지**입니다.

## 추가된 실제 운영 구조
- `spark_centers`
- `spark_members`
- `spark_center_staff`
- `spark_activity_rules`
- `spark_activities`
- `spark_ledger` (append-only)
- RLS
- 센터 지도자 권한
- `spark_register_activity` 트랜잭션 RPC
- `spark_get_center_members`
- `spark_get_member_summary`
- 계명태권도 `KMT-000001` 제1호 실증센터 seed

## 보안 원칙
익명 사용자는 회원·활동·XP에 직접 쓰지 못합니다.
지도자는 Supabase Auth 로그인 후 자기 센터만 접근합니다.
브라우저는 XP 숫자를 전송하지 않습니다. 서버가 공식 규칙에서 XP를 읽습니다.

## 설치
GitHub 업로드 후 GLOBAL SPARK Supabase SQL Editor에서
`supabase/manual/INSTALL-v0.7.0.sql`
내용을 **GLOBAL SPARK / global-spark 프로젝트에서만** 한 번 실행합니다.

그 다음:
1. 지도자 Auth 계정 생성/로그인
2. `STAFF-GRANT-TEMPLATE-v0.7.0.sql`
3. `MEMBER-IMPORT-TEMPLATE-v0.7.0.sql`

ACTS, Global News24, CLASS, IDP 프로젝트에서는 절대 실행하지 마세요.
