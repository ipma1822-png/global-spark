# GLOBAL SPARK GB-19 — 운영건강도 개선계획·회복추적 v1.0

버전: **GB-19 · v3.35.0**

## 목적
GB-18 운영건강도에서 끝나지 않고 `진단 → 우선순위 → 개선행동 → 목표점수 → 회복폭 확인`까지 연결한다.

## 데이터
- `spark_center_improvement_plans`: 센터별 활성 개선계획, 기준점수, 목표점수, 우선개선영역, 목표일, 담당자, 완료기록.
- `spark_center_improvement_actions`: 계획별 순서형 실행항목과 상태.
- 센터당 활성 계획은 최대 1개다.

## 우선순위
GB-18의 다섯 구성점수 중 가장 낮은 영역을 자동 선택한다.
1. 회원 참여
2. 활동 지속성
3. 승인 처리
4. LEVEL 운영품질
5. 관리자 업무처리

활성 계획 생성 시 기준점수에서 최소 +10점, 동시에 최소 65점을 1차 목표로 삼되 최대 100점으로 제한한다. 기본 목표기간은 30일이며 7~90일 범위로 제한한다.

## 자동 개선행동
선택된 우선영역에 따라 3단계 실행안을 생성한다. 예를 들어 회원 참여가 최저이면 미참여 회원군 확인 → 주간 대표 성장미션 → 7일 참여율 재점검 순서다. 이는 외부 LLM 호출이 아닌 결정론적 운영규칙이다.

## RPC
- `spark_center_improvement_plan_create(center_code,target_days)`
- `spark_scoped_improvement_plans()`
- `spark_center_improvement_action(action_id,action,note)`
- `spark_center_improvement_plan_close(plan_id,note)`

모든 변경 RPC는 `auth.uid()`와 기존 `spark_internal.can_manage_center` 권한검사를 거친다. anon 실행은 철회했다.

## 화면
- `center-improvement.html`: 진행중/회복중/기한초과/완료, 기준점수→현재점수→목표점수, 실행항목 상태를 표시한다.
- `center-health.html`: 각 성장기지에서 30일 개선계획을 생성하고 개선계획 화면으로 이동할 수 있다.

## 검증
2026-09-05 KST 기준 실제 KMT 건강도 스냅샷은 62점(관찰), 참여율 13%였다. 트랜잭션 롤백 시험에서 우선영역은 `participation`, 목표점수 72, 목표일 2026-10-05로 계산됐고 3개 참여개선 행동이 정상 생성됐다. 시험 데이터는 ROLLBACK하여 영구 저장하지 않았다.

신규 테이블은 RLS를 활성화하고 anon/authenticated 직접 테이블 권한을 철회했다. 읽기·변경은 권한검사가 포함된 RPC로만 수행한다. Security Advisor의 `RLS Enabled No Policy` INFO는 이 직접접근 차단 설계 때문에 예상되는 항목이다. 기존 프로젝트 전반의 선행 경고는 GB-19 범위에서 일괄 변경하지 않았다.

## 배포
GitHub `main`과 Supabase 스키마/RPC에 반영. 별도 사이트 배포는 수행하지 않는다.