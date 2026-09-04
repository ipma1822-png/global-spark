# GB-30 — 글로벌 캠페인 ↔ 성장기지 운영 완전연결

버전: v3.46.0

## 목적
HQ 캠페인이 국가·지역 관리자와 성장기지를 거쳐 회원 활동으로 이어지고, 그 결과가 다시 권역·성장기지 실적으로 집계되는 하나의 운영 흐름을 구축한다.

## 핵심 흐름
HQ 캠페인 발행 → 국가/지역 권역에서 확인 → 성장기지 참여 → 회원 캠페인 참여 → 캠페인 활동 및 XP 기록 → 국가/지역/성장기지 실적 집계 → 우수 성장기지 판단 근거 제공.

## 기존 엔진 재사용
기존 `spark_campaigns`, `spark_campaign_participations`, `spark_campaign_actions`, `spark_activities`, `spark_ledger`를 그대로 유지한다. 회원 캠페인 참여와 캠페인 활동 XP 지급 엔진을 재개발하지 않는다.

## 신규 구조
### `spark_campaign_center_enrollments`
캠페인 단위 성장기지 참여상태를 저장한다. 한 캠페인당 한 성장기지는 하나의 참여상태만 가진다. 상태는 `active` 또는 `withdrawn`이다.

기존 GB-30 이전 캠페인 참여·활동 이력이 있는 성장기지는 실제 이력을 기준으로 자동 연결했다.

## 신규 RPC
### `spark_center_campaign_join(p_center_code,p_campaign_id,p_action)`
- 성장기지 STAFF, HQ 또는 담당 국가/지역 관리자만 실행 가능
- `join`, `withdraw` 지원
- 활성 캠페인만 신규 참여 가능

### `spark_scoped_campaign_operations(p_campaign_id)`
- HQ: 전 세계
- 국가관리자: 담당 국가
- 지역관리자: 담당 국가·지역
- 캠페인, 성장기지 참여, 참여회원, 캠페인 활동, 국가별 확산 현황을 반환
- 회원 이름·사진·연락처 등 개인정보는 반환하지 않음

## 기존 RPC 연결 강화
`spark_join_campaign()`과 `spark_complete_campaign_action()`은 회원이 참여 또는 캠페인 활동을 수행하면 해당 성장기지를 자동으로 캠페인 참여상태에 연결한다. 기존 회원 참여/XP 기능은 그대로 유지한다.

## UI
`campaign-operations.html`

HQ·국가·지역 운영관리자가 권역별 캠페인 확산과 성장기지 실적을 확인한다.

## 보안
- 신규 테이블 RLS 활성화
- anon/authenticated 직접 테이블 접근 차단
- 신규 운영 RPC anon 차단
- authenticated 실행 후 함수 내부 HQ/권역/STAFF 권한 재검증

## 데이터 원칙
- 과거 실제 참여·활동은 보존하고 새 성장기지 참여 구조에 연결
- 테스트용 가짜 캠페인·성장기지·회원활동 생성 금지
- 공개 통계에서 미성년자 개인정보 노출 금지

## 배포
GitHub `main` 반영까지만 수행하며 별도 사이트 배포는 하지 않는다.