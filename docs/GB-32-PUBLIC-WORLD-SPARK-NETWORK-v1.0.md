# GB-32 — 공개 WORLD SPARK NETWORK 완성

Version: **v3.48.0**

## 목적
공식 성장기지 공개 네트워크를 `세계 → 국가 → 지역 → 공식 성장기지 → 공식번호 조회` 흐름으로 완성한다.

## 공개 원칙
- `designation_status='official'`
- `public_visible=true`
- 운영상태 `pilot` 또는 `active`
- 공식 지정번호 존재
- 정지·취소·종료 성장기지는 네트워크에서 자동 제외
- 아이 이름, 사진, 연락처, 정확한 위치는 공개하지 않음
- 계명태권도 KMT-000001은 현재 `unassigned`이므로 공개 네트워크 제외

## Supabase
### 기존 RPC 확장
`public.spark_public_world_growth_base_network()`

기존 응답 키 `official_centers`, `countries_count`, `countries`, `centers`를 유지하면서 다음을 추가했다.
- `regions_count`
- `active_members`
- `activities_30d`
- `campaign_actions_30d`
- `generated_at`
- `regions`
- 국가/지역/성장기지별 안전한 집계 통계

### 신규 RPC
`public.spark_public_world_network_search(p_query,p_country_code,p_region_name,p_limit)`

공식 성장기지만 서버에서 검색한다. 최대 200건으로 제한한다.

두 RPC는 공개 네트워크 목적상 `anon`, `authenticated` 실행을 허용한다. SECURITY DEFINER를 사용하므로 `search_path=''`를 고정하고 반환 필드를 안전한 공개 데이터로 제한했다.

## UI
`world-network.html`

- GB-32 v3.48.0 표시
- 세계 전체 요약
- 국가별 네트워크
- 지역별 네트워크
- 공식 성장기지 검색
- 국가/지역 필터
- 성장기지 공식번호 조회 연결
- 모바일 반응형
- 공식 성장기지 0곳일 때 정상 빈 상태

## 현재 실제 상태
- 공식 공개 성장기지: 0곳
- 참여 국가: 0
- 참여 지역: 0
- KMT-000001: `unassigned`, 공개 제외
- 테스트용 공식 성장기지 생성 없음

## 회귀 보호
- 기존 `spark_public_growth_bases()` 유지
- 기존 `spark_public_growth_base_lookup()` 유지
- 기존 공개 WORLD NETWORK RPC 이름과 핵심 응답 키 유지
- 회원/아이 개인정보 공개 없음
- GB-27 정지·취소 수명주기와 자동 연동

## 다음 단계
GB-33 — 성장기지 관리자 모바일 HOME 완성