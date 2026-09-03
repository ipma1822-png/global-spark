# GLOBAL SPARK Supabase 연결 체크리스트 — v0.4.0

## 목적
GLOBAL SPARK 전용 Supabase 프로젝트에만 연결한다. 기존 계명태권도 CLASS, ACTS, Global News24, IDP 데이터베이스는 수정하지 않는다.

## 연결 전 확인
1. 대상 Organization: GLOBAL SPARK
2. 대상 Project: global-spark
3. 브라우저에는 publishable/anon key만 사용한다.
4. service_role key는 프런트엔드/GitHub 공개 저장소에 절대 저장하지 않는다.
5. `supabase/drafts/*.sql`은 자동 실행용 migration이 아니다.
6. 실제 테이블 생성 전 RLS, 미성년자 개인정보, 센터 권한, 활동 검증 규칙을 검토한다.

## 제1호 실증센터
- 센터: 계명태권도
- 센터 코드 제안: KMT-000001
- 국가: 대한민국
- 지역: 울산
- 역할: GLOBAL SPARK 제1호 실증센터

## MVP 실제 데이터 흐름
지도자 → 회원 선택 → 행동 선택 → 확인 → spark_activity 기록 → 공식 규칙으로 XP 산정 → ledger 기록 → MY SPARK/센터 통계 반영

## 절대 원칙
CLASS STAR ≠ 계명 성장포인트 ≠ GLOBAL SPARK XP.
세 시스템은 합치지 않는다.
