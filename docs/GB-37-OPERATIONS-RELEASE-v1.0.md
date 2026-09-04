# GLOBAL SPARK · GB-37 · 운영판 배포·버전 고정·현장 사용 준비

최종 운영 버전: **v3.53.0**

## 1. 완료 범위
GB-01~GB-37 성장기지 운영 로드맵 완료.

- 회원/부모 직접 활동 제출
- 성장기지 승인 및 일괄 SPARK
- LEVEL / 운영건강도 / 개선계획
- 공식 성장기지 신청·지정·공식번호·인증서
- 지정 정지·복원·취소 수명주기
- 온보딩 / 위험신호 / 지원업무 / 30일 지원
- 정기 운영평가·재인증
- 국가·지역 관리자 책임권역
- 우수·포상 후보 자동추천
- 글로벌 캠페인 운영 연결
- 일·주·월·연 자동보고
- WORLD SPARK NETWORK
- 성장기지 모바일 HOME
- HQ 통합 COMMAND CENTER
- 회귀·보안 점검
- 실제 운영 시나리오 통합시험

## 2. 현장 핵심 URL
- HQ/권역 통합 운영: `command-center.html`
- 나의 성장기지: `my-centers.html`
- 현장 모바일 HOME: `center-mobile-home.html?center={CENTER_CODE}`
- 현장 SPARK 운영: `center.html?center={CENTER_CODE}`
- 승인센터: `center-approvals.html?center={CENTER_CODE}`
- LEVEL: `center-level.html?center={CENTER_CODE}`
- 운영건강도: `center-health.html?center={CENTER_CODE}`
- 공식 인증서: `center-certificate.html?center={CENTER_CODE}`
- 공식 성장기지 지정: `official-growth-base-admin.html`
- 공개 WORLD NETWORK: `world-network.html`
- 통계·보고서: `scoped-reports.html`

## 3. GB-36 통합시험 결과
트랜잭션 내 임시 성장기지로 전체 흐름을 시험하고 최종 ROLLBACK했다.

- 신청 접수 성공
- HQ 공식지정 승인 성공
- 공식번호 생성 성공
- 인증서 발급 성공
- 대표자 연결 성공
- 회원 생성 성공
- 아이 활동 제출 pending 성공
- 센터 승인 approved 성공
- LEVEL 저장 성공
- 모바일 HOME 공식센터 조회 성공
- 운영위험 발생: health 33 / risk / 온보딩 신호 6 / 지원업무 6
- 운영조치 후 회복: health 94 / excellent / 미해결 신호 0 / 지원업무 6 완료
- 테스트 신청·센터·회원·업무 0건으로 복구
- 공식 성장기지 실제 데이터 0곳 유지

## 4. GB-37 최종 수정
공식 성장기지 모바일 HOME 화면이 `progress` 객체 자체를 표시하던 프런트엔드 오류를 수정했다.

- 기존: `ob.progress`
- 최종: `ob.progress.percent`
- UI 표시: `온보딩 진행 00%`

## 5. 현장 사용 체크리스트
1. 지도자 로그인 성공
2. `my-centers.html`에서 내 성장기지 확인
3. 모바일 HOME 진입
4. 회원 목록 확인
5. 개인 SPARK 1건 테스트
6. 그룹 SPARK 테스트
7. 아이/부모 직접 제출 1건 확인
8. 승인센터 승인 후 XP 반영 확인
9. LEVEL/운영건강도 화면 확인
10. 캠페인 참여 및 상태 확인
11. HQ COMMAND CENTER에서 동일 성장기지 확인
12. 공식 지정 전 성장기지는 `unassigned`로 표시되는지 확인
13. 공식 지정 후에만 공식번호/인증서/WORLD NETWORK 노출 확인

## 6. 배포 상태
GitHub `main` 소스는 v3.53.0 운영판으로 고정했다.

다만 저장소에 다음 배포 설정은 확인되지 않았다.
- `package.json`
- `.openai/hosting.json`
- GitHub Pages workflow

따라서 GitHub main 반영만으로 실제 웹사이트가 자동 배포됐다고 간주하지 않는다.

실제 운영 호스팅이 별도로 존재한다면 **새 사이트를 만들지 말고 기존 운영 프로젝트/URL을 유지한 채 GitHub main을 배포**해야 한다.

## 7. 운영판 보호 원칙
- 기존 회원·활동·XP 원장 삭제 금지
- `spark_ledger` 추적성 유지
- KMT CLASS Connector 및 기존 센터 흐름 보호
- 미성년자 이름·사진·연락처 공개 네트워크 노출 금지
- 공식 미지정 성장기지를 공식으로 표시 금지
- 공개 WORLD NETWORK는 정상 `official` 성장기지만 노출
- 상태값 표준 유지: task 완료=`done`, campaign 진행=`published`

## 8. 최종 릴리스
**GLOBAL SPARK Growth Base Operations · GB-37 · v3.53.0**
