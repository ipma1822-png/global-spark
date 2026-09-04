# GLOBAL SPARK · GB-08 AI 성장코치 · v3.24.0

## 목적
성장기지 운영자가 데이터를 직접 해석하지 않아도 현재 운영 신호를 빠르게 파악하고, 반복적인 일괄 SPARK 작업을 음성 또는 문장 명령으로 준비할 수 있게 한다.

## 핵심 원칙
- AI 성장코치는 현재 데이터에 근거한 운영추천만 제공한다.
- 음성 명령은 즉시 실행하지 않는다.
- `음성/텍스트 → 명령 계획 → 대상·활동·인원·예상 XP 확인 → 사용자 실행 승인 → 실제 등록` 순서를 지킨다.
- 계획된 명령은 10분 후 만료된다.
- 명령 실행은 해당 성장기지 STAFF 권한을 다시 확인한다.
- 익명 사용자는 AI 코치/명령 기능을 실행할 수 없다.

## 운영추천 신호
- 승인 대기 건수
- 7일 미활동 인원
- 5대 불꽃 중 최근 7일 미활동 영역
- 캠페인 참여 신호
- 현재 성장기지 LEVEL 및 운영품질

## 음성 명령 v1 지원 범위
대상:
- 전체 아이
- 7일 미활동 아이
- 확인 필요 아이

활동:
- `spark_activity_rules`의 공식 활성 활동명

예시:
- 전체 아이들에게 정리정돈 활동
- 7일 미활동 아이들에게 운동·도전 활동
- 확인 필요 아이들에게 봉사·나눔 활동

수업부(예: 3부 출석) 기반 명령은 GLOBAL SPARK 자체에 CLASS 출석 데이터가 아직 연결되어 있지 않으므로 이번 버전에서 임의 구현하지 않는다. 향후 CLASS 연동 시 별도 대상 resolver를 추가한다.

## DB
- `spark_center_ai_commands`
- `spark_center_ai_coach(text)`
- `spark_center_ai_plan_command(text,text)`
- `spark_center_ai_execute_command(uuid)`
- `spark_center_ai_cancel_command(uuid)`

## 회귀 수정
GB-04 단체 SPARK 함수에서 여러 회원의 `source_event_id`가 동일한 batch UUID로 저장되어 idempotency unique constraint와 충돌하던 문제를 수정했다. 이제 `batch_id:member_id` 조합을 사용해 각 활동은 고유하지만 같은 단체활동 batch로 추적 가능하다.

## 검증
- 운영추천 정상 반환
- 69명 전체 + 정리정돈 5 XP 계획 결과: 69명 / 예상 총 345 XP
- 실행 경로 롤백 테스트: 69개 활동/원장 생성 성공 후 전체 rollback
- 테스트 후 pending/executed AI command 0건
- 실제 운영 SPARK 데이터 변경 없음

## UI
`center-operations.html` 상단에 AI 성장코치 패널 추가.
브라우저 Web Speech API를 지원할 경우 한국어 음성인식 사용. 지원하지 않는 브라우저는 텍스트 입력으로 동일 기능 사용.
