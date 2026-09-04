# GB-33 — 성장기지 관리자 모바일 HOME v1.0

Version: **v3.49.0**

## 목적
현장 성장기지 지도자가 휴대폰 하나로 오늘 필요한 운영을 가장 먼저 확인하고 기존 정상 기능으로 빠르게 이동하도록 한다.

## 원칙
- 기존 `center.html`, `center-operations.html`, 승인, LEVEL, 건강도, 온보딩 기능을 재개발하지 않는다.
- 모바일 HOME은 기존 기능 위의 운영 허브다.
- 센터 STAFF는 자기 성장기지만 조회한다.
- HQ/권역 관리자는 기존 `spark_internal.can_manage_center()` 범위 안에서만 접근한다.
- 아이 이름·사진·연락처를 HOME 집계 응답에 포함하지 않는다.

## 신규 RPC
`public.spark_center_mobile_home(p_center_code text)`

반환:
- 성장기지 기본 정보 및 현재 역할
- 승인대기
- 오늘/최근 7일 SPARK
- 진행/기한초과 운영업무
- 활성회원 수
- 최신 운영건강도
- 최신 LEVEL
- 현재 글로벌 캠페인 및 성장기지 참여상태
- 공식 성장기지 온보딩 상태
- 기존 기능 바로가기

권한:
- anon: 실행 불가
- authenticated: EXECUTE 허용
- 함수 내부에서 STAFF/HQ/권역 관리자 범위 재검사

## 모바일 HOME
파일: `center-mobile-home.html`

주요 영역:
1. 오늘 먼저 할 일
2. 바로 실행
3. 운영건강도·LEVEL
4. 글로벌 캠페인 참여/취소
5. 공식 성장기지 상태·온보딩
6. 하단 고정 HOME / SPARK / 승인 / 내 센터 메뉴

## 기존 기능 연결
- 승인: `center-approvals.html`
- 회원·개인 SPARK·그룹 SPARK: 기존 `center.html`
- 센터 실전 운영판: `center-operations.html`
- LEVEL: `center-level.html`
- 건강도: `center-health.html`
- 온보딩: `center-onboarding.html`
- 인증서: `center-certificate.html`

## 회귀 방지
GB-33은 기존 SPARK 등록·일괄 SPARK·UNDO·아이 직접기록·부모 공유·성장코치·캠페인 XP 엔진을 변경하지 않는다.

## 현장 운영 의도
지도자는 매일 복잡한 메뉴를 찾는 대신 모바일 HOME에서 승인대기와 오늘 활동량을 먼저 보고 필요한 작업으로 바로 이동한다. 대규모 성장기지는 개별 수기 입력보다 아이/부모 직접기록 승인과 기존 그룹 SPARK 기능을 우선 사용한다.
