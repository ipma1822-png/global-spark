# GB-18 — 성장기지 종합 운영건강도

버전: v3.34.0

## 목적
성장기지의 회원 참여, 최근 활동 지속성, 승인 처리 건강도, LEVEL 운영품질, 관리자 업무처리를 하나의 운영건강도 점수로 통합한다.

## 점수 구성
- 회원 참여: 35%
- 활동 지속성: 20%
- 승인 처리: 15%
- LEVEL 운영품질: 15%
- 관리자 업무처리: 15%

## 등급
- 80~100: excellent / 우수
- 65~79: healthy / 건강
- 50~64: watch / 관찰
- 0~49: risk / 위험

## 데이터 원칙
회원수와 활동수는 독립 집계 후 결합한다. 단순 JOIN 집계를 사용하면 회원×활동 곱으로 활동수가 부풀 수 있으므로 금지한다.

LEVEL 저장 이력이 없는 경우 품질 항목은 중립 50점, 최근 30일 운영업무가 없는 경우 관리자 처리 항목은 중립 70점을 사용한다. 데이터 부재를 곧바로 운영 실패로 해석하지 않기 위한 설계다.

## Supabase
신규 테이블: `spark_center_health_snapshots`

내부 함수:
- `spark_internal.center_health_rows()`
- `spark_internal.save_center_health_snapshots()`

공개 RPC:
- `spark_scoped_center_health()` — HQ/국가/지역 관리자 범위 기반 현재 건강도
- `spark_center_health_history(center_code, days)` — HQ/네트워크 관리자/해당 센터 STAFF 추세 조회

Cron:
- `global-spark-center-health-daily`
- `30 23 * * *` UTC = 매일 08:30 KST

## 보안
- 신규 스냅샷 테이블 RLS 활성화
- anon/authenticated 직접 테이블 권한 제거
- 공개 RPC는 anon EXECUTE 제거
- 내부 함수는 `spark_internal` 스키마에 두고 브라우저 직접 호출 금지
- 네트워크 관리자 범위 및 센터 STAFF 권한을 함수 내부에서 재확인

## UI
- `center-health.html` — 현재 종합 운영건강도
- `center-health-history.html?center=...` — 일일 스냅샷 추세

## 실제 검증 — 2026-09-05 KST
계명태권도 `KMT-000001`:
- 활성회원 69
- 최근 7일 참여 9명
- 참여율 13%
- 최근 7일 활동 57건
- 승인대기 0건
- 최근 활동 있음
- LEVEL 저장 이력 없음
- 최근 30일 운영업무 0건
- 종합점수 62
- 등급 watch / 관찰
- 우선 추천: 최근 7일 참여 폭 확대

2026-09-05 실제 스냅샷 1건을 초기값으로 저장했다.

## Security Advisor
신규 `spark_center_health_snapshots`는 RLS enabled/no policy INFO가 발생한다. 이는 직접 테이블 접근을 차단하고 제한 RPC로만 제공하는 현재 구조에서 의도된 상태다. 기존 프로젝트 전반의 SECURITY DEFINER 및 Auth 관련 경고는 별도 보안정비 과제로 유지한다.
