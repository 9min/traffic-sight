# Traffic Sight - 개발 워크플로우

> 프로젝트 셋업부터 배포까지의 전체 개발 가이드

---

## 목차

1. [사전 요구사항](#1-사전-요구사항)
2. [초기 셋업](#2-초기-셋업)
3. [로컬 개발](#3-로컬-개발)
4. [테스트](#4-테스트)
5. [빌드 및 배포](#5-빌드-및-배포)
6. [트러블슈팅](#6-트러블슈팅)
7. [개발 규칙](#7-개발-규칙)
8. [Git 워크플로우](#8-git-워크플로우)
9. [코드 리뷰 체크리스트](#9-코드-리뷰-체크리스트)

---

## 1. 사전 요구사항

| 도구 | 최소 버전 | 확인 명령어 |
|------|----------|------------|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Git | 2.x | `git -v` |

추가로 필요:
- **Vercel 계정** (배포 시): https://vercel.com

> **참고:** 외부 서비스(Supabase 등)는 필요하지 않습니다. 모든 트래픽 데이터는 클라이언트 측에서 Faker.js로 생성됩니다.

---

## 2. 초기 셋업

### 2.1 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd traffic-sight
npm install
```

별도의 환경 변수 설정이 필요하지 않습니다. 설치 후 바로 개발 서버를 실행할 수 있습니다.

---

## 3. 로컬 개발

### 3.1 개발 서버 시작

```bash
npm run dev
```

Turbopack이 활성화된 상태로 `http://localhost:3000`에서 실행됩니다.

### 3.2 데이터 생성 방식

트래픽 데이터는 외부 서버 없이 클라이언트 측에서 자동으로 생성됩니다:

- **`lib/traffic-generator.ts`**: Faker.js를 사용하여 가짜 트래픽 이벤트를 생성
- **`lib/event-buffer.ts`**: `EventBuffer` 클래스가 이벤트를 배치(batch)로 모아 일정 간격으로 플러시
- **`hooks/useTrafficStream.ts`**: 300ms마다 이벤트를 생성하고, 500ms 간격으로 EventBuffer를 통해 상태 업데이트

별도의 데이터 생성기 스크립트를 실행할 필요가 없습니다. 페이지 로드 시 자동으로 데이터가 생성됩니다.

### 3.3 개발 중 확인 사항

| 항목 | 확인 방법 |
|------|----------|
| Boot Sequence | 페이지 최초 로드 시 사이버 부팅 애니메이션 |
| Matrix Rain 배경 | 부팅 완료 후 녹색 문자 낙하 애니메이션 |
| Globe 렌더링 | 중앙에 3D 지구본 표시 + 자동 회전 |
| 헤더 글리치 | "TRAFFIC SIGHT" 텍스트에 주기적 글리치 효과 |
| 실시간 데이터 | 아크, 로그, 차트가 자동으로 실시간 업데이트 |
| 모바일 탭 내비게이션 | 모바일 뷰에서 하단 탭 내비게이션 동작 확인 |

### 3.4 핫 리로드

Turbopack이 파일 변경을 감지하여 자동으로 리로드합니다.
단, `next.config.ts` 변경 시에는 서버를 재시작해야 합니다.

---

## 4. 테스트

### 4.1 테스트 스택

| 도구 | 용도 |
|------|------|
| **Vitest** | 테스트 러너 + assertion |
| **@testing-library/react** | 컴포넌트 렌더링 + DOM 쿼리 |
| **@testing-library/jest-dom** | DOM matcher 확장 |
| **jsdom** | 브라우저 환경 시뮬레이션 |

### 4.2 테스트 실행

```bash
# 전체 테스트 실행
npm run test

# 워치 모드 (개발 중 파일 변경 감지)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 4.3 테스트 파일 구조

테스트 파일은 소스와 같은 모듈의 `__tests__/` 디렉토리에 배치합니다:

```
lib/
├── constants.ts
├── traffic-generator.ts
├── event-buffer.ts
└── __tests__/
    ├── constants.test.ts
    ├── traffic-generator.test.ts
    └── event-buffer.test.ts

hooks/
├── useTrafficStats.ts
├── useTrafficStream.ts
└── __tests__/
    ├── useTrafficStats.test.ts
    └── useTrafficStream.test.ts

components/
├── dashboard/
│   ├── Header.tsx
│   ├── LogTerminal.tsx
│   └── MobileNav.tsx
├── effects/
│   └── GlitchText.tsx
├── ui/
│   └── CyberPanel.tsx
└── __tests__/
    ├── CyberPanel.test.tsx
    ├── Header.test.tsx
    ├── LogTerminal.test.tsx
    ├── GlitchText.test.tsx
    └── MobileNav.test.tsx
```

### 4.4 테스트 작성 규칙

> **새로운 기능이나 버그 수정 시 반드시 테스트를 함께 작성해야 합니다.**

| 대상 | 테스트 방법 | 예시 |
|------|-----------|------|
| 순수 함수/유틸 | 입출력 검증, 엣지 케이스 | `constants.test.ts` |
| 커스텀 훅 | `renderHook`으로 상태 변화 검증 | `useTrafficStats.test.ts`, `useTrafficStream.test.ts` |
| 컴포넌트 | 렌더링, 인터랙션, 조건부 렌더링 | `CyberPanel.test.tsx` |
| 확률 로직 | 100~1000회 반복 통계 검증 | `traffic-generator.test.ts` |
| 버퍼/배치 | 타이밍 기반 플러시 동작 검증 | `event-buffer.test.ts` |

### 4.5 테스트 환경 설정

`vitest.setup.ts`에 브라우저 API 모킹이 설정되어 있습니다:

- **ResizeObserver** — Globe 반응형 사이즈 감지
- **requestAnimationFrame** — MatrixRain 캔버스 애니메이션
- **matchMedia** — 반응형 미디어 쿼리

### 4.6 커밋 전 필수 검증

```bash
npm run test && npm run lint && npm run build
# 세 가지 모두 통과해야 커밋 가능
```

---

## 5. 빌드 및 배포

### 5.1 프로덕션 빌드

```bash
npm run build
```

성공 시 출력:
```
Route (app)                                 Size  First Load JS
┌ ○ /                                     ~430 kB        ~530 kB
└ ○ /_not-found                            995 B         103 kB
```

### 5.2 로컬 프로덕션 테스트

```bash
npm run build && npm start
```

### 5.3 Vercel 배포

#### CLI 배포
```bash
npx vercel --prod
```

#### GitHub 연동 자동 배포
1. Vercel Dashboard에서 GitHub 저장소 연결
2. `main` 브랜치 push 시 자동 배포

> **참고:** 별도의 환경 변수 설정이 필요하지 않습니다. 모든 데이터가 클라이언트 측에서 생성되므로 배포 후 바로 동작합니다.

---

## 6. 트러블슈팅

### three.js 모듈 해석 오류

**증상:**
```
Module not found: Can't resolve 'three/webgpu'
Module not found: Can't resolve 'three/tsl'
```

**해결:**
- `three@0.180.0` 설치 확인: `npm ls three`
- `next.config.ts`의 webpack alias 확인

### Globe가 렌더링되지 않음

**해결:**
- 브라우저 콘솔에서 WebGL 관련 오류 확인
- `GlobeSection.tsx`가 `dynamic import + ssr: false`로 로드되는지 확인
- Three.js 버전이 0.180.0인지 확인

### 빌드 시 정적 프리렌더링 오류

**증상:** 빌드 중 `/` 페이지 프리렌더링 실패

**해결:**
- `page.tsx`가 `"use client"` 디렉티브를 사용하는지 확인
- Globe 컴포넌트가 `dynamic import + ssr: false`로 로드되는지 확인

---

## 7. 개발 규칙

### 파일 생성 규칙

- 새 컴포넌트는 해당 디렉토리에 생성 (dashboard/, effects/, ui/)
- 클라이언트 컴포넌트는 반드시 `"use client"` 디렉티브 추가
- 타입은 `lib/types.ts`에 중앙 관리
- 상수는 `lib/constants.ts`에 중앙 관리

### 스타일 규칙

- Tailwind 유틸리티 클래스 우선 사용
- 사이버 테마 색상은 `globals.css`의 `@theme` 토큰 사용
- 새 글로우/애니메이션 효과는 `globals.css`에 추가
- 인라인 스타일은 동적 값에만 사용

### 성능 규칙

- 대시보드 컴포넌트에 `React.memo` 적용하여 불필요한 리렌더링 방지
- `EventBuffer`를 활용하여 이벤트를 배치(batch)로 모아 상태 업데이트 횟수 최소화
- ECharts에 반드시 `lazyUpdate: true` 적용
- 대량 데이터는 롤링 윈도우로 제한 (`lib/constants.ts`의 상수 활용)
- `useMemo`/`useCallback`으로 불필요한 재계산 방지
- Globe 아크는 최대 20개로 제한

---

## 8. Git 워크플로우

> **모든 Git 사용 규칙은 `/docs/GIT_WORKFLOW.md` 문서를 반드시 따라야 합니다.**

자세한 내용은 → **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** 참조

### 핵심 요약

- **`main`/`dev` 직접 커밋 금지** — PR을 통해서만 머지
- **작업 브랜치는 `dev`에서 분기** — 핫픽스만 `main`에서 분기
- **커밋 컨벤션:** `<type>(<scope>): <subject>` (Conventional Commits)
- **PR 머지 전 필수:** `npm run test && npm run lint && npm run build` 통과
- **머지 전략:** 작업→dev는 Squash and Merge, dev→main은 Merge Commit
- **금지:** `--force` push (main/dev), `.env.local` 커밋, WIP 상태 머지

---

## 9. 코드 리뷰 체크리스트

### Git 규칙
- [ ] 올바른 브랜치에서 분기했는가? (dev 또는 main)
- [ ] 브랜치 네이밍 컨벤션을 따르는가? (`feat/`, `fix/` 등)
- [ ] 커밋 메시지가 Conventional Commits 형식인가?
- [ ] 하나의 커밋에 하나의 변경만 포함하는가?

### 기능
- [ ] 요구사항을 정확히 구현했는가?
- [ ] 에지 케이스를 처리했는가?
- [ ] 기존 기능에 영향이 없는가?

### 성능
- [ ] 불필요한 리렌더링이 없는가? (`React.memo` 적용 확인)
- [ ] 대용량 데이터 처리 시 메모리 누수가 없는가?
- [ ] EventBuffer 배치 처리가 적절한가?
- [ ] 애니메이션이 60fps를 유지하는가?

### 코드 품질
- [ ] TypeScript 타입이 정확한가? (`lib/types.ts` 활용)
- [ ] `"use client"` 디렉티브가 적절한가?
- [ ] 사이버 테마 컨벤션을 따르는가?

### 테스트
- [ ] 새 기능/수정에 대한 테스트가 작성되었는가?
- [ ] `npm run test`가 전체 112개+ 테스트 통과하는가?
- [ ] 기존 테스트를 깨뜨리지 않았는가?

### 빌드
- [ ] `npm run build`가 성공하는가?
- [ ] `npm run lint`가 통과하는가?
