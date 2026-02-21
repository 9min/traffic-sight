# Traffic Sight

> 사이버펑크 테마의 3D 글로브 기반 실시간 네트워크 트래픽 모니터링 대시보드

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Three.js](https://img.shields.io/badge/Three.js-0.180-black?logo=three.js)

<!--
## 데모

![Traffic Sight Dashboard](docs/demo-screenshot.png)

> [Live Demo](https://your-demo-url.vercel.app)
-->

## 소개

Traffic Sight는 보안 관제 센터(SOC)에서 영감을 받은 실시간 네트워크 트래픽 모니터링 대시보드입니다. 전 세계 32개 주요 도시 간의 네트워크 트래픽 흐름을 3D 글로브 위에 실시간 아크 애니메이션으로 시각화하며, 매트릭스 레인 배경, 글리치 텍스트, 네온 글로우 UI 등 사이버펑크 미학을 전면 적용했습니다.

Faker.js로 생성한 모의 트래픽 데이터를 클라이언트 사이드에서 자동 생성하여, 외부 서버 없이 독립적으로 동작하는 실시간 보안 관제 대시보드 경험을 제공합니다.

## 주요 기능

- **3D 글로브 시각화** — 32개 도시 간 트래픽을 아크로 표시 (정상: 초록, 위협: 빨강), 링 이펙트, 도시 마커
- **클라이언트 사이드 데이터 생성** — Faker.js 기반 트래픽 생성기 + EventBuffer 배칭으로 외부 서버 없이 독립 동작
- **통계 패널** — 프로토콜 분포 도넛 차트, 대역폭 추이 라인 차트, 상위 소스 국가, 애니메이션 카운터
- **위협 패널** — 위협 레벨 게이지, 위협 유형 분포, 슬라이드 인 애니메이션의 실시간 위협 피드
- **로그 터미널** — 해커 스타일 터미널에 개별 트래픽 이벤트를 컬러 코딩으로 표시
- **매트릭스 레인** — OffscreenCanvas Web Worker로 렌더링하는 카타카나 + 영숫자 문자 배경
- **글리치 텍스트** — 헤더 타이틀에 주기적 문자 스크램블 이펙트
- **부트 시퀀스** — 페이지 진입 시 시네마틱 부팅 애니메이션
- **모바일 대응** — 1024px 미만에서 탭 기반 내비게이션 (Globe/Stats/Threats)
- **사이버펑크 테마** — 네온 그린/시안/레드 글로우, 스캔라인, JetBrains Mono 폰트

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| 프레임워크 | Next.js 15 (App Router, Turbopack) |
| UI | React 19 |
| 언어 | TypeScript 5.7 |
| 3D 글로브 | react-globe.gl + Three.js |
| 차트 | ECharts + echarts-for-react |
| 모의 데이터 | @faker-js/faker (클라이언트 사이드 생성) |
| 애니메이션 | Motion (Framer Motion v12) + GSAP |
| 스타일링 | Tailwind CSS 4 |
| 테스트 | Vitest + React Testing Library |

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm

### 1. 저장소 클론

```bash
git clone https://github.com/9min/traffic-sight.git
cd traffic-sight
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 대시보드를 확인할 수 있습니다.
트래픽 데이터는 클라이언트에서 자동으로 생성되므로 별도 설정이 필요 없습니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Turbopack 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | 전체 테스트 실행 (112개+) |
| `npm run test:watch` | 워치 모드로 테스트 실행 |
| `npm run test:coverage` | 커버리지 리포트 포함 테스트 |

## 프로젝트 구조

```
traffic-sight/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (JetBrains Mono 폰트)
│   ├── page.tsx                # 메인 대시보드 페이지
│   ├── globals.css             # 사이버 테마 + Tailwind CSS 4
│   └── providers.tsx           # 클라이언트 Provider 래퍼
├── components/
│   ├── dashboard/
│   │   ├── GlobeSection.tsx    # 3D 글로브 + 트래픽 아크 + 링 이펙트
│   │   ├── Header.tsx          # 헤더 (글리치 타이틀, 시계, 연결 상태)
│   │   ├── StatsPanel.tsx      # 좌측 통계 패널 (차트, 카운터)
│   │   ├── ThreatPanel.tsx     # 우측 위협 패널 (게이지, 피드)
│   │   ├── LogTerminal.tsx     # 하단 로그 터미널
│   │   └── MobileNav.tsx       # 모바일 탭 내비게이션
│   ├── effects/
│   │   ├── MatrixRain.tsx      # Canvas 매트릭스 레인 배경
│   │   ├── GlitchText.tsx      # 글리치 텍스트 애니메이션
│   │   └── BootSequence.tsx    # 부트 시퀀스 애니메이션
│   └── ui/
│       └── CyberPanel.tsx      # 네온 보더 패널 컨테이너
├── hooks/
│   ├── useTrafficStream.ts     # 클라이언트 사이드 트래픽 생성 + EventBuffer
│   └── useTrafficStats.ts      # 트래픽 통계 계산 (참조 안정화)
├── lib/
│   ├── constants.ts            # 도시 좌표, 프로토콜, 위협 유형, 윈도우 크기
│   ├── types.ts                # TrafficEvent 타입 정의
│   ├── traffic-generator.ts    # Faker.js 기반 트래픽 이벤트 생성기
│   └── event-buffer.ts         # 이벤트 배칭 버퍼 (타이머 기반 flush)
└── workers/
    └── matrix-rain.worker.ts   # OffscreenCanvas 매트릭스 레인 워커
```

## 아키텍처

```
traffic-generator.ts → EventBuffer → useTrafficStream → useTrafficStats → UI 컴포넌트
(300ms 간격 생성)    (500ms flush)   (롤링 윈도우 100)   (참조 안정화)    (React.memo)
```

- 모든 대시보드 컴포넌트는 `React.memo`로 래핑하여 불필요한 리렌더 방지
- 트래픽 데이터는 클라이언트에서 자동 생성 (서버/DB 의존성 없음)
- 3D 글로브는 `next/dynamic`으로 SSR 비활성화하여 로딩
- 이벤트는 최근 100건 롤링 윈도우로 유지, 위협은 최대 20건
- 글로브에는 최대 20개의 트래픽 아크가 동시 표시 (6초 TTL)
- 통계는 `useMemo` + `useStableRef`를 통한 구조적 비교로 안정적 파생 계산
- `useTrafficStream`은 EventBuffer를 통해 초당 ~2회 state 업데이트로 배칭

## 성능 최적화

| 기법 | 효과 |
|------|------|
| EventBuffer 배칭 (300ms 생성 / 500ms flush) | state 업데이트 80% 감소 |
| useStableRef 참조 안정화 | 불필요 re-render cascade 차단 |
| React.memo (모든 대시보드 컴포넌트) | 변경 없는 컴포넌트 skip |
| Globe pointsData 2초 스로틀 | pointsData 업데이트 95% 감소 |
| CSS 애니메이션 (LogTerminal) | AnimatePresence layout thrashing 제거 |
| Arc/Ring TTL 기반 lifecycle | 메모리 및 렌더링 부하 제한 |

## 색상 시스템

| 토큰 | 헥스 코드 | 용도 |
|------|----------|------|
| `matrix-green` | `#00ff41` | 주요 텍스트, 정상 상태, 보더 |
| `cyber-cyan` | `#00d4ff` | 보조 강조, 타임스탬프, IP 주소 |
| `neon-purple` | `#bf00ff` | 패킷 크기 표시 |
| `threat-red` | `#ff0040` | 위협 관련 요소 |
| `threat-orange` | `#ff6600` | 중간 위험도, 위협 유형 텍스트 |
| `threat-yellow` | `#ffcc00` | 낮은 위험도, 주의 |

## 라이선스

MIT
