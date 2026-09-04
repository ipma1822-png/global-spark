# GB-15 — 마감임박·기한초과 자동감지·관리자별 할 일·에스컬레이션

Version: **GB-15 · v3.31.0**

## 목적
GB-14 운영업무를 시간 기준으로 자동 분류하고, 담당자와 상위관리자가 우선 처리해야 할 업무를 즉시 확인하도록 한다.

## 자동 분류
- 마감 24시간 이내: `due_soon`, LEVEL 0, 담당자 우선
- 기한초과 24시간 미만: `overdue`, LEVEL 1, 관리자 확인
- 기한초과 24~72시간: `overdue_24h`, LEVEL 2, 국가·지역 네트워크 관리자 우선
- 기한초과 72시간 이상: `overdue_72h`, LEVEL 3, HQ 우선

자동화는 담당자를 변경하거나 업무를 완료하지 않는다. 우선순위와 에스컬레이션 신호만 생성한다.

## DB
### `spark_operational_task_escalations`
업무별 현재/과거 마감 신호를 기록한다. RLS 활성화, `anon`/`authenticated` 직접 테이블 접근은 차단하고 RPC 및 내부함수만 사용한다.

### 내부 함수
`spark_internal.refresh_task_escalations()`
- 완료·취소·기한삭제 업무의 열린 신호 해제
- 현재 기한에 맞는 단 하나의 최고 상태를 활성화
- 이전 단계 신호는 해결 처리
- 브라우저 직접 실행 권한 없음

### 사용자 RPC
`spark_operational_focus_center()`
- HQ/국가/지역 관리자: 자신의 관리 범위
- 일반 담당자: 자신에게 배정된 미완료 업무
- 반환: 내 담당, 오늘 마감, 마감임박, 기한초과, LEVEL 2+ 에스컬레이션, 긴급업무 및 업무목록
- `anon` 실행 차단

## Cron
Job: `global-spark-task-escalation-hourly`
Schedule: `0 * * * *`
Command: `select spark_internal.refresh_task_escalations();`

매시간 정각에 자동 점검한다.

## 화면
`operational-focus.html`
- 내 담당
- 마감임박
- 기한초과
- 에스컬레이션
- 긴급업무
- 업무 처리 화면 연결

`daily-briefing.html`에 `오늘의 포커스` 진입버튼을 추가했다.

## GB-14 안정화
`spark_operational_task_center()`가 각 업무에 `mine` 값을 직접 반환하도록 보완했다. 브라우저가 세션 구조를 추측하지 않아도 내 담당 여부를 판단할 수 있다.

## 검증
롤백 테스트에서 임시 업무의 기한을 변경하여 다음 흐름을 확인했다.
1. 12시간 남음 → `due_soon`
2. 30시간 초과 → `overdue_24h`
3. 80시간 초과 → `overdue_72h`, LEVEL 3, audience=`hq`

테스트 후 실제 `spark_operational_tasks` 행 수는 0건으로 유지됐다.

추가 확인:
- Cron Job active=true
- `spark_operational_task_escalations` RLS=true
- `spark_operational_focus_center`: anon execute=false / authenticated execute=true + 내부 권한검사
- 현재 실제 포커스: 업무 0건

## 보안
Security Advisor의 `RLS Enabled No Policy` INFO는 신규 에스컬레이션 테이블에도 표시된다. 이 테이블은 직접 API 접근을 의도적으로 차단하고 제한된 RPC로만 사용한다. 프로젝트 전반의 기존 SECURITY DEFINER 관련 Advisor 경고는 별도 보안정비 트랙에서 다룬다.
