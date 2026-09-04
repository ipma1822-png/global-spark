# GLOBAL SPARK PHASE 2-3.1 · v2.3.1

현재 GLOBAL SPARK는 기존 KMT 실운영 기반을 보존하면서 5대 불꽃 성장경험과 SPARK MISSION v1.0을 연결한 단계입니다.

## PHASE 2-3 핵심
- 센터 인증 세션이 만료되어 RPC가 401을 반환하면 refresh token으로 access token을 1회 갱신하고 요청을 재시도합니다.
- HQ ADMIN에서 GOOD·SAFE·EARTH·CHALLENGE·CITIZEN 대표 불꽃 MISSION을 작성·수정·공개·종료할 수 있습니다.
- MY SPARK에서 현재 공개된 MISSION과 완료 여부, 안전안내를 확인할 수 있습니다.
- SPARK CENTER에서 회원의 현실 행동 완료를 지도자가 확인할 수 있습니다.
- PHASE 2-3의 MISSION 완료는 확인 기록만 남기며 별도 XP를 지급하지 않습니다.
- 기존 활동 XP, LEVEL, append-only ledger, UNDO, KMT CLASS Connector는 변경하지 않습니다.

## PHASE 2-3.1 핀셋 보완
- SPARK CENTER 진입 시 첫 활성 회원을 자동 선택하고 공개 MISSION을 즉시 표시합니다.
- 다른 회원을 누르면 해당 회원의 MISSION 완료 상태로 즉시 전환됩니다.
- 회원 선택이 없더라도 공개 MISSION 목록 자체는 표시할 수 있도록 보완했습니다.
- SPARK CENTER 찾기에서 `KMT-000001` 계명태권도 카드를 클릭하거나 `센터 보기 →`를 누르면 제1호 실증센터 안내로 이동합니다.
- 관련 화면 버전을 `PHASE 2-3.1 · v2.3.1`로 명확하게 표시합니다.

## 다음 단계 설계 문서

- `docs/PHASE-2-4-DESIGN-ASSET-SPEC.md` — 공식 캐릭터·5대 불꽃·배지·전문영역 자산 규격과 교체 원칙
- `docs/PHASE-2-5-MY-SPARK-PREDESIGN.md` — MY SPARK 성장경험 실서비스 적용 사전설계

중요: PHASE 2-4는 디자인 기준 확정 단계이며 현재 운영 버전은 여전히 `PHASE 2-3.1 · v2.3.1`입니다. 실제 UI 적용과 회귀검증이 완료된 뒤에만 `PHASE 2-5 · v2.5.0`으로 올립니다.

## 역할별 운영·검수 동선

### 일반 방문자
`index.html` → GLOBAL SPARK 소개 / 5대 불꽃 / MISSION 운영상태 확인

### SPARK CENTER 지도자
`my-centers.html` → 지도자 로그인 → 나의 센터 → 센터 운영 시작 → `center.html?center=...`

센터 화면에서 회원·활동·MISSION을 확인합니다. 첫 활성 회원이 자동 선택되므로 공개 MISSION이 바로 표시됩니다.

### 기존 센터회원 MY SPARK
현재 회원 본인용 독립 로그인은 아직 개발 전입니다.
센터 지도자가 `my-spark.html`에서 회원을 선택해 MY SPARK를 확인하거나, 부모 공유링크를 발급합니다.

### 부모
센터 지도자가 MY SPARK에서 만든 난수 공유링크 → `parent-spark.html?share=...`

### HQ 관리자
`hq-admin.html` → 본부 관리자 로그인 → 센터 신청 관리 / SPARK MISSION v1.0 관리

### SPARK CENTER 찾기
`centers.html` → 계명태권도 카드 또는 `센터 보기 →` → `pilot-center.html`

### 시스템 상태
`system-status.html`

## SPARK MISSION v1.0 데이터
- `spark_missions`
- `spark_mission_completions`
- 대표 불꽃 1개
- 대상 표시
- 난이도
- 참여형태: 혼자 / 친구 / 가족 / 센터 / 지역사회
- 시작·종료기간
- 안전안내
- 상태: 초안 / 공개 / 종료

MISSION 완료 자체에는 현재 XP가 연결되지 않습니다. 향후 공식 정책 확정 후 기존 XP 원장 원칙을 훼손하지 않는 방식으로 별도 검토합니다.

## 현재 원칙

> 서버는 계산하고, 화면은 연출한다.

> 현실에서 행동하면 나의 SPARK가 성장하고, 그 과정에서 실제 나도 성장한다.

> 경쟁보다 연결, 점수보다 행동, 보상보다 성장.

개인 독립 참여, 가족 참여, 공식 캐릭터·배지·아이템·사운드는 후속 단계입니다.
