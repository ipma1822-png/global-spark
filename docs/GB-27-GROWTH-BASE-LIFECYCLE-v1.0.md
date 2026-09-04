# GB-27 · 공식 성장기지 수명주기 · v3.43.0

## 목적
공식 성장기지의 지정 이후 상태를 HQ가 일관되게 관리한다.

`official → suspended → restored(official) → revoked / closed`

## 핵심 규칙
- 정지(suspend): `designation_status=suspended`; 운영중인 센터는 `status=paused`; 최신 활성 인증서는 `suspended`.
- 복원(restore): `designation_status=official`; paused 센터는 `active`; 정지 인증서는 `active`로 복원.
- 공식지정 취소(revoke): `designation_status=revoked`; 센터는 `paused`(이미 closed면 유지); 최신 인증서는 `revoked`.
- 성장기지 종료(close): `designation_status=revoked`, `status=closed`; 최신 인증서는 `revoked`.
- 취소/종료 후에는 같은 조치 RPC에서 복원하지 않는다. 재지정이 필요하면 별도 HQ 심사 흐름을 거쳐야 한다.

## 공개영역 연동
기존 공개 검색과 세계네트워크는 `designation_status='official'`만 노출한다. 따라서 suspended/revoked는 자동 제외된다.
공식번호 직접 공개조회는 기록 검증을 위해 해당 번호가 존재하면 현재 designation/certificate 상태를 반환하므로, 과거 지정 사실과 현재 효력 상태를 구분할 수 있다.

## 데이터
### spark_center_lifecycle_events
모든 HQ 상태변경의 전후 상태, 인증서 상태, 담당 HQ 사용자, 메모, 발생시각을 기록한다.
직접 테이블 접근은 막고 RLS를 활성화한다.

## RPC
- `spark_hq_growth_base_lifecycle()` — HQ 수명주기 현황
- `spark_hq_growth_base_lifecycle_action(p_center_code,p_action,p_note)` — HQ 상태변경

두 RPC 모두 anon 실행을 차단하고 authenticated만 EXECUTE 가능하며 함수 내부에서 `spark_is_hq_admin()`을 재검사한다.

## UI
`hq-growth-base-lifecycle.html`
- 공식/정지/취소/종료 요약
- 성장기지·공식번호·인증서 상태
- 최근 수명주기 이벤트
- 정지/복원/공식지정 취소/성장기지 종료
- 조치 메모

## 검증 원칙
현재 운영 DB에는 공식 성장기지가 없으므로 실제 지정/정지/취소 테스트 데이터를 만들지 않았다. 계명태권도는 `unassigned` 상태를 그대로 유지한다.

## 보존 원칙
- 회원, 활동, XP ledger, LEVEL 이력은 상태변경 시 삭제하지 않는다.
- 공식지정 취소와 운영데이터 삭제를 동일시하지 않는다.
- 미성년자 개인정보는 공개하지 않는다.
- 기존 공개조회/세계네트워크의 official-only 규칙을 유지한다.
