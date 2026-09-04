# GLOBAL SPARK · GB-09 세계 성장기지 네트워크 · v3.25.0

## 목적
개별 성장기지 운영을 국가 → 세계 네트워크로 확장하고, 공개 네트워크와 HQ 통합관제를 분리한다.

## 공개 세계 네트워크
- 화면: `world-network.html`
- RPC: `spark_public_world_growth_base_network()`
- 공개 대상: `public_visible=true`, `designation_status='official'`, `status='active'`, 공식지정번호 존재 성장기지만 포함
- 공개 필드: 성장기지명, GS 공식지정번호, 국가코드, 지역명, 지정일, 저장된 LEVEL/운영품질
- 비공개: 아이 이름·사진·연락처·이메일·정확한 위치·운영용 센터코드
- 공식 성장기지가 0곳이면 빈 네트워크를 정직하게 표시한다.

## HQ 통합관제
- 화면: `hq-growth-network.html`
- RPC: `spark_hq_growth_base_network_command()`
- HQ 관리자 전용
- 국가별: 전체 센터, 공식센터, 회원수, 7일 활동, 7일 미활동센터, 승인대기
- 센터별: 운영코드, 공식지정상태, 회원수, 오늘/7일 활동, 승인대기, 저장된 LEVEL, 확인 필요 신호
- 확인 필요 조건: 7일 미활동, 승인대기 존재, 공식지정 suspended

## LEVEL 표시 원칙
월간 LEVEL 스냅샷이 저장되지 않은 센터를 임의로 LEVEL 1로 간주하지 않는다. `평가 미저장`으로 표시한다.

## 보안
- 공개 네트워크 RPC는 익명 실행 허용이 의도된 공개 API이며 반환 필드를 최소화한다.
- HQ 관제 RPC는 anon 실행을 명시적으로 차단하고 authenticated만 호출 가능하며 함수 내부에서 `spark_is_hq_admin()`을 다시 검증한다.
- service_role 키는 브라우저에 사용하지 않는다.

## 검증 (2026-09-05 KST)
- 실제 DB: 전체 성장기지 1, 공식지정 완료 0.
- 공개 네트워크 결과: 공식 성장기지 0, 참여 국가 0 — 정상.
- HQ 테스트: KR 1센터, 69명, 최근 7일 활동 존재, 공식 미지정 상태를 정상 반환.
- 권한: anon public network=true, anon HQ network=false, authenticated HQ network=true.

## 보안 Advisor
기존 프로젝트의 RLS-no-policy 및 SECURITY DEFINER 관련 경고가 다수 남아 있다. 이번 공개 네트워크 함수는 익명 공개가 의도된 제한형 RPC라 Advisor가 `anon_security_definer_function_executable`을 표시한다. HQ 신규 함수는 authenticated callable 경고가 표시되지만 내부 HQ 권한검사를 수행한다. 기존 경고는 사용처를 확인하지 않고 일괄 수정하지 않는다.
