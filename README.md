# GLOBAL SPARK v0.9.0 — Minimal Update

이번 버전은 **아이별 실제 MY SPARK 연결** 단계입니다.

## 추가
- SPARK CENTER에서 선택한 아이의 MY SPARK 바로 열기
- `my-spark.html?member=<UUID>` 아이별 실시간 조회
- 센터 회원 선택 드롭다운
- 누적 XP / LEVEL / 다음 LEVEL까지 남은 XP
- LEVEL 진행률 바
- 최근 좋은 행동 최대 20건
- 실증용 성장 배지 표시
- 아이별 링크 복사

## 중요
현재 개인 링크는 로그인된 실증 지도자용입니다.
미성년자의 부모/아이에게 배포할 **무로그인 공개 링크**는 UUID를 그대로 공개하지 않고, 다음 단계에서 별도의 안전한 공유 토큰/RPC 구조로 구현합니다.

이번 v0.9.0은 DB 스키마 변경이 없으므로 Supabase SQL 실행이 필요 없습니다.
