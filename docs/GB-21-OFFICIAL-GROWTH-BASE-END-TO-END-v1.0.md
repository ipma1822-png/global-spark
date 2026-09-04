# GB-21 · 공식 성장기지 End-to-End 운영 흐름

버전: v3.37.0

## 목적
기존 GB-02 공식 성장기지 지정 엔진과 GB-07 인증서·공개조회 기능을 재개발하지 않고, 신청자와 HQ가 처음부터 끝까지 끊김 없이 사용할 수 있도록 연결한다.

## 운영 흐름
1. 신청자는 `growth-base-apply.html`에서 공식 성장기지 신청
2. `spark_submit_hq_application(... application_type='center' ...)`로 접수 및 접수번호 발급
3. 신청자는 `growth-base-status.html`에서 접수번호 + 신청 연락처로 본인 신청상태 조회
4. HQ는 `official-growth-base-admin.html`에서 전체 공식 성장기지 파이프라인 확인
5. HQ 검토중/거절은 `spark_hq_review_official_center_application`
6. HQ 승인 시 기존 `spark_hq_approve_official_center_application`이 공식번호 `GS-{COUNTRY}-{6 digits}`와 운영센터번호를 발급하고 인증서를 자동 발급
7. 승인된 성장기지는 `growth-base.html?code=...` 공개조회 및 공식 세계 네트워크 대상이 됨

## GB-21 신규 DB 기능
- `spark_public_application_status(p_request_code,p_contact)`
  - anon 실행 허용
  - 접수번호만으로는 조회 불가
  - 신청 당시 이메일 또는 전화번호 정확 일치 필요
  - 신청자 성명/전화/이메일 등 불필요한 개인정보는 반환하지 않음
- `spark_hq_official_growth_base_pipeline()`
  - authenticated 실행 grant
  - 함수 내부 HQ 관리자 재검증
  - anon 실행 차단
  - 접수/검토/승인/거절 및 공식번호·인증서 상태 통합 반환

## 화면
- `growth-base-apply.html` — 공식 성장기지 전용 신청
- `growth-base-status.html` — 신청자 진행상태 조회
- `official-growth-base-admin.html` — HQ 공식 성장기지 지정센터
- `command-center.html` — GB-21 v3.37.0으로 갱신, 공식 성장기지 지정센터 바로가기 추가

## 보존 원칙
- 기존 `spark_hq_applications`, `spark_centers`, `spark_center_certificates` 구조 유지
- 기존 GB-02/GB-07 승인·인증서 엔진 유지
- 승인 전 신청은 공식 성장기지나 세계 네트워크에 노출하지 않음
- 기존 KMT 테스트 센터를 임의로 공식 지정하지 않음
- 아동·회원 개인정보는 공개조회에 포함하지 않음

## 검증
- anon: `spark_public_application_status` 실행 가능
- anon: `spark_hq_official_growth_base_pipeline` 실행 불가
- authenticated: HQ pipeline 실행 grant 있음 + 내부 HQ 검사
- 구현 시점 실제 DB: 공식 성장기지 0, 활성 인증서 0, 공식 성장기지 신청 0
- 전체 승인 자동 테스트는 보안 검사에서 차단되어 운영권한 우회 테스트를 하지 않음. 승인 엔진은 기존 GB-07 검증된 함수를 그대로 재사용함.

## 배포
GitHub main 및 Supabase DB 반영. 별도 사이트 배포는 수행하지 않음.
