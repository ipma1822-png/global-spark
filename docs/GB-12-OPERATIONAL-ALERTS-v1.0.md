# GB-12 — 운영위험 알림센터 · 조치이력 시스템

Version: **GB-12 · v3.28.0**

## 목적
GB-11의 지원 필요 신호를 실제 운영업무로 연결한다.

흐름:
`위험 감지 → 알림 생성 → 확인 → 조치 시작 → 메모 → 해결/재오픈 → 이력조회`

## 신규 테이블
- `spark_operational_alerts`
- `spark_operational_alert_actions`

두 테이블 모두 RLS 활성화. anon 직접 접근 차단. authenticated는 HQ/국가/지역 권한범위 안에서만 조회 가능.

## 자동 감지 신호
1. 최근 7일 참여율 15% 미만 → `low_participation`
2. 7일 이상 활동 없음 → `inactive_7d`
3. 승인 대기 10건 초과 → `pending_backlog`
4. 공식지정 상태 suspended → `designation_suspended`

동일 주기·동일 센터의 같은 신호는 `source_key` 고유키로 중복 생성하지 않는다. 해결 후 같은 주기에 신호가 다시 감지되면 open 상태로 재활성화된다.

## RPC
- `spark_refresh_operational_alerts()` — 권한범위의 현재 위험 신호 갱신
- `spark_operational_alert_center()` — 알림센터 요약/목록
- `spark_operational_alert_action(alert_id, action, note)` — 확인·메모·조치·해결·재오픈·무시
- `spark_operational_alert_history(alert_id)` — 조치이력 조회

모든 신규 RPC는 auth.uid() 검증과 HQ/국가/지역 범위검사를 수행하며 anon EXECUTE를 허용하지 않는다.

## UI
- `operational-alerts.html`
- 버전 `v3.28.0`
- 미확인 / 확인됨 / 조치중 / 해결 / 긴급 집계
- 알림별 조치 메모, 확인, 조치 시작, 해결, 재오픈, 이력 조회

## 검증
운영데이터를 남기지 않는 트랜잭션 테스트에서:
1. 위험 감지
2. acknowledge
3. start_action
4. resolve
5. history 조회
을 순서대로 통과했다.

테스트 후 ROLLBACK 되었으며 실제 테스트 알림과 조치이력은 0건으로 확인했다.

## 회귀 보호
- 기존 센터 활동/XP/ledger를 변경하지 않는다.
- 기존 GB-10 권한계층을 재사용한다.
- 공개 WORLD 네트워크에는 내부 운영알림을 노출하지 않는다.
- 아이 이름, 사진, 연락처는 알림 payload에 저장하지 않는다.

## 향후
GB-13에서는 알림을 단순 수동 새로고침이 아니라 일정 기반 자동 점검/본부 브리핑으로 확장할 수 있다.