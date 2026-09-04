# GLOBAL SPARK 공식지정 성장기지 업그레이드 전략 v1.0

## 0. 목적

현재 GLOBAL SPARK의 기존 CENTER 기능을 재개발하지 않고, 이미 구현된 회원 선택·SPARK 등록·일괄 지급·성장분석·미션·본부 기능을 유지한 채 `공식지정 성장기지` 운영체계로 확장한다.

핵심 목표는 다음과 같다.

> 성장기지는 활동 입력소가 아니라, 아이의 성장활동을 교육·확인·승인·인증하는 공식 현장 거점이다.

---

## 1. 절대 유지 원칙

1. 기존 `spark_centers`, `spark_center_staff`, `spark_members`, `spark_activities`, `spark_ledger` 구조와 현재 정상 기능을 우선 보존한다.
2. 기존 CENTER 화면의 회원 선택, 개별 SPARK, 일괄 SPARK, UNDO, 성장분석, 미션 기능을 삭제하거나 재개발하지 않는다.
3. SPARK XP 원장은 삭제보다 reversal(취소 원장) 방식의 추적성을 유지한다.
4. 미성년자 실명·사진·정밀 위치를 공개 페이지나 세계지도에 노출하지 않는다.
5. GLOBAL SPARK 데이터는 계명태권도 CLASS 등의 타 시스템 데이터와 소유권을 분리하고, 필요한 경우 source_system/source_member_id로 연동한다.
6. 앞으로 수천 개 성장기지와 다국가 운영을 고려해 CENTER 종속 구조를 단계적으로 MEMBERSHIP 구조로 확장한다.

---

## 2. 현재 구조에서 가장 중요한 개선점

현재 `spark_members.center_id`는 회원이 한 센터에 직접 종속되는 구조다. 단기적으로는 편리하지만, 센터 이동·복수센터 참여·과거 소속이력·국가 간 이동을 처리하기 어렵다.

따라서 기존 `center_id`는 호환성을 위해 당분간 유지하되, 새로 `spark_center_memberships`를 추가한다.

### spark_center_memberships

- id uuid PK
- member_id uuid FK
- center_id uuid FK
- membership_role text (member / child / parent_linked 등)
- status text (active / paused / ended)
- joined_at timestamptz
- ended_at timestamptz null
- is_primary boolean
- created_at timestamptz

전환 원칙:

- 기존 회원 데이터는 현재 center_id를 기준으로 membership 1건 backfill
- 기존 화면은 계속 center_id 사용 가능
- 신규 기능은 membership 우선
- 안정화 후 center_id는 `현재 대표 성장기지 캐시` 개념으로만 유지

---

## 3. 공식지정 성장기지 상태 모델

현재 `spark_centers.status`를 단순 pilot 값으로만 사용하지 않고 다음 공식 상태 체계로 확장한다.

- draft: 작성중
- applied: 신청완료
- reviewing: 본부 심사중
- approved: 공식지정
- suspended: 일시정지
- revoked: 지정취소
- closed: 운영종료

공개 페이지에는 `approved` 상태이면서 `public_visible=true`인 성장기지만 노출한다.

---

## 4. 성장기지 신청·심사·승인

기존 `spark_hq_applications`를 활용해 중복 신청 테이블을 만들지 않는다.

성장기지 신청 시 필요한 정보:

- 신청자
- 기관명
- 기관 유형(태권도장/학원/교회/학교/지역센터/기타)
- 국가
- 지역
- 연락처
- 이메일
- 예상 참여인원
- 운영 책임자
- 신청 사유

승인 흐름:

`신청 → 접수 → 심사 → 보완요청(선택) → 승인 → center 생성/연결 → 공식번호 발급 → 인증서 발급`

승인 처리에는 반드시 본부 관리자와 처리시간을 기록한다.

---

## 5. 공식 성장기지 번호

공식번호는 사람이 임의 입력하지 않고 본부 승인 시 서버에서 발급한다.

권장 형식:

`GS-{COUNTRY}-{REGION}-{SERIAL}`

예:

`GS-KR-USN-0001`

규칙:

- 동일 번호 재사용 금지
- 지정취소 후에도 번호 보존
- 공개 조회에서 번호로 현재 상태 확인 가능
- QR에는 인증서 이미지가 아니라 공식 조회 URL을 담는다

---

## 6. 성장기지 관리자 권한

### HQ SUPER ADMIN
- 모든 국가/지역/센터 조회
- 센터 승인·정지·취소·복구
- 국가/지역 관리자 임명
- 인증서 재발급
- 감사로그 확인

### COUNTRY ADMIN
- 지정 국가 센터 조회
- 신청 검토 및 추천
- 국가 통계
- 캠페인 운영

### REGION ADMIN
- 지정 지역 센터 조회
- 현장 지원
- 지역 통계

### CENTER OWNER
- 센터 기본정보 관리
- 지도자 초대/해제
- 회원 관리
- 활동 승인
- 센터 통계

### CENTER TEACHER
- 회원 조회
- 활동 입력
- 본인 권한 범위 승인
- 일괄 SPARK

### MEMBER / PARENT
- 본인 또는 연결된 아이 기록
- 활동 제출
- MY SPARK 조회

권한 판단은 user_metadata가 아니라 DB의 관리자/센터 staff 관계를 기준으로 한다.

---

## 7. 성장활동 등록 방식

성장기지는 모든 기록을 직접 입력하는 구조가 되어서는 안 된다.

### 경로 A — 아이 직접 제출
아이 또는 회원이 MY SPARK에서 활동 제출 → 승인대기

### 경로 B — 부모 제출
보호자가 연결된 아이의 활동 제출 → 승인대기

### 경로 C — 지도자 즉시 인정
센터 지도자가 현장에서 바로 SPARK 인정

### 경로 D — 단체 활동
여러 회원 선택 → 동일 활동을 한 번에 등록

센터 운영의 핵심 KPI는 `입력량`이 아니라 `승인 효율`과 `참여율`이다.

---

## 8. 승인 큐

신규 `spark_activity_submissions`를 두어 사용자 제출과 공식 확정 activity를 분리한다.

주요 필드:

- id
- member_id
- center_id
- submitted_by
- submitted_role
- proposed_activity_type
- memo
- proposed_flame
- proposed_xp
- status (pending / approved / rejected / needs_edit)
- reviewed_by
- reviewed_at
- created_at

승인 시:

1. submission 상태 갱신
2. `spark_activities` 생성
3. 공식 규칙으로 XP 계산
4. `spark_ledger` 추가
5. 레벨/배지 판정
6. 감사로그 기록

사용자가 제안한 XP를 그대로 신뢰하지 않고 서버의 공식 규칙을 사용한다.

---

## 9. 성장기지 자체 성장 등급

센터 회원 수만 많다고 유리하지 않도록 절대 SPARK 총량이 아닌 균형점수를 사용한다.

권장 지표:

- 월간 참여율 30%
- 지속 참여율 20%
- 5대 불꽃 균형도 15%
- 공식 캠페인 참여 15%
- 승인 처리 품질/속도 10%
- 회원 성장 지속성 10%

성장기지 레벨 예시:

1. 새싹 성장기지
2. 불꽃 성장기지
3. 우수 성장기지
4. 리더 성장기지
5. 글로벌 성장기지

등급 명칭과 기준은 운영정책 확정 후 DB 규칙으로 관리한다.

---

## 10. 공식 인증서·QR 조회

신규 구조:

### spark_center_certificates
- id
- center_id
- certificate_no
- issued_at
- expires_at nullable
- status
- issued_by
- verification_token
- created_at

QR 공개조회에서는 다음만 노출한다.

- 성장기지명
- 공식번호
- 국가/지역(공개 수준)
- 지정일
- 현재 상태
- 성장기지 등급
- GLOBAL SPARK 공식 인증 여부

전화번호·이메일·대표자 개인 연락처·아이 데이터는 노출하지 않는다.

---

## 11. 성장기지 공개 프로필

공개 URL 예:

`/growth-base.html?code=GS-KR-USN-0001`

표시 정보:

- 공식지정 배지
- 성장기지명
- 국가/지역
- 공식번호
- 지정일
- 성장기지 레벨
- 참여 회원 수(선택적 집계)
- 누적 성장활동(집계)
- 5대 불꽃 분포(집계)
- 최근 공식 캠페인
- QR 공식검증

개별 회원 이름이나 사진은 공개하지 않는다.

---

## 12. 세계 성장기지 지도

세계지도 데이터는 실제 센터 주소를 그대로 공개하지 않고 공개용 위치 필드를 별도 둔다.

- country_code
- region_name
- public_city
- public_lat / public_lng (선택, 도시 중심 수준)

이를 통해 `내 주변 성장기지 찾기` 기능을 만들되 미성년자·개인정보 위험을 최소화한다.

---

## 13. 성장기지 AI 코치

AI는 점수를 임의로 지급하는 권한자가 아니라 운영 보조자로 사용한다.

AI가 할 일:

- 제출 문장을 5대 불꽃 후보로 분류
- 활동 규칙 후보 추천
- 승인 대기 요약
- 미활동 회원 알림
- 5대 불꽃 편중 분석
- 다음 주 미션 추천
- 센터 주간 성장 리포트 생성

AI가 하면 안 되는 일:

- 공식 규칙을 무시한 XP 임의 결정
- 센터 승인 없이 고위험/대량 점수 지급
- 미성년자 공개 프로필 자동 생성

---

## 14. 필요한 신규/확장 DB

### 기존 유지
- spark_centers
- spark_center_staff
- spark_members
- spark_activities
- spark_activity_rules
- spark_ledger
- spark_hq_admins
- spark_hq_applications
- spark_campaigns
- spark_missions
- badge 관련 테이블

### 신규 권장
- spark_center_memberships
- spark_activity_submissions
- spark_center_certificates
- spark_center_level_history
- spark_center_audit_logs
- spark_geo_regions (국가/지역 확장 시)

### spark_centers 확장 권장 필드
- official_name
- owner_name 또는 owner_profile_id
- approved_at
- approved_by
- designation_status
- public_city
- public_profile_enabled
- current_level
- suspended_at
- revoked_at

기존 `status`와 중복될 경우 `designation_status`를 새로 만들지 않고 기존 `status`를 확장한다.

---

## 15. RLS 및 보안 원칙

- public 스키마 신규 테이블은 RLS 활성화
- authenticated 전체 허용 정책 금지
- 센터 데이터는 `spark_center_staff.auth_user_id = auth.uid()` 관계로 해당 센터만 허용
- 본부 권한은 `spark_hq_admins`의 active 관계로 판단
- user_metadata를 권한 근거로 사용하지 않음
- 공개 조회는 별도 제한 view/RPC 또는 공개필드만 가진 구조 사용
- UPDATE는 SELECT 정책 + USING + WITH CHECK 모두 검토
- service_role 키는 브라우저 코드에 절대 포함하지 않음
- 승인·취소·권한변경은 audit log에 기록

---

## 16. 화면 업그레이드

현재 CENTER 화면은 유지하면서 상단에 `공식 성장기지 운영판`을 추가한다.

### 첫 화면 핵심 6개
1. 오늘 참여
2. 승인 대기
3. 이번 주 SPARK
4. 5대 불꽃 균형
5. 성장기지 LEVEL
6. 운영 알림

### 주요 메뉴
- 오늘의 성장
- 승인센터
- 아이/회원
- 지도자
- 단체 성장
- 캠페인
- 성장분석
- 인증서/공식조회
- 성장기지 설정

모바일에서는 `승인센터`, `아이`, `단체 성장`, `오늘 현황` 4개를 우선 노출한다.

---

## 17. 구현 순서 — 기존 PHASE 번호와 충돌하지 않는 GROWTH BASE TRACK

현재 프로젝트의 기존 PHASE 번호가 이미 진행되고 있으므로 성장기지 업그레이드는 별도 Track으로 관리한다.

### GB-01 기반 안전화
- 현재 DB/화면 회귀검사
- center_memberships 도입
- 기존 member center_id backfill
- RLS/권한 점검

### GB-02 공식지정
- 신청 → 심사 → 승인
- 공식 성장기지 번호
- 상태 관리

### GB-03 승인센터
- member/parent 제출
- 승인 큐
- 승인/수정/거절/일괄승인

### GB-04 운영 효율
- 단체활동 개선
- 일괄 처리
- 주간 대표활동
- 승인 처리 통계

### GB-05 성장기지 성장
- 센터 지표
- 센터 LEVEL
- 5대 불꽃 균형
- 주간 리포트

### GB-06 공식 인증
- 인증서
- QR
- 실시간 공식조회

### GB-07 공개 네트워크
- 성장기지 공개 프로필
- 국가/지역 검색
- 세계지도

### GB-08 AI 성장코치
- 활동 분류 보조
- 승인요약
- 성장분석
- 미션 추천
- 음성 운영 보조

---

## 18. GB-01 완료 기준

GB-01은 다음 조건을 모두 만족해야 완료로 본다.

1. 현재 CENTER의 개별 SPARK 정상
2. 일괄 SPARK 정상
3. MY SPARK 집계 정상
4. `spark_ledger` 기존 값 불변
5. 기존 회원 모두 membership 연결
6. 센터 이동 이력 표현 가능
7. 기존 center_id 기반 화면 정상
8. 신규 membership 기반 조회도 정상
9. RLS 보안점검 통과
10. 회귀 오류 없음

이 기준을 통과하기 전에는 GB-02로 넘어가지 않는다.

---

## 결론

GLOBAL SPARK 공식지정 성장기지는 단순한 `센터 관리자 페이지`가 아니라 다음 역할을 동시에 가져야 한다.

> 교육 거점 + 성장활동 승인기관 + 공식 인증기관의 현장 파트너 + 지역 성장 네트워크

개발 방향은 새로 갈아엎는 방식이 아니라, 현재 안정적으로 만든 CENTER·MEMBER·ACTIVITY·LEDGER 위에 `MEMBERSHIP → APPROVAL → CERTIFICATION → PUBLIC VERIFY → GLOBAL NETWORK`를 순차적으로 얹는 방식으로 진행한다.
