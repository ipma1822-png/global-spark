# GB-22 — 공식 성장기지 자동 온보딩 시스템

버전: v3.38.0

## 목적
공식 성장기지 승인 직후부터 실제 운영 시작까지 필요한 준비를 자동 체크리스트로 안내한다.

## 7단계
1. 대표자·STAFF 연결 — active `spark_center_staff`가 있으면 자동 완료
2. 첫 회원 등록 — active `spark_members`가 있으면 자동 완료
3. 첫 SPARK 활동 기록 — `spark_activities`가 있으면 자동 완료
4. 승인센터 준비 확인 — 운영자가 직접 확인 완료
5. 첫 LEVEL 운영평가 저장 — `spark_center_level_history`가 있으면 자동 완료
6. 공식 인증서 확인 — active `spark_center_certificates`가 있으면 자동 완료
7. 공식 프로필 최종 확인 — public profile 조건 + 운영자 확인

## 신규 DB
- `public.spark_center_onboarding`
  - 수동 확인이 필요한 `approval_center_ready`, `profile_confirmed`만 저장한다.
  - 자동완료 항목은 기존 운영 데이터에서 실시간 계산한다.
  - RLS 활성화, anon/authenticated 직접 테이블 권한 없음.

## 신규 RPC
- `spark_center_onboarding_status(p_center_code text)`
  - 공식 지정 성장기지만 허용
  - HQ 또는 해당 성장기지 STAFF만 조회
  - 7단계 완료상태와 진행률 반환
- `spark_center_onboarding_confirm(p_center_code text,p_step text)`
  - `approval`, `profile` 두 수동 단계만 확인 가능
  - HQ 또는 해당 성장기지 STAFF만 실행

두 RPC 모두 anon 실행을 차단하고 authenticated에만 EXECUTE를 부여하며 함수 내부에서 다시 권한을 검사한다.

## UI
- `center-onboarding.html?center={center_code}`
- 진행률, 공식번호, 7단계 체크리스트, 단계별 바로가기 제공
- 실제 데이터가 생기면 자동완료 상태 갱신

## 검증
- `spark_center_onboarding` 실제 row: 0건
- anon status/confirm execute: false
- authenticated status/confirm execute: true
- 현재 `KMT-000001` 계명태권도는 designation_status=`unassigned`이므로 온보딩 RPC가 `CENTER_NOT_OFFICIAL`로 정상 거부함
- 따라서 GB-22 작업 때문에 계명태권도가 공식 성장기지로 오표시되거나 가짜 온보딩 데이터가 생성되지 않음

## 보존 원칙
- 기존 GB-02 승인엔진, GB-07 인증서/공개조회, GB-21 공식신청 파이프라인 수정 없음
- 기존 센터 운영·회원·활동·승인·LEVEL 기능 재개발 없음
- 공식 지정 상태를 우회하지 않음
