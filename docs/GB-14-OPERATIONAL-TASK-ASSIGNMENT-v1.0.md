# GLOBAL SPARK GB-14 · 운영업무 배정·담당자·기한·미완료 추적

버전: **GB-14 · v3.30.0**

## 목적
GB-13 일일 브리핑과 GB-12 운영위험 알림을 실제 담당 업무로 전환한다.

흐름:

`일일 브리핑 → 운영위험 알림 → 운영업무 배정 → 담당자 → 기한 → 진행/보류 → 완료 → 이력`

## 데이터 구조

### spark_operational_tasks
- alert_id / center_id
- title / description
- priority: low / medium / high / critical
- status: todo / in_progress / blocked / done / cancelled
- assigned_to / assigned_by
- due_at / started_at / completed_at / completed_by
- 같은 alert_id에는 동시에 활성 업무 1건만 허용

### spark_operational_task_events
업무 생성·시작·보류·완료·재오픈·메모·재배정·기한변경·취소 이력을 남긴다.

## 권한
업무를 생성·재배정·기한변경할 수 있는 사용자는 해당 성장기지를 관리할 수 있는 HQ / 국가관리자 / 지역관리자이다.

담당자로 지정 가능한 사용자는:
- HQ 관리자
- 해당 국가관리자
- 해당 지역관리자
- 해당 성장기지 STAFF

담당자는 자신에게 배정된 업무를 보고 시작·보류·완료·메모를 남길 수 있다.

## RPC
- spark_operational_task_assignees(alert_id)
- spark_operational_task_create(...)
- spark_operational_task_center()
- spark_operational_task_action(...)
- spark_operational_task_history(task_id)

모든 신규 public RPC는 anon EXECUTE를 제거하고 authenticated만 호출할 수 있으며 함수 내부에서 auth.uid()와 센터 권한을 재검증한다.

## UI
`operational-tasks.html`

기능:
- 대기 / 진행중 / 보류 / 기한초과 / 완료 요약
- 미해결 운영알림에서 업무 생성
- 담당자 선택
- 기한·중요도·업무지시 입력
- 내 담당 / 기한초과 / 전체 / 완료 필터
- 시작 / 보류 / 완료 / 재오픈
- 메모 / 기한변경 / 담당변경
- 전체 업무 이력 확인

`daily-briefing.html`과 `operational-alerts.html`에 운영업무 진입 버튼을 연결했다.

## 검증
2026-09-05 KST 기준 실제 미해결 알림을 사용하여 ROLLBACK 테스트 수행.

검증 흐름:
1. 담당자 후보 조회
2. 테스트 업무 생성
3. 시작
4. 기한 변경
5. 완료
6. 이력 조회
7. 운영업무 보드 조회
8. ROLLBACK

결과:
- 전체 흐름 정상
- 테스트 후 spark_operational_tasks 0건
- 테스트 후 spark_operational_task_events 0건
- 현재 계명태권도 알림 기준 담당자 후보는 현재 등록 상태상 HQ + 성장기지 STAFF 1명

## 보안 검증
- spark_operational_tasks RLS 활성화
- spark_operational_task_events RLS 활성화
- 두 테이블 anon/authenticated 직접 권한 제거
- 신규 5개 RPC anon_exec=false
- authenticated 호출은 허용하되 내부 권한검사 필수

Security Advisor의 `rls_enabled_no_policy` INFO는 신규 두 테이블에도 표시된다. 이는 테이블을 Data API로 직접 사용하지 않고 모든 직접 권한을 revoke한 뒤 제한 RPC만 사용하도록 설계했기 때문이다. 기존 프로젝트 전체의 SECURITY DEFINER 경고는 별도 보안정비 트랙에서 다룬다.

## 회귀보호
- 기존 SPARK 점수/ledger 변경 없음
- 회원·아이 데이터 변경 없음
- GB-12 알림 처리 흐름 유지
- GB-13 KST 08:00 Cron 유지
- 공개 WORLD/성장기지 조회에 내부 업무정보 노출 없음

## 다음 확장 후보
GB-15에서는 업무 알림·마감 임박·지연 자동 에스컬레이션과 관리자별 할 일 요약을 추가한다.
