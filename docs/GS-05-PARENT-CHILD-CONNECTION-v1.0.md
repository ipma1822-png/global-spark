# GS-05 — 부모·아이 계정 연결 체계

Version: v3.57.0
Date: 2026-09-05

## 목적
부모·보호자 계정에서 자녀별 SPARK 프로필을 안전하게 생성·관리한다. 자녀에게 별도 이메일 계정을 요구하지 않고, 공개 연락처·정확한 생년월일·사진을 필수 수집하지 않는다.

## 구현
- `spark_family_children` 신규 테이블
- 보호자 개인 프로필(`spark_individual_profiles`)과 자녀 프로필 연결
- 저장 정보 최소화: 표시이름, 연령대, 활성상태
- 향후 성장기지 회원 연결용 `linked_member_id`는 nullable로 준비
- 자녀 프로필은 공개 WORLD NETWORK/공개검색에 노출하지 않음
- RLS로 보호자 본인 데이터만 조회·수정
- `spark_my_family_children()`
- `spark_add_family_child(text,text)`
- `spark_update_family_child(uuid,text,text,boolean)`
- 신규 함수는 SECURITY INVOKER
- anon EXECUTE 없음, authenticated만 실행 가능
- `family.html` 모바일 우선 자녀 관리 화면 추가

## 검증
트랜잭션 안에서 기존 인증 사용자 문맥을 사용해 임시 부모 프로필을 만들고 자녀 추가 → 목록 조회 → 이름/연령대/활성상태 수정까지 확인 후 ROLLBACK했다.

최종 확인:
- GS05 테스트 부모 프로필 0건
- GS05 테스트 자녀 프로필 0건
- anon `spark_my_family_children()` = false
- authenticated = true
- anon `spark_add_family_child(text,text)` = false
- authenticated = true

## 개인정보 원칙
미성년 아동의 이메일/전화번호/정확한 생년월일을 이번 단계에서 수집하지 않는다. 공개 네트워크에는 자녀 프로필을 노출하지 않는다. 실제 개인 SPARK 활동 기록은 GS-09에서 별도 권한모델로 연결한다.
