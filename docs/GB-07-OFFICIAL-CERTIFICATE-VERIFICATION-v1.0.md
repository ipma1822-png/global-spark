# GB-07 · 공식 인증서·QR 공식조회·공개 성장기지 프로필

버전: v3.23.0

## 목적
GLOBAL SPARK 공식 성장기지의 진위를 누구나 안전하게 확인할 수 있도록 공식지정번호, 인증서, QR 조회, 공개 프로필을 연결한다.

## 공식 식별자
- 운영용 센터코드: 기존 내부 운영용으로 유지
- 공식지정번호: `GS-국가코드-6자리`
- 인증서번호: `GSC-연도-6자리`
- 공식조회는 공식지정번호를 기준으로 한다.

## 공개 항목
공식조회에는 다음만 공개한다.
- 성장기지명
- 공식지정번호
- 인증서번호
- 국가/지역
- 지정일
- 현재 지정상태
- 인증서상태
- 최신 LEVEL 및 운영품질 점수

아이 이름, 사진, 전화번호, 이메일, 지도자 개인 연락처, 정밀 위치는 공개하지 않는다.

## DB
`spark_center_certificates` 테이블을 추가했다. RLS를 활성화하고 anon/authenticated의 직접 테이블 접근은 차단한다.

주요 RPC:
- `spark_public_growth_base_lookup(text)` 공개 정확조회
- `spark_public_growth_bases(text)` 공개 성장기지 검색
- `spark_center_certificate_info(text)` 성장기지 관리자 인증정보
- `spark_issue_center_certificate(uuid)` HQ 인증서 발급

공식 성장기지 승인 RPC는 승인 시 인증서를 자동 발급하도록 확장했다.

## 화면
- `growth-base.html` : 공개 공식조회 및 검색
- `center-certificate.html` : 성장기지 인증서/QR/인쇄
- `my-centers.html` : 공식인증서 진입 버튼

## 검증
- 공개 조회 RPC는 anon 실행 가능
- 인증서 발급 RPC는 anon 실행 불가
- 인증서 테이블 RLS 활성화
- 미지정 센터는 인증서를 위조 생성하지 않고 미지정 상태로 표시
- 현재 기존 계명태권도 센터는 designation_status=unassigned이므로 공식지정 완료 전까지 공식조회 목록에 나타나지 않는다.
