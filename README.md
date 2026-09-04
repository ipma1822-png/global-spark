# GLOBAL SPARK · 운영판 v3.53.0

GB-01~GB-37 성장기지 운영체계 구축·회귀시험·실전 통합시험을 완료한 운영 준비 버전입니다.

## 최종 운영 구조
- 개인/부모 활동 제출 → 성장기지 승인 → SPARK/XP/5대 불꽃 성장
- 성장기지 회원·그룹활동·LEVEL·운영건강도·개선계획
- 공식 성장기지 신청 → HQ 승인 → 공식번호 → 인증서 → 공개조회
- 공식 성장기지 온보딩 → 위험감지 → 지원업무 → 회복 추적
- HQ → 국가관리자 → 지역관리자 → 성장기지 STAFF 권한체계
- 글로벌 캠페인 → 성장기지 → 회원 활동 → 권역 집계
- 일간·주간·월간·연간 자동보고
- 공식 성장기지 WORLD SPARK NETWORK
- 성장기지 모바일 HOME / HQ 통합 COMMAND CENTER

## 핵심 진입 화면
- 일반 본부: `index.html`
- 나의 성장기지: `my-centers.html`
- 성장기지 모바일 HOME: `center-mobile-home.html?center={CENTER_CODE}`
- 성장기지 실전 운영: `center.html?center={CENTER_CODE}`
- 승인센터: `center-approvals.html?center={CENTER_CODE}`
- HQ/권역 COMMAND CENTER: `command-center.html`
- 공식 성장기지 지정관리: `official-growth-base-admin.html`
- 공개 WORLD NETWORK: `world-network.html`
- 통계·보고서: `scoped-reports.html`

## GB-35~36 안정화 결과
- Spark public 테이블 RLS 미활성 0개.
- 내부/HQ 전용 RPC 9개의 PUBLIC/anon 실행권 회수.
- GB-36 실제 운영 시나리오 통합시험 통과.
- 시험 성장기지: risk 33점 / 온보딩 위험 6개 / 지원업무 6건 → 운영완료 후 excellent 94점 / 미해결 위험 0개.
- 테스트 데이터와 사용 시퀀스는 모두 원상복구.
- 실제 운영 DB의 KMT-000001은 `pilot / unassigned` 그대로이며 공식 성장기지로 조작하지 않음.

## GB-36에서 수정한 회귀 오류
1. 온보딩 관제의 잘못된 `approval_center_confirmed` 참조 → `approval_center_ready`.
2. 운영건강도의 업무 완료상태 `completed` → 실제 표준 `done`.
3. 공식 성장기지 모바일 HOME 온보딩 진행률 객체 → `progress.percent` 표시.

## 운영판 고정
- Release: `GB-37`
- Version: `v3.53.0`
- Branch: `main`
- Repository: `ipma1822-png/global-spark`

## 배포 주의
현재 저장소에는 `package.json`, `.openai/hosting.json`, GitHub Pages workflow가 확인되지 않습니다. 따라서 GitHub main 업데이트가 자동 웹 배포를 의미하지 않습니다. 실제 호스팅 배포 시 기존 운영 URL/프로젝트가 있다면 그 프로젝트를 유지하고 새 사이트를 만들지 않은 채 이 main 소스를 배포해야 합니다.

## 제품 원칙
> 행동 → 인정 → 성장 → 기록 → 인증 → 공동체

> 경쟁보다 연결, 점수보다 행동, 보상보다 성장.
