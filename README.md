# GLOBAL SPARK HQ v0.5.0

GLOBAL SPARK의 **실운영 Supabase 연결 직전 MVP**입니다.

## 포함
- HQ 공개화면
- SPARK CENTER 한 손 입력 프로토타입
- MY SPARK
- 계명태권도 제1호 실증센터
- SYSTEM STATUS
- 안전한 데이터 어댑터(local demo → Supabase-ready)
- Activity → 공식 XP → append-only ledger SQL 검토안
- 중복 이벤트 방지용 source_event_id 설계

## 중요한 안전 원칙
현재 버전은 실제 Supabase 원격 쓰기를 의도적으로 켜지 않았습니다.
`supabase/drafts/`는 자동 배포 migration이 아닙니다.

실제 연결 전에 반드시 확인:
1. GLOBAL SPARK 전용 Supabase 프로젝트인지
2. 센터/회원 실제 스키마
3. RLS 및 지도자 권한
4. 미성년자 개인정보 공개범위
5. 활동+XP ledger를 하나의 RPC transaction으로 처리
6. service_role key가 프런트/GitHub에 없는지

CLASS STAR, 계명 성장포인트, GLOBAL SPARK XP는 서로 독립적으로 유지합니다.
