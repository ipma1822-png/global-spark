# GLOBAL SPARK · GB-02 공식지정 성장기지

## 목적
통합 신청센터의 SPARK CENTER 신청을 본부 심사 후 공식지정 성장기지로 승인하고, 국가코드 기반 공식지정번호를 자동 발급한다.

## 공식 흐름
통합 신청센터(apply.html) → spark_hq_applications(application_type=center) → 본부 운영센터 검토 → 승인 → spark_centers 생성 → 공식지정번호 발급

## 번호 체계
- 운영용 센터코드: `SPK-000001`
- 공식지정번호: `GS-{COUNTRY}-000001`
- 예: `GS-KR-000001`

두 번호를 분리한다. 기존 내부 운영 함수와 화면은 `SPK-...`를 계속 사용할 수 있고, 외부 인증·공식조회·인증서에는 `GS-...`를 사용한다.

## DB 확장
`spark_centers` 추가 필드:
- designation_code
- designation_status: unassigned / official / suspended / revoked
- designated_at
- designated_by
- source_application_id

`spark_hq_applications` 추가 필드:
- review_note
- reviewed_at
- reviewed_by
- created_center_id

## 호환성
기존 `spark_center_interest` 신청 경로는 삭제하지 않는다. 기존 본부 화면에서 사용하는 RPC를 호환 라우터로 확장하여 과거 신청과 새 통합신청을 함께 조회·처리한다.

## 보안
- 공식 승인 전용 함수는 HQ 관리자 여부를 검사한다.
- 새 승인 함수는 anon/PUBLIC 실행을 철회하고 authenticated만 호출할 수 있다.
- SECURITY DEFINER 함수는 빈 search_path를 사용하고 public 스키마를 명시한다.

## 다음 단계
GB-03: 아이·부모 활동 제출 → 성장기지 승인센터 구축.
