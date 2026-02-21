# CLAUDE.md - Traffic Sight 프로젝트 가이드

> 이 파일은 Claude Code가 프로젝트를 이해하고 작업할 때 참고하는 지침서입니다.

---

## 프로젝트 개요

**Traffic Sight**는 사이버펑크/매트릭스 테마의 실시간 네트워크 트래픽 모니터링 대시보드입니다.
Faker.js로 클라이언트 사이드에서 모의 트래픽 데이터를 생성하고, EventBuffer를 통해 배칭하여 대시보드에 실시간 스트리밍합니다. 외부 서버나 DB 없이 독립적으로 동작합니다.

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
4. **커밋 전 반드시 `npm run test && npm run lint && npm run build` 통과 확인**
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
# ... 작업 + 테스트 작성 + 커밋 ...             # 3. 작업
npm run test && npm run lint && npm run build # 4. 검증
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
| 3D Globe | react-globe.gl + three.js | 2.32 / 0.180 |
| Charts | ECharts + echarts-for-react | 5.5 / 3.0 |
| Mock Data | @faker-js/faker | 10.x |
| Animation | Motion (framer-motion v12) + GSAP | 12.x / 3.13 |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.7 |
| Test | Vitest + React Testing Library | - |

---

## 핵심 명령어

```bash
# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 린트
npm run lint

# 테스트
npm run test              # 전체 테스트 실행 (112개+)
npm run test:watch        # 워치 모드 (개발 중 사용)
npm run test:coverage     # 커버리지 리포트
```

---

## 테스트 규칙 (필수 준수)

### 절대 규칙

1. **새 기능/수정 시 반드시 테스트 코드를 함께 작성한다**
2. **테스트 없는 코드는 PR 머지 불가**
3. **모든 테스트 통과 후에만 커밋 가능** (`npm run test`)
4. **기존 테스트를 깨뜨리는 변경 금지** — 의도적 변경 시 테스트도 함께 수정

### 테스트 스택

| 도구 | 용도 |
|------|------|
| Vitest | 테스트 러너 + assertion |
| @testing-library/react | 컴포넌트 렌더링 + DOM 쿼리 |
| @testing-library/jest-dom | DOM matcher 확장 (`toBeInTheDocument` 등) |
| jsdom | 브라우저 환경 시뮬레이션 |

### 테스트 파일 위치

```
소스 파일                              테스트 파일
lib/constants.ts                  →   lib/__tests__/constants.test.ts
lib/traffic-generator.ts          →   lib/__tests__/traffic-generator.test.ts
lib/event-buffer.ts               →   lib/__tests__/event-buffer.test.ts
hooks/useTrafficStats.ts          →   hooks/__tests__/useTrafficStats.test.ts
hooks/useTrafficStream.ts         →   hooks/__tests__/useTrafficStream.test.ts
components/ui/CyberPanel.tsx      →   components/__tests__/CyberPanel.test.tsx
components/dashboard/Header.tsx   →   components/__tests__/Header.test.tsx
components/dashboard/LogTerminal.tsx → components/__tests__/LogTerminal.test.tsx
components/dashboard/MobileNav.tsx → components/__tests__/MobileNav.test.tsx
components/effects/GlitchText.tsx →   components/__tests__/GlitchText.test.tsx
```

- 테스트 파일은 소스와 같은 모듈의 `__tests__/` 디렉토리에 배치
- 파일명: `<소스파일명>.test.ts` 또는 `.test.tsx`

### 테스트 작성 기준

- **유틸/라이브러리**: 순수 함수 입출력 검증, 엣지 케이스 포함
- **커스텀 훅**: `renderHook`으로 상태 변화 검증
- **컴포넌트**: 렌더링 확인, 사용자 인터랙션, 조건부 렌더링
- **확률 기반 로직**: 충분한 반복(100~1000회)으로 통계적 검증

### 커밋 전 필수 검증 순서

```bash
npm run test && npm run lint && npm run build
```

---

## 프로젝트 구조

```
traffic-sight/
├── CLAUDE.md                   # 이 파일
├── docs/
│   ├── PRD.md                  # 제품 요구사항 문서
│   ├── ARCHITECTURE.md         # 아키텍처 문서
│   ├── DEVELOPMENT.md          # 개발 워크플로우
│   └── GIT_WORKFLOW.md         # Git 워크플로우
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃 (JetBrains Mono 폰트)
│   ├── page.tsx                # 메인 대시보드 ("use client")
│   ├── globals.css             # 사이버 테마 + Tailwind CSS 4
│   └── providers.tsx           # Provider 래퍼
├── components/
│   ├── dashboard/              # 대시보드 패널 컴포넌트
│   │   ├── GlobeSection.tsx    # 3D 글로브 (dynamic import, ssr: false, memo)
│   │   ├── StatsPanel.tsx      # 좌측 통계 (ECharts, memo)
│   │   ├── ThreatPanel.tsx     # 우측 위협 알림 (ECharts + Motion, memo)
│   │   ├── LogTerminal.tsx     # 하단 로그 터미널 (CSS 애니메이션, memo)
│   │   ├── Header.tsx          # 헤더 (GlitchText + 시계 + 상태, memo)
│   │   └── MobileNav.tsx       # 모바일 탭 내비게이션
│   ├── effects/                # 시각 효과
│   │   ├── MatrixRain.tsx      # Canvas 매트릭스 레인 (Web Worker)
│   │   ├── GlitchText.tsx      # 글리치 텍스트 애니메이션
│   │   └── BootSequence.tsx    # 부트 시퀀스 애니메이션
│   └── ui/                     # 재사용 UI
│       └── CyberPanel.tsx      # 네온 보더 패널 (green/cyan/red)
├── hooks/                      # 커스텀 훅
│   ├── useTrafficStream.ts     # 클라이언트 사이드 트래픽 생성 + EventBuffer
│   └── useTrafficStats.ts      # 통계 계산 (useStableRef 참조 안정화)
├── lib/                        # 유틸리티
│   ├── constants.ts            # 도시 좌표, 프로토콜, 위협 유형, 윈도우 크기
│   ├── types.ts                # TrafficEvent 타입 정의
│   ├── traffic-generator.ts    # Faker.js 기반 트래픽 이벤트 생성기
│   └── event-buffer.ts         # 이벤트 배칭 버퍼 (타이머 기반 flush)
├── vitest.config.ts            # Vitest 설정
├── vitest.setup.ts             # 테스트 환경 설정 (mock 등)
└── workers/
    └── matrix-rain.worker.ts   # OffscreenCanvas 워커
```

---

## 아키텍처 핵심 원칙

### 1. 클라이언트 중심 렌더링
- 모든 대시보드 컴포넌트는 `"use client"` 디렉티브 사용
- 실시간 상태 관리가 필요하므로 서버 컴포넌트 사용 불가
- Globe는 `dynamic(() => import(...), { ssr: false })`로 이중 보호

### 2. 데이터 흐름 (단방향)
```
traffic-generator.ts → EventBuffer → useTrafficStream → useTrafficStats → Components
(300ms 간격 생성)     (500ms flush)   (롤링 윈도우 100)   (참조 안정화)     (React.memo)
```

### 3. 상태 관리
- 외부 상태 라이브러리 없음 (React useState/useMemo만 사용)
- `useTrafficStream`: events (최근 100개), threats (최근 20개), isConnected, totalCount
- `useTrafficStats`: protocolDistribution, countryDistribution, bandwidth 등 파생 상태
- `useStableRef`: 구조적 비교로 참조 안정화, 불필요 리렌더 방지

### 4. 롤링 윈도우 패턴
- 이벤트: 최근 100개 유지 (`ROLLING_WINDOW`)
- 위협: 최근 20개 유지 (`MAX_THREAT_ENTRIES`)
- 글로브 아크: 최대 20개 동시 표시 (`MAX_ARCS`), 6초 TTL
- 글로브 링: 최대 15개, 3초 TTL
- 로그 표시: 최대 30개 (`MAX_LOG_ENTRIES`)

### 5. 성능 최적화
- EventBuffer 배칭: 초당 ~2회 state 업데이트 (300ms 생성, 500ms flush)
- React.memo: 모든 대시보드 컴포넌트 (Header, StatsPanel, ThreatPanel, LogTerminal, GlobeSection)
- useStableRef: Record/Array 구조적 비교로 참조 안정화
- Globe pointsData: 2초 스로틀
- LogTerminal: CSS 애니메이션 (AnimatePresence 제거)
- ThreatPanel: mode="sync", height 애니메이션 제거

---

## 코딩 컨벤션

### TypeScript
- `strict: true` 모드
- 인터페이스는 `I` 접두사 없이 사용 (예: `TrafficEvent`, `ArcData`)
- 타입 파일은 `lib/types.ts`에 집중

### 컴포넌트
- 모든 클라이언트 컴포넌트 파일 상단에 `"use client"` 선언
- Props 인터페이스는 컴포넌트 파일 내에 정의
- `default export` 사용
- 대시보드 컴포넌트는 `React.memo`로 래핑

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
- 전역 `user-select: none`, `cursor: default` (대시보드 모니터링 UI)
- Globe: `cursor: grab` / `cursor: grabbing` (드래그 회전)

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

### 빌드 시 주의
- Globe 컴포넌트는 반드시 `dynamic import + ssr: false`로 로드

---

## 새 기능 추가 가이드

### 새 대시보드 패널 추가
1. `components/dashboard/NewPanel.tsx` 생성 (`"use client"`)
2. `CyberPanel`로 감싸서 사이버 테마 적용
3. `React.memo`로 래핑
4. `app/page.tsx`의 그리드 레이아웃에 배치
5. 필요 시 `useTrafficStats`에 새 통계 필드 추가
6. **`components/__tests__/NewPanel.test.tsx` 테스트 작성 (필수)**

### 새 위협 유형 추가
1. `lib/constants.ts`의 `THREAT_TYPES` 배열에 추가
2. `lib/traffic-generator.ts`에서 자동으로 사용됨
3. **기존 `constants.test.ts` 테스트가 자동으로 검증**

### 새 도시 추가
1. `lib/constants.ts`의 `CITIES` 배열에 `{ city, country, countryCode, lat, lng }` 추가
2. **기존 `constants.test.ts` 테스트가 자동으로 검증**

### 새 프로토콜 추가
1. `lib/constants.ts`의 `PROTOCOLS` 배열과 `PROTOCOL_PORTS` 맵에 추가
2. **기존 `constants.test.ts` 테스트가 자동으로 검증**

### 새 커스텀 훅 추가
1. `hooks/useNewHook.ts` 작성
2. **`hooks/__tests__/useNewHook.test.ts` 테스트 작성 (필수)**

---

## 검증 체크리스트

### 자동화 테스트
- [ ] `npm run test` — 전체 112개+ 테스트 통과
- [ ] `npm run lint` — ESLint 통과
- [ ] `npm run build` — 프로덕션 빌드 성공

### 수동 검증
- [ ] `npm run dev`로 로컬 확인 (Globe 렌더링, MatrixRain 동작)
- [ ] Chrome DevTools Performance 탭에서 60fps 유지 확인
- [ ] 1920px / 1440px / 1024px / 모바일 반응형 확인
