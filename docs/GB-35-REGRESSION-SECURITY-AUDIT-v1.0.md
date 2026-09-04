# GLOBAL SPARK · GB-35 · 전체 회귀시험·보안·권한 정비

버전: v3.51.0

## 목적
GB-01~GB-34에서 구축한 성장기지·HQ·국가/지역 관리자·캠페인·보고서·공개 WORLD NETWORK 기능을 새로 확장하지 않고 안정화한다.

## 점검 결과
- 모든 `public.spark_%` 테이블의 RLS 활성화 여부 점검: RLS 미활성 테이블 0개.
- SECURITY DEFINER 함수의 `search_path` 설정 점검: Spark SECURITY DEFINER 함수 중 설정 누락 0개.
- 실제 상태값 확인:
  - 캠페인: `published` 1개.
  - 성장기지 운영상태: `pilot` 1개.
  - 공식지정 상태: `unassigned` 1개.
  - 운영업무는 현재 실제 행이 없어 상태 불일치 데이터 없음.
- GB-33에서 확인한 캠페인 상태는 기존 엔진 기준 `published` 유지.
- 공식 미지정 KMT-000001은 공개 공식 성장기지로 취급하지 않음.

## 보안 하드닝
PostgreSQL 기본 PUBLIC EXECUTE 상속 때문에 일부 내부/HQ RPC가 anon 역할에서 실행 가능 권한으로 남아 있음을 확인했다. 함수 내부 권한검사가 있어도 공격면을 줄이기 위해 명확히 내부용인 다음 9개 RPC에서 PUBLIC 권한을 회수하고 authenticated에만 명시적으로 EXECUTE를 부여했다.

- `spark_hq_campaign_stats()`
- `spark_hq_campaigns()`
- `spark_hq_command_dashboard()`
- `spark_hq_operational_signals()`
- `spark_hq_save_campaign(...)`
- `spark_hq_set_campaign_status(...)`
- `spark_center_growth_dashboard(text)`
- `spark_center_self_activity_monitor(text)`
- `spark_member_campaigns(uuid)`

재검증 결과 9개 모두 `anon_execute=false`, `authenticated_execute=true`.

## 의도적으로 anon을 유지한 공개 RPC
공개 홈페이지/토큰 기반 참여에 필요한 함수는 회귀를 막기 위해 유지했다. 예: 공개 성장기지 검색·공식번호 조회·WORLD NETWORK·공개 캠페인/미션·신청 접수·아이 토큰 기반 방/활동/캠페인·부모 공유 조회 등.

현재 anon 실행 가능한 Spark SECURITY DEFINER 함수는 18개이며, 이번 단계에서는 기능 목적이 명확한 공개 엔드포인트로 분류해 일괄 차단하지 않았다. GB-36 실전 시나리오에서 실제 공개 흐름을 함께 검증한다.

## 라우팅/화면 회귀 원칙
- 기존 `command-center.html`, `center.html`, `center-operations.html`, `center-mobile-home.html`, `world-network.html` 등 정상 화면을 재개발하지 않는다.
- GB-34 HQ 통합 HOME과 GB-33 모바일 HOME의 링크 구조는 유지한다.
- 존재하지 않는 별도 그룹활동 화면을 새로 만들지 않고 기존 `center.html`의 일괄 SPARK 기능을 사용한다.

## 남아 있는 보안 Advisor 항목
- 다수 RPC 전용 테이블의 `RLS Enabled No Policy`: 직접 테이블 접근 차단 + RPC 사용 설계에 따른 INFO.
- authenticated SECURITY DEFINER 경고: 함수 내부 auth/scope 검사가 있는 기존 구조가 많아 일괄 변경하지 않음.
- 공개용 SECURITY DEFINER 함수 경고: 공개 계약이 필요한 함수는 의도적으로 유지.
- `spark_now()` search_path 경고 및 Auth leaked-password protection 비활성 경고는 별도 전역 설정 이슈로 기록하며 이번 기능 안정화 단계에서 임의 변경하지 않음.

## 다음 단계
GB-36에서 실제 운영 시나리오를 `신청 → HQ 승인 → 공식번호 → 대표자 연결 → 회원 → 활동 → 승인 → LEVEL → 인증 → 건강도 → 위험감지 → 지원업무 → 회복` 순서로 통합 시험한다. 테스트 데이터는 반드시 트랜잭션 ROLLBACK 또는 명확한 임시 데이터 정리 방식으로 실제 운영 데이터에 남기지 않는다.
