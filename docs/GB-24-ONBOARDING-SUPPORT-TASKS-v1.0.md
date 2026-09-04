# GB-24 · 온보딩 위험신호 → 자동 지원업무 · v3.40.0

## 목적
GB-23의 공식 성장기지 온보딩 위험신호를 확인용 경고에서 끝내지 않고 기존 GB-14 운영업무 체계에 자동 연결한다.

## 동작
- `spark_internal.generate_onboarding_support_tasks()`가 먼저 GB-23 신호를 갱신한다.
- 미해결 신호 중 아직 연결된 업무가 없는 신호만 처리한다.
- 담당자 우선순위: 해당 지역관리자 → 해당 국가관리자 → 활성 HQ 관리자.
- 담당자가 없으면 업무를 억지로 생성하지 않고 `skipped_no_assignee`로 남긴다.
- 신호당 업무 1개만 생성한다(`spark_onboarding_support_tasks.signal_id UNIQUE`).
- 기존 `spark_operational_tasks`를 재사용하므로 별도의 중복 업무 시스템을 만들지 않는다.

## 업무 규칙
- HIGH: 우선순위 high, 기본 기한 3일
- MEDIUM: 우선순위 medium, 기본 기한 7일
- LOW: 우선순위 low, 기본 기한 14일
- CRITICAL 발생 시 high, 기본 기한 1일

신호별 제목: STAFF 연결 지원 / 첫 회원 등록 지원 / 첫 SPARK 활동 지원 / 승인센터 준비 지원 / 첫 LEVEL 평가 지원 / 공식 프로필 완성 지원.

## 자동 실행
Cron `global-spark-onboarding-support-tasks-daily` = `0 0 * * *` UTC = 매일 09:00 KST.
GB-23 신호 점검(08:45 KST) 직후 실행한다.

## 보안
- `spark_onboarding_support_tasks`: RLS 활성화, anon/authenticated 직접 권한 없음.
- 내부 생성 함수: browser role 실행권한 없음.
- `spark_hq_onboarding_support_tasks()`: anon 실행 차단, authenticated 실행 허용 + 함수 내부 HQ 권한 재검사.

## GB-23 회귀 수정
GB-23 감지 함수가 온보딩 테이블의 실제 컬럼 `approval_center_ready` 대신 존재하지 않는 `approval_center_confirmed`를 참조하던 오류를 발견해 수정했다. 운영 데이터 변경 없이 함수 정의만 바로잡았다.

## 검증
2026-09-05 현재 공식 성장기지 0, open signal 0이므로 generator 결과 `created=0`, `skipped_no_assignee=0`, 링크 0건이 정상이다. 테스트용 가짜 업무는 생성하지 않았다.

## UI
`hq-onboarding-support.html` — HQ 자동 지원업무 관제.

별도 사이트 배포는 GB-24 범위에 포함하지 않는다.
