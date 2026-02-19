# CLAUDE.md - Traffic Sight 프로젝트 가이드

> 이 파일은 Claude Code가 프로젝트를 이해하고 작업할 때 참고하는 지침서입니다.

---

## 프로젝트 개요

**Traffic Sight**는 사이버펑크/매트릭스 테마의 실시간 네트워크 트래픽 모니터링 대시보드입니다.
Faker.js로 가짜 트래픽 데이터를 생성하고, Supabase에 저장한 뒤 Supabase Realtime으로 프론트엔드에 실시간 스트리밍합니다.

- **PRD:** `/docs/PRD.md`
- **아키텍처:** `/docs/ARCHITECTURE.md`
- **개발 워크플로우:** `/docs/DEVELOPMENT.md`
- **Git 워크플로우:** `/docs/GIT_WORKFLOW.md`

---

## ⚠ Git 워크플로우 (필수 준수)

> **반드시 `/docs/GIT_WORKFLOW.md`를 숙지하고 따라야 합니다.**

### 절대 규칙 (위반 금지)

1. **`main`, `dev` 브랜치에 직접 커밋/푸시 금지** — 반드시 작업 브랜치에서 PR을 통해 머지
2. **작업 브랜치는 반드시 `dev`에서 분기** (핫픽스만 `main`에서 분기)
3. **커밋 메시지는 Conventional Commits 형식 필수:**
   ```
   <type>(<scope>): <subject>
   ```
   - type: `feat`, `fix`, `style`, `refactor`, `docs`, `perf`, `chore`, `test`, `ci`
   - scope: `globe`, `stats`, `threat`, `log`, `header`, `matrix-rain`, `realtime`, `generator`, `config`, `deps`
   - subject: 영문 소문자, 명령형, 50자 이내, 마침표 없음
4. **커밋 전 반드시 `npm run lint && npm run build` 통과 확인**
5. **`.env.local`, `node_modules/`, `.next/` 절대 커밋 금지**
6. **`git push --force` (main/dev) 금지** — 작업 브랜치에서만 `--force-with-lease` 허용
7. **하나의 커밋 = 하나의 논리적 변경** — 기능 추가와 리팩토링을 섞지 않는다

### 브랜치 네이밍

```
feat/add-heatmap-layer     ← 새 기능
fix/realtime-reconnect     ← 버그 수정
refactor/stats-hook        ← 리팩토링
docs/update-prd            ← 문서 수정
perf/optimize-canvas       ← 성능 최적화
chore/upgrade-deps         ← 의존성/설정
hotfix/critical-crash      ← 프로덕션 긴급 수정
```

### 작업 흐름 요약

```bash
git checkout dev && git pull origin dev       # 1. dev 최신화
git checkout -b feat/xxx                      # 2. 브랜치 생성
# ... 작업 + 커밋 ...                          # 3. 작업
npm run lint && npm run build                 # 4. 검증
git fetch origin && git rebase origin/dev     # 5. 동기화
git push origin feat/xxx                      # 6. 푸시
# GitHub에서 feat/xxx → dev PR 생성            # 7. PR
# Squash and Merge                            # 8. 머지
```

### 상세 규칙은 반드시 아래 문서 참조:
**→ `/docs/GIT_WORKFLOW.md`**

---

## 기술 스택

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| Framework | Next.js (App Router) | 15.x |
| UI | React | 19.x |
| 3D Globe | react-globe.gl + three.js | 2.37 / 0.180 |
| Charts | ECharts + echarts-for-react | 5.5 / 3.0 |
| Realtime | Supabase (supabase-js) | 2.49 |
| Mock Data | @faker-js/faker | 10.x |
| Animation | Motion (framer-motion v12) + GSAP | 12.x / 3.13 |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.7 |

---

## 핵심 명령어

```bash
# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 트래픽 데이터 생성기 실행 (Supabase 연결 필요)
npm run generate-traffic

# 린트
npm run lint
```

---

## 프로젝트 구조

```
traffic-sight/
├── PRD.md                      # 제품 요구사항 문서 (루트)
├── CLAUDE.md                   # 이 파일
├── docs/
│   ├── ARCHITECTURE.md         # 아키텍처 문서
│   └── DEVELOPMENT.md          # 개발 워크플로우
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃 (JetBrains Mono 폰트)
│   ├── page.tsx                # 메인 대시보드 ("use client")
│   ├── globals.css             # 사이버 테마 + Tailwind CSS 4
│   └── providers.tsx           # Provider 래퍼
├── components/
│   ├── dashboard/              # 대시보드 패널 컴포넌트
│   │   ├── GlobeSection.tsx    # 3D 글로브 (dynamic import, ssr: false)
│   │   ├── StatsPanel.tsx      # 좌측 통계 (ECharts)
│   │   ├── ThreatPanel.tsx     # 우측 위협 알림 (ECharts + Motion)
│   │   ├── LogTerminal.tsx     # 하단 로그 터미널
│   │   └── Header.tsx          # 헤더 (GlitchText + 시계 + 상태)
│   ├── effects/                # 시각 효과
│   │   ├── MatrixRain.tsx      # Canvas 매트릭스 레인
│   │   └── GlitchText.tsx      # 글리치 텍스트 애니메이션
│   └── ui/                     # 재사용 UI
│       └── CyberPanel.tsx      # 네온 보더 패널 (green/cyan/red)
├── hooks/                      # 커스텀 훅
│   ├── useTrafficStream.ts     # Supabase Realtime 구독
│   └── useTrafficStats.ts      # 통계 계산
├── lib/                        # 유틸리티
│   ├── supabase/
│   │   ├── client.ts           # Supabase 클라이언트
│   │   └── types.ts            # DB 타입 정의
│   └── constants.ts            # 도시 좌표, 프로토콜, 위협 유형
├── scripts/
│   ├── generate-traffic.ts     # Faker.js 데이터 생성기
│   └── schema.sql              # Supabase 테이블 스키마
└── workers/
    └── matrix-rain.worker.ts   # OffscreenCanvas 워커 (선택적)
```

---

## 아키텍처 핵심 원칙

### 1. 클라이언트 중심 렌더링
- 모든 대시보드 컴포넌트는 `"use client"` 디렉티브 사용
- 실시간 상태 관리가 필요하므로 서버 컴포넌트 사용 불가
- Globe는 `dynamic(() => import(...), { ssr: false })`로 이중 보호

### 2. 데이터 흐름 (단방향)
```
generate-traffic.ts → Supabase DB → Realtime → useTrafficStream → useTrafficStats → Components
```

### 3. 상태 관리
- 외부 상태 라이브러리 없음 (React useState/useMemo만 사용)
- `useTrafficStream`: events (최근 50개), threats (최근 20개), isConnected, totalCount
- `useTrafficStats`: protocolDistribution, countryDistribution, bandwidth 등 파생 상태

### 4. 롤링 윈도우 패턴
- 이벤트: 최근 50개 유지 (`ROLLING_WINDOW`)
- 위협: 최근 20개 유지 (`MAX_THREAT_ENTRIES`)
- 글로브 아크: 최대 30개 동시 표시 (`MAX_ARCS`)

---

## 코딩 컨벤션

### TypeScript
- `strict: true` 모드
- 인터페이스는 `I` 접두사 없이 사용 (예: `TrafficEvent`, `ArcData`)
- 타입 파일은 `lib/supabase/types.ts`에 집중

### 컴포넌트
- 모든 클라이언트 컴포넌트 파일 상단에 `"use client"` 선언
- Props 인터페이스는 컴포넌트 파일 내에 정의
- `default export` 사용

### 스타일링
- Tailwind CSS 4 유틸리티 클래스 우선
- 커스텀 CSS는 `globals.css`에 정의
- 테마 색상은 `@theme` 블록에서 관리:
  - `cyber-bg`: #0a0a0f (배경)
  - `matrix-green`: #00ff41 (주 색상)
  - `cyber-cyan`: #00d4ff (보조)
  - `threat-red`: #ff0040 (위협)
  - `threat-orange`: #ff6600
  - `threat-yellow`: #ffcc00
  - `neon-purple`: #bf00ff
- 네온 글로우: `neon-glow-green`, `neon-glow-cyan`, `neon-glow-red` 클래스
- 텍스트 글로우: `text-glow-green`, `text-glow-cyan`, `text-glow-red` 클래스

### 차트 (ECharts)
- `lazyUpdate: true` 옵션 필수
- 배경 투명, 텍스트 색상 매트릭스 그린 계열
- 폰트: monospace

---

## 주의사항 및 알려진 이슈

### three.js 호환성
- `three@0.180.0` 필수 (`three-globe@2.45.0` 요구사항)
- `next.config.ts`에 webpack alias 설정 필수:
  - `three/webgpu` → `three/build/three.webgpu.js`
  - `three/tsl` → `three/build/three.tsl.js`
- three.js 버전 변경 시 반드시 빌드 테스트 필요

### Supabase 클라이언트
- `.env.local`의 플레이스홀더 URL은 반드시 `https://` 형식 유지
  (빌드 시 Supabase 클라이언트가 URL 검증하므로)
- Realtime 사용 전 Supabase Dashboard에서 `traffic_events` 테이블의 Replication 활성화 필요

### 빌드 시 주의
- Globe 컴포넌트는 반드시 `dynamic import + ssr: false`로 로드
- `page.tsx`는 `"use client"`이지만 Next.js가 정적 프리렌더링 시도하므로,
  Supabase URL이 유효한 형식이어야 빌드 통과

---

## 새 기능 추가 가이드

### 새 대시보드 패널 추가
1. `components/dashboard/NewPanel.tsx` 생성 (`"use client"`)
2. `CyberPanel`로 감싸서 사이버 테마 적용
3. `app/page.tsx`의 그리드 레이아웃에 배치
4. 필요 시 `useTrafficStats`에 새 통계 필드 추가

### 새 위협 유형 추가
1. `lib/constants.ts`의 `THREAT_TYPES` 배열에 추가
2. `scripts/generate-traffic.ts`에서 자동으로 사용됨

### 새 도시 추가
1. `lib/constants.ts`의 `CITIES` 배열에 `{ city, country, countryCode, lat, lng }` 추가

### 새 프로토콜 추가
1. `lib/constants.ts`의 `PROTOCOLS` 배열과 `PROTOCOL_PORTS` 맵에 추가

---

## 환경 변수

| 변수 | 용도 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | O |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | O |
| `SUPABASE_SERVICE_ROLE_KEY` | 데이터 생성기용 서비스 키 | 생성기 전용 |

---

## 테스트 체크리스트

- [ ] `npm run build` 성공
- [ ] `npm run dev`로 로컬 확인 (Globe 렌더링, MatrixRain 동작)
- [ ] Supabase 연결 후 `npm run generate-traffic` → 실시간 데이터 수신 확인
- [ ] Chrome DevTools Performance 탭에서 60fps 유지 확인
- [ ] 1920px / 1440px / 1024px 반응형 확인
