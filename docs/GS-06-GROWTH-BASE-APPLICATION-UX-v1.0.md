# GS-06 — 성장기지 가입·신청 UX 완성

Version: v3.58.0
Date: 2026-09-05

## 목표
관장·원장·기관 담당자가 별도 안내 없이 모바일에서 공식 성장기지 신청부터 접수상태 조회까지 완료하도록 신청자 UX를 단순화한다.

## 구현
- `growth-base-apply.html` 전면 UX 정리
  - 작성 예상시간과 신청 준비사항 안내
  - 신청 절차를 4단계로 단순화
  - 필수정보와 선택정보를 명확히 구분
  - 휴대전화 또는 이메일 중 하나만 필수
  - 신청 완료 후 접수번호 강조
  - 최근 신청정보를 브라우저 localStorage에 저장
  - 접수번호 복사 및 즉시 상태조회 링크 제공
- `growth-base-status.html` 개선
  - URL query `code`, `contact` 자동 입력/조회
  - 같은 기기의 최근 신청 자동 불러오기
  - 접수 → HQ 검토 → 공식 지정 → 운영 시작 진행상태 표시
  - 승인 시 공식 성장기지 조회로 바로 연결

## 기존 엔진 보존
- `spark_submit_hq_application(...)` 재사용
- `spark_public_application_status(...)` 재사용
- HQ 승인 및 공식번호 발급 로직 변경 없음
- 성장기지/회원/XP/LEVEL/인증서 데이터 구조 변경 없음

## 통합검증
트랜잭션에서 임시 신청을 생성하고 접수번호로 즉시 조회했다.
- 신청 결과: request_code 생성 성공
- 상태 조회: `found=true`, `status=received`
- 조직명 일치 확인
- `ROLLBACK` 후 테스트 신청 0건 확인

## 개인정보/보안
- 상태 조회에는 접수번호와 신청 때 사용한 연락처가 모두 필요하다.
- 브라우저 저장정보는 사용자의 현재 기기 localStorage에만 저장한다.
- 승인 전에는 공식번호·인증서·WORLD NETWORK에 노출하지 않는다.

## 주요 공개 URL
- 신청: `/growth-base-apply.html`
- 상태조회: `/growth-base-status.html`

GS-06 완료.