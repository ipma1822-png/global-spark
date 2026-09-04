# GB-26 — 성장기지 정기 운영평가·재인증 체계

버전: v3.42.0

## 목적
공식 지정 후 초기 30일을 지난 성장기지를 대상으로 90일 주기 정기평가를 수행하고, 운영상태를 정상·주의·지원필요·재검토·자료부족으로 구분한 뒤 HQ가 재인증 여부를 최종 판단한다.

## 원칙
- 기존 운영건강도, 알림, 운영업무, 활동 데이터를 재사용한다.
- 별도 중복 점수체계를 만들지 않는다.
- 정기평가는 자동 생성할 수 있지만 재인증은 자동 승인하지 않는다.
- review_needed 또는 insufficient_data 상태에서는 즉시 재인증을 허용하지 않는다.
- 공식 미지정 성장기지는 평가 대상이 아니다.
- 정기평가나 재인증 테스트를 위해 실제 성장기지를 임의 공식지정하지 않는다.

## 평가주기
- 공식 지정 후 30일이 지난 성장기지부터 대상
- 90일 단위 cycle_no
- 매일 09:30 KST 자동 평가 저장

## 평가판정
- insufficient_data: 최신 운영건강도 데이터 없음
- review_needed: 건강도 45 미만 또는 미해결 critical 알림 존재
- support_needed: 건강도 60 미만 또는 기한초과 운영업무 3건 이상
- watch: 건강도 75 미만 또는 미해결 알림 3건 이상 또는 기한초과 업무 존재
- normal: 위 조건에 해당하지 않는 정상 운영 범위

## 재인증 상태
- pending: HQ 판단 대기
- renewed: 재인증 승인
- support_required: 지원 후 재검토
- held: 재인증 보류

## DB
새 테이블: `public.spark_center_periodic_evaluations`

내부 함수:
- `spark_internal.center_periodic_evaluation_rows()`
- `spark_internal.save_center_periodic_evaluations()`

공개 RPC:
- `public.spark_hq_periodic_center_evaluations()`
- `public.spark_hq_recertification_action(p_evaluation_id,p_action,p_note)`

## 보안
- 신규 테이블 RLS 활성화
- public/anon/authenticated 직접 테이블 접근 차단
- HQ RPC anon 차단
- authenticated 실행 허용 후 함수 내부 `spark_is_hq_admin()` 재검증

## UI
- `hq-recertification.html`
- 평가상태, 건강도, 알림, 기한초과 업무, 30일 활동, 재인증 상태 표시
- HQ 액션: 재인증 / 지원필수 / 보류

## 검증
구현 시점 실제 공식 성장기지 0곳이므로 정기평가 행도 0건이 정상이다. 테스트용 가짜 공식 성장기지·재인증 기록을 만들지 않았다.
