# GLOBAL SPARK HQ v0.3.0 — 독립 운영 아키텍처

## 원칙
- GLOBAL SPARK는 계명태권도 CLASS, IDP, ACTS, Global News24와 데이터 소유권을 분리한다.
- CLASS STAR / 계명 성장포인트 / GLOBAL SPARK XP는 합치지 않는다.
- 지도자는 행동을 확인하고, XP는 공식 규칙이 계산한다.
- 미성년자 실명·사진·정밀 위치는 공개 LIVE에 노출하지 않는다.
- 활동 원장은 append-only를 기본으로 하며 취소는 원본 삭제보다 reversal 이벤트를 사용한다.

## 계층
GLOBAL → COUNTRY → REGION → CENTER → MEMBER → ACTIVITY

## 핵심 엔티티
countries, regions, centers, members, center_memberships, activity_types, activities, xp_ledger, levels, badges, member_badges, missions, submissions, admin_grants, audit_log, daily aggregate stats.

## MVP 데이터 흐름
CENTER 입력 → 활동 확인 → activity 생성 → 서버 규칙 계산 → xp_ledger 생성 → LEVEL/배지 판정 → MY SPARK/센터 통계 반영.

## v0.3.0 안전 상태
현재 HTML MVP는 localStorage 테스트만 수행한다. `supabase/drafts/001_core_schema.sql`은 설계 검토용이며 자동 배포 migration 폴더에 넣지 않았다.
