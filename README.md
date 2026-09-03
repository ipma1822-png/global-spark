# GLOBAL SPARK HQ v0.6.0 — Minimal Update

이번 버전에서 독립 GLOBAL SPARK Supabase 프로젝트의 Project URL과 Publishable key를 브라우저 설정에 연결했습니다.

## 실제 연결 상태
- Project URL 설정 완료
- Publishable key 설정 완료
- 브라우저 Secret/service_role key 없음
- REST/RPC 호출 가능한 데이터 어댑터 준비
- `spark_register_activity` RPC 계약 초안 추가
- RPC/RLS가 아직 배포되지 않은 경우 기존 로컬 저장으로 안전하게 폴백

## 중요
이 버전은 기존 ACTS, Global News24, CLASS, IDP Supabase를 전혀 참조하지 않습니다.
실제 DB 테이블/RLS/RPC 생성은 별도 검토 후 진행해야 합니다.
