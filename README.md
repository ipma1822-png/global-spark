# GLOBAL SPARK PHASE 2-5 · v2.5.0

현재 GLOBAL SPARK는 기존 KMT 실운영 기반과 PHASE 2-3.1의 CENTER·MISSION 흐름을 보존하면서, MY SPARK에 7단계 시각적 성장경험을 실제 운영 데이터와 연결한 단계입니다.

## PHASE 2-5 핵심
- MY SPARK 상단을 `회원 이름 → 성장 캐릭터 → LEVEL → 누적 XP → 다음 성장` 순서로 재구성했습니다.
- 누적 XP 기준의 7단계 시각 성장구간을 추가했습니다: 0 / 25 / 50 / 100 / 200 / 400 / 700 XP.
- 기존 LEVEL 계산정책은 변경하지 않습니다. 캐릭터 성장단계는 UI 연출용입니다.
- GOOD·SAFE·EARTH·CHALLENGE·CITIZEN 5대 불꽃은 최근 활동 20건 기준으로 표시하며 장기 누적처럼 보이지 않도록 명시합니다.
- 배지 v1은 새 DB 없이 계산형 시각 보상으로 운영합니다: 첫 SPARK / 꾸준한 시작 / 성장 중 / LEVEL UP.
- 공개 MISSION·완료 여부·안전안내·센터 확인 상태를 기존 MISSION RPC로 그대로 표시합니다.
- 다음 현실 행동은 최근 활동에서 상대적으로 적은 불꽃을 기준으로 제안합니다.
- 모바일에서 이름·캐릭터·LEVEL·XP·다음 성장·MISSION을 우선 확인할 수 있도록 레이아웃을 정리했습니다.

## 7단계 성장 자산
- Stage 1 `불씨` — `assets/spark/levels/ember.svg`
- Stage 2 `초롱이` — `assets/spark/levels/growing.svg`
- Stage 3 `열린이` — `assets/spark/levels/strong.svg`
- Stage 4 `스파키` — `assets/spark/levels/radiant.svg`
- Stage 5 `파이터` — `assets/spark/levels/fighter.svg`
- Stage 6 `히어로` — `assets/spark/levels/hero.svg`
- Stage 7 `글로벌 리더` — `assets/spark/levels/global-leader.svg`

공식 캐릭터 이미지가 최종 확정되면 비즈니스 로직이나 DB를 변경하지 않고 정적 자산 경로만 교체할 수 있도록 유지합니다.

## 절대 보호한 기존 운영기반
- 기존 69명 회원
- KMT CLASS Connector / KMT Edge Function
- 기존 9개 activity_type 및 flame_code
- 공식 XP 계산 / LEVEL 계산
- spark_ledger append-only 원장 / UNDO 반대 원장
- 센터 지도자 인증과 401 세션 자동 갱신
- 부모 공유토큰
- SPARK MISSION v1 RPC
- CENTER 회원 조회와 MISSION 완료 확인

## 현재 역할별 진입 동선

### 일반 방문자
`index.html`

### SPARK CENTER 지도자
`my-centers.html` → 로그인 → 나의 센터 → 센터 운영 시작 → `center.html?center=...`

### 기존 센터회원 MY SPARK
현재 회원 본인 독립 로그인은 아직 개발 전입니다.
센터 지도자가 `my-spark.html`에서 회원을 선택해 성장화면을 확인합니다.

### 부모
MY SPARK에서 발급한 난수 공유링크 → `parent-spark.html?share=...`

### HQ 관리자
`hq-admin.html` → 본부 관리자 로그인 → 센터 신청 관리 / SPARK MISSION 관리

### 시스템 상태
`system-status.html`

## 설계 문서
- `docs/PHASE-2-4-DESIGN-ASSET-SPEC.md`
- `docs/PHASE-2-5-MY-SPARK-PREDESIGN.md`

## 제품 원칙

> 서버는 계산하고, 화면은 연출한다.

> 화면에서는 불꽃이 자라고, 현실에서는 내가 자란다.

> 경쟁보다 연결, 점수보다 행동, 보상보다 성장.

다음 단계는 기존 운영기반을 보호하면서 센터 소속 없이도 참여할 수 있는 개인회원 직접 참여 구조를 설계·구축하는 것입니다.
