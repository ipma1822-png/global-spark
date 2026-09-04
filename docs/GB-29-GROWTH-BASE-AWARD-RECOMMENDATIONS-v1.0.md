# GB-29 — 성장기지 우수인증·포상 후보 자동추천 시스템

버전: v3.45.0

## 목적
공식 성장기지의 실제 운영데이터를 이용해 HQ가 우수 성장기지와 포상 후보를 자동 선별한다. 자동추천은 참고·후보선별이며 최종 포상 결정은 HQ가 한다.

## 후보 자격
- designation_status = official
- status = active
- 공식 지정 후 30일 이상
- 운영건강도 65점 이상
- HIGH/CRITICAL 미해결 운영알림 없음
- 공식 designation_code 존재

## 점수
- 운영건강도 30%
- LEVEL 품질점수 25%
- 최근 30일 참여율 15%
- 최근 30일 5대 불꽃 균형 15%
- 최근 90일 캠페인 참여 10%
- 관리자 실행력 5%

총점 구간:
- 85점 이상: top_candidate
- 75점 이상: candidate
- 65점 이상: watchlist
- 그 외 또는 자격 미충족: not_recommended

## 데이터 구조
- `spark_center_award_candidates`: 월별 후보 스냅샷·HQ 결정 저장
- `spark_internal.center_award_candidate_rows()`: 현재 후보 산정
- `spark_internal.save_monthly_award_candidates()`: 월별 저장
- `spark_hq_award_candidates()`: HQ 후보센터 조회
- `spark_hq_award_candidate_action()`: shortlist / award / not_select / reset

## 자동화
Cron: `global-spark-award-candidates-monthly`
UTC `45 0 1 * *` = KST 매월 1일 09:45.

## 보안
- 신규 후보 테이블 RLS 활성화
- anon/authenticated 직접 테이블 접근 차단
- HQ RPC만 authenticated에 EXECUTE 허용
- RPC 내부 `spark_is_hq_admin()` 재검사
- 아동 이름·사진·연락처 등 개인정보를 후보 화면에 노출하지 않음

## 실제 운영상태
GB-29 구축 시점의 공식 활성 성장기지는 0곳이므로 실제 후보 스냅샷도 0건이다. 테스트용 가짜 공식 성장기지나 포상 후보를 생성하지 않았다.

## 보존 원칙
기존 LEVEL, 운영건강도, 알림, 업무, 캠페인, 활동·회원 데이터의 의미와 흐름은 변경하지 않는다. 포상 시스템은 기존 데이터를 읽어 후보를 산출하는 상위 계층이다.
