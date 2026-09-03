# GLOBAL SPARK v0.8.0 — Minimal Update

이번 버전은 **SPARK CENTER 실제 로그인 + 실제 Supabase 활동등록** MVP입니다.

## 실제 흐름
1. `center.html`에서 Supabase Auth 지도자 계정 로그인
2. `KMT-000001` 계명태권도 실제 회원 목록 RPC 로드
3. 아이 선택
4. 좋은 행동 선택
5. `spark_register_activity()` 호출
6. 서버 공식 규칙으로 XP 자동 계산
7. `spark_activities` + append-only `spark_ledger` 실제 DB 기록
8. 최근 활동/UNDO/`MY SPARK` 확인

## GitHub 업로드 후 필수 1회
GLOBAL SPARK Supabase SQL Editor에서:
`supabase/manual/PATCH-v0.8.0-LIVE-MVP.sql`
내용을 실행하세요.

## 중요
- 지도자 이메일/비밀번호는 소스에 저장하지 않습니다.
- Secret/service_role key는 포함하지 않습니다.
- CLASS STAR / 계명 성장포인트 / GLOBAL SPARK XP는 계속 독립입니다.
- 현재 MY SPARK는 제1호 실증기간의 지도자 확인용 화면입니다. 부모/아이 공개 간편링크는 후속 단계에서 별도 권한모델로 만듭니다.
