# GLOBAL SPARK GS-04 · 개인회원 가입·참여 시작

Version: v3.56.0

## 목적
성장기지 소속이 없는 일반 참여자와 부모·보호자가 GLOBAL SPARK Auth 계정을 만들고 자기 소유의 개인 참여 프로필을 시작할 수 있게 한다.

## 구현
- `personal-start.html`: 이메일 가입, 로그인, 개인/부모 참여유형, 국가/지역, 프로필 확인.
- `spark_individual_profiles`: Auth 사용자당 1개 프로필.
- `spark_my_individual_profile()`: 로그인한 사용자의 프로필만 조회.
- `spark_upsert_individual_profile(...)`: 로그인한 사용자의 프로필만 생성/수정.
- RLS: select/insert/update 모두 `auth.uid() = auth_user_id` 소유권 검사.
- anon 직접 테이블 접근 및 두 RPC 실행 권한 없음.
- RPC는 SECURITY INVOKER로 구현해 RLS를 우회하지 않음.

## 기존 구조 보호
- `spark_members.center_id NOT NULL` 유지.
- 가상/가짜 성장기지를 만들지 않음.
- 기존 KMT-000001 데이터와 성장기지 통계를 변경하지 않음.
- 기존 XP, LEVEL, ledger, 활동 승인 구조를 변경하지 않음.

## 미성년자 원칙
GS-04에서는 미성년 자녀의 독립 계정을 자동 생성하지 않는다. 부모·보호자 계정을 먼저 만들 수 있도록 안내하며, 부모↔아이 안전 연결은 GS-05에서 구현한다.

## 검증
- 기존 인증 사용자 문맥을 트랜잭션 내부에서만 모의.
- 프로필 upsert 후 `spark_my_individual_profile()` 조회 성공.
- 전체 테스트 ROLLBACK 후 `spark_individual_profiles` 실제 행 수 0 유지.
- anon RPC execute=false, authenticated=true 확인.
- Security Advisor에서 GS-04 신규 SECURITY DEFINER 경고 없음. 기존 프로젝트 경고는 별도 유지.

## 다음 단계
GS-05 — 부모·아이 계정/연결 체계.
