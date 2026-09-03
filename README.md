# CLASS → GLOBAL SPARK CONNECTOR v1.0

## 조사 결과
- 최신 CLASS STAR는 `students(id, student_code, name, photo_url)`를 직접 읽음.
- STAR 원기록은 `star_events(id, session_id, student_id, category_id, awarded_at)`.
- 현재 STAR 저장은 `class/star/star.js`의 `award()`에서 성공 후 기존 Supabase/Realtime/효과로 이어짐.
- 기존 CLASS DB에는 과거 IDP-SPARK용 `spark_member_links`가 있으므로 GLOBAL SPARK용으로 재사용하지 않음.
- GLOBAL SPARK는 별도 Supabase이므로 DB를 합치지 않고 Connector로만 연결함.

## v1.0 자동 연결 범위
1. STAR ROOM 진입 시 재원생 이름/사진/학생ID를 GLOBAL SPARK KMT-000001에 동기화.
2. CLASS의 기존 STAR 저장 성공 후 비동기로 GLOBAL SPARK 전송.
3. GLOBAL SPARK 반영 카테고리(초기 안전 규칙):
   - CARE 배려별 → 친구 배려
   - CLEANUP 정리별 → 정리정돈
   - CHALLENGE 도전별 → 운동·도전
4. 다른 일반 STAR는 CLASS에만 남음. STAR 1개=무조건 SPARK XP 방식은 사용하지 않음.
5. CLASS UNDO 후 GLOBAL SPARK도 append-only 반대 ledger로 취소.
6. GLOBAL SPARK 실패가 CLASS STAR 지급을 막지 않음.
7. `source_event_id`로 중복 전송 방지.

## 보안
- 브라우저에 service_role/secret 없음.
- KMT CLASS의 현재 Supabase JWT를 GLOBAL SPARK Edge Function으로 전달.
- Edge Function이 KMT Supabase `/auth/v1/user`로 실제 세션을 검증하고 `class-admin@ipma.kr`만 허용.
- GLOBAL SPARK service_role은 Edge Function 서버 환경에서만 사용.

## 적용 순서
A. GLOBAL SPARK DB에서 `GLOBAL-SPARK/supabase/manual/PATCH-CLASS-CONNECTOR-v1.0.sql` 1회 실행.
B. GLOBAL SPARK에 Edge Function `kmt-class-star` 배포. 이 함수는 외부 KMT JWT를 직접 검증하므로 Supabase 자체 JWT 검증은 OFF로 배포해야 함.
C. KMT GitHub에 아래 3개만 반영:
   - class/star/star.js
   - class/star/star-config.js
   - class/star/spark-connector.js
D. STAR ROOM 새로고침 → 사진/이름 roster sync → 배려별/정리별/도전별 테스트.

## 절대 건드리지 않은 것
CLASS Auth/RLS/attendance/Realtime/STAR 테이블/STAR 점수/공동성장/VOICE 기존 동작은 재개발하지 않음.
