# Traffic Sight - 아키텍처 문서

> 사이버펑크 테마의 실시간 네트워크 트래픽 대시보드
> Next.js 15 | React 19 | Client-side Traffic Generation | Three.js | ECharts

---

## 목차

1. [시스템 개요](#1-시스템-개요)
2. [아키텍처 다이어그램](#2-아키텍처-다이어그램)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [데이터 흐름](#4-데이터-흐름)
5. [컴포넌트 계층](#5-컴포넌트-계층)
6. [상태 관리](#6-상태-관리)
7. [데이터 생성 및 버퍼링](#7-데이터-생성-및-버퍼링)
8. [렌더링 전략](#8-렌더링-전략)
9. [스타일링 시스템](#9-스타일링-시스템)
10. [주요 설계 결정](#10-주요-설계-결정)
11. [성능 최적화](#11-성능-최적화)
12. [의존성 관리](#12-의존성-관리)

---

## 1. 시스템 개요

Traffic Sight는 전 세계 네트워크 트래픽을 실시간으로 모니터링하고 시각화하는 사이버펑크 테마의 대시보드 애플리케이션이다. 클라이언트 사이드에서 Faker.js 기반 `traffic-generator`로 가짜 트래픽 데이터를 생성하고, `EventBuffer`를 통해 배치 처리한 뒤, 3D 지구본(react-globe.gl) 위에 트래픽 아크와 링을 렌더링하고, ECharts 차트와 모션 애니메이션 기반의 위협 피드를 통해 네트워크 상태를 종합적으로 표시한다. 외부 서버나 데이터베이스 없이 완전히 클라이언트에서 독립 실행된다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **3D 지구본 시각화** | react-globe.gl 기반, 아크 + 링 + 포인트 레이어, 비네트 오버레이 |
| **실시간 통계 패널** | 프로토콜 분포(파이), 대역폭 추이(라인), 상위 국가(바), AnimatedCounter |
| **위협 탐지 피드** | 게이지 차트 + AnimatePresence(mode="sync") 기반 실시간 위협 목록 |
| **로그 터미널** | 매트릭스 스타일 로그, CSS `.log-entry-appear` 애니메이션, 모듈 레벨 formatTime 캐시 |
| **부트 시퀀스** | 사이버펑크 부팅 애니메이션 (BootSequence), 프로그레스 바 |
| **모바일 내비게이션** | 탭 기반 MobileNav (Globe/Stats/Threats) |
| **시각 이펙트** | 캔버스 매트릭스 레인, CSS 글리치 텍스트, 네온 글로우 |

### 기술 스택

| 계층 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router, Turbopack) |
| UI 라이브러리 | React 19 |
| 3D 렌더링 | Three.js 0.180.0, react-globe.gl 2.32.0 |
| 차트 | ECharts 5.5.0 (echarts-for-react) |
| 애니메이션 | Motion (framer-motion) v12, GSAP 3.13.0 |
| 데이터 생성 | @faker-js/faker 10.x (클라이언트 사이드) |
| 데이터 버퍼링 | EventBuffer (커스텀 배치 처리 클래스) |
| 스타일링 | Tailwind CSS 4 (PostCSS 플러그인) |
| 타입 시스템 | TypeScript 5.7 (strict mode) |
| 폰트 | JetBrains Mono (next/font/google) |
| 테스트 | Vitest + @testing-library/react (112개 테스트) |

---

## 2. 아키텍처 다이어그램

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Next.js App Shell                        │   │
│  │                     (layout.tsx + Providers)                  │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │           BootSequence → DashboardPage               │    │   │
│  │  │                   ("use client")                      │    │   │
│  │  │                                                        │    │   │
│  │  │  ┌─ 데이터 생성 ──────────────────────────────────┐   │    │   │
│  │  │  │  traffic-generator.ts  (Faker.js, 300ms 간격)  │   │    │   │
│  │  │  │          │                                      │   │    │   │
│  │  │  │          ▼                                      │   │    │   │
│  │  │  │  EventBuffer  (500ms 주기 플러시)               │   │    │   │
│  │  │  │          │                                      │   │    │   │
│  │  │  │          ▼                                      │   │    │   │
│  │  │  │  useTrafficStream  (배치 상태 업데이트)         │   │    │   │
│  │  │  │  useTrafficStats   (useMemo + useStableRef)     │   │    │   │
│  │  │  └─────────────────────────────────────────────────┘   │    │   │
│  │  │                        │                               │    │   │
│  │  │          ┌─────────────┼─────────────┐                │    │   │
│  │  │          ▼             ▼             ▼                │    │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐         │    │   │
│  │  │  │  Stats   │ │  Globe   │ │   Threat     │         │    │   │
│  │  │  │  Panel   │ │ Section  │ │   Panel      │         │    │   │
│  │  │  │(ECharts) │ │(Three.js)│ │(ECharts+     │         │    │   │
│  │  │  │ memo()   │ │ memo()   │ │ Motion)      │         │    │   │
│  │  │  └──────────┘ └──────────┘ │ memo()       │         │    │   │
│  │  │          │                  └──────────────┘         │    │   │
│  │  │          ▼                                            │    │   │
│  │  │  ┌───────────────────────────────────┐               │    │   │
│  │  │  │    LogTerminal (CSS animation)    │               │    │   │
│  │  │  │    memo()                          │               │    │   │
│  │  │  └───────────────────────────────────┘               │    │   │
│  │  │                                                        │    │   │
│  │  │  ┌──────────────────────────────────┐                 │    │   │
│  │  │  │  MobileNav (Tab Navigation)      │  ← lg 미만     │    │   │
│  │  │  │  Globe | Stats | Threats          │                 │    │   │
│  │  │  └──────────────────────────────────┘                 │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐                          │   │
│  │  │ MatrixRain   │  │ GlitchText   │  ← 배경 이펙트 레이어   │   │
│  │  │ (Canvas 2D)  │  │ (CSS+JS)     │                          │   │
│  │  └──────────────┘  └──────────────┘                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ※ 외부 서버/DB 연결 없음 — 완전 클라이언트 독립 실행              │
└─────────────────────────────────────────────────────────────────────┘
```

### 대시보드 레이아웃 구조

```
┌──────────────────────────────────────────────────────────────┐
│  Header (GlitchText + Clock + Connection Status)     z:20   │
│  memo() — isConnected=항상 true ("CONNECTED")               │
├───────────┬────────────────────────────┬─────────────────────┤
│           │                            │                     │
│  Stats    │      GlobeSection          │    ThreatPanel      │
│  Panel    │      (3D Globe)            │    (Gauge +         │
│  280px    │      flex: 1               │     Feed)           │
│  memo()   │      memo()               │    300px            │
│           │                            │    memo()           │
│  - 개요   │   ┌──────────────────┐     │                     │
│  - 프로토콜│   │  react-globe.gl  │     │  - 위협 레벨       │
│  - 대역폭 │   │  + arcs/rings    │     │  - 위협 유형       │
│  - 상위국가│   │  + points        │     │  - 실시간 피드     │
│           │   │  + vignette      │     │                     │
│           │   └──────────────────┘     │                     │
├───────────┴────────────────────────────┴─────────────────────┤
│  LogTerminal (200px) memo()                          z:10   │
│  CSS .log-entry-appear animation                            │
│  [22:15:30] 192.168.1.1 → 10.0.0.1 HTTPS :443 [2.1KB]     │
│  root@traffic-sight:~$ █                                     │
└──────────────────────────────────────────────────────────────┘

  ← 배경: MatrixRain (Canvas, z:0, opacity:15%) →

모바일 (lg 미만):
┌──────────────────────────────┐
│  Header                      │
├──────────────────────────────┤
│  MobileNav (Tab Bar)         │
│  ◉ GLOBE | ▦ STATS | ⚠ THREATS │
├──────────────────────────────┤
│  (선택된 탭 콘텐츠)          │
├──────────────────────────────┤
│  LogTerminal (200px)         │
└──────────────────────────────┘
```

---

## 3. 디렉토리 구조

```
D:\vibe-coding\traffic-sight\
│
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # 루트 레이아웃
│   │                             #   - JetBrains Mono 폰트 설정 (next/font/google)
│   │                             #   - <html lang="en" className="dark">
│   │                             #   - Providers 래퍼 적용
│   │                             #   - 전역 CSS import
│   ├── page.tsx                  # 대시보드 메인 페이지 ("use client")
│   │                             #   - useTrafficStream/useTrafficStats 훅 호출
│   │                             #   - dynamic import: MatrixRain, GlobeSection
│   │                             #   - BootSequence 부팅 애니메이션
│   │                             #   - MobileNav 모바일 탭 내비게이션
│   │                             #   - motion 기반 panelVariants 진입 애니메이션
│   │                             #   - globe를 useMemo로 감싸 불필요한 재생성 방지
│   │                             #   - CSS Grid 3단 레이아웃 (데스크톱)
│   ├── globals.css               # 전역 스타일
│   │                             #   - Tailwind CSS 4 @import "tailwindcss"
│   │                             #   - @theme 블록: 사이버펑크 색상 변수 12종
│   │                             #   - user-select: none; cursor: default (body)
│   │                             #   - .globe-grab canvas { cursor: grab }
│   │                             #   - .globe-vignette 비네트 오버레이
│   │                             #   - .log-entry-appear CSS 애니메이션
│   │                             #   - 네온 글로우 유틸리티 (green/cyan/red)
│   │                             #   - 애니메이션: borderPulse, scanline, glitch1/2,
│   │                             #     fadeSlideIn, logEntryAppear
│   │                             #   - 스크롤바/선택 영역 커스터마이징
│   └── providers.tsx             # Provider 래퍼 (현재 패스스루, 확장 지점)
│
├── components/
│   ├── dashboard/                # 대시보드 핵심 컴포넌트 (모두 React.memo 적용)
│   │   ├── Header.tsx            # 상단 헤더 — memo(Header)
│   │   │                         #   - GlitchText 로 타이틀 렌더링
│   │   │                         #   - useAnimatedCounter (RAF 기반 DOM 직접 조작)
│   │   │                         #   - 1초 간격 시계 (setInterval)
│   │   │                         #   - 연결 상태 표시등 (항상 CONNECTED)
│   │   │                         #   - 이벤트 총 카운트
│   │   ├── GlobeSection.tsx      # 3D 지구본 — memo(GlobeSection)
│   │   │                         #   - react-globe.gl (double dynamic import)
│   │   │                         #   - 자동 회전 (autoRotateSpeed: 0.8)
│   │   │                         #   - arcsData: MAX_ARCS(20)개, TTL=6000ms, transitionDuration=0
│   │   │                         #   - ringsData: MAX_RINGS(15)개, TTL=3000ms
│   │   │                         #   - pointsData: 2초 스로틀, pointsMerge=true, transitionDuration=0
│   │   │                         #   - atmosphereColor=#00d4ff, atmosphereAltitude=0.25
│   │   │                         #   - ResizeObserver 기반 컨테이너 크기 추적
│   │   │                         #   - 1초 간격 cleanup timer (만료 arc/ring 제거)
│   │   │                         #   - globe-vignette 오버레이
│   │   ├── StatsPanel.tsx        # 왼쪽 통계 패널 — memo(StatsPanel)
│   │   │                         #   - AnimatedCounter: RAF 기반, cancelAnimationFrame 정리
│   │   │                         #   - 프로토콜 도넛 차트 (ECharts pie, 상위 6개)
│   │   │                         #   - 대역폭 추이 라인 차트 (ECharts line)
│   │   │                         #   - topCountries useMemo 래핑 (상위 5개국 CSS 바)
│   │   ├── ThreatPanel.tsx       # 오른쪽 위협 패널 — memo(ThreatPanel)
│   │   │                         #   - 위협 게이지 (ECharts gauge, 0-100%)
│   │   │                         #   - 위협 유형별 분포 (상위 5개, useMemo)
│   │   │                         #   - AnimatePresence mode="sync" (height 애니메이션 없음)
│   │   │                         #   - ThreatBadge: LOW/MEDIUM/HIGH/CRITICAL/SEVERE
│   │   ├── LogTerminal.tsx       # 하단 로그 터미널 — memo(LogTerminal)
│   │   │                         #   - CSS .log-entry-appear 애니메이션 (AnimatePresence 미사용)
│   │   │                         #   - formatTime 모듈 레벨 캐시 (최대 200 엔트리)
│   │   │                         #   - visibleEvents useMemo (MAX_LOG_ENTRIES=30)
│   │   │                         #   - 자동 스크롤 (scrollTop = 0, 최신 상단)
│   │   │                         #   - 위협 이벤트 좌측 빨간 보더 강조
│   │   └── MobileNav.tsx         # 모바일 탭 내비게이션
│   │                             #   - Tab: globe | stats | threats
│   │                             #   - globeSlot prop으로 Globe 인스턴스 재사용
│   │                             #   - lg 미만에서만 표시
│   │
│   ├── effects/                  # 시각 이펙트 컴포넌트
│   │   ├── MatrixRain.tsx        # 매트릭스 비 효과
│   │   │                         #   - Canvas 2D, requestAnimationFrame 루프
│   │   │                         #   - 카타카나 + 숫자 + 영문 문자셋
│   │   │                         #   - fixed position, z:0, opacity:15%
│   │   │                         #   - 리사이즈 대응 (window resize listener)
│   │   ├── GlitchText.tsx        # 글리치 텍스트 효과
│   │   │                         #   - JS: 2-4초 간격 랜덤 문자 치환 (2-4글자)
│   │   │                         #   - CSS: glitch1/2 키프레임 레이어 (cyan/red)
│   │   │                         #   - clip-path + translate 기반 글리치
│   │   └── BootSequence.tsx      # 부트 시퀀스 애니메이션
│   │                             #   - 7단계 부팅 메시지 (타이머 기반 순차 표시)
│   │                             #   - AnimatePresence 페이드아웃
│   │                             #   - 프로그레스 바 (motion.div width 애니메이션)
│   │                             #   - onComplete 콜백으로 대시보드 전환
│   │
│   └── ui/                       # 재사용 UI 프리미티브
│       └── CyberPanel.tsx        # 네온 보더 패널
│                                 #   - variant: green | cyan | red
│                                 #   - 코너 장식 (4모서리 L자 보더)
│                                 #   - 타이틀바: 펄스 닷 + 트래킹 타이틀
│                                 #   - scanline-effect 오버레이
│                                 #   - cyber-border-pulse 옵션
│
├── hooks/                        # 커스텀 React 훅
│   ├── useTrafficStream.ts       # 클라이언트 사이드 트래픽 생성 및 구독
│   │                             #   - generateTrafficEvent() → EventBuffer → 배치 플러시
│   │                             #   - GENERATION_INTERVAL_MS=300 (이벤트 생성 주기)
│   │                             #   - FLUSH_INTERVAL_MS=500 (버퍼 플러시 주기)
│   │                             #   - 롤링 윈도우: events(100), threats(20)
│   │                             #   - isConnected: EventBuffer 시작 후 항상 true
│   │                             #   - totalCount 누적 카운터
│   └── useTrafficStats.ts        # 파생 통계 계산
│                                 #   - useMemo 기반 (events, threats 의존)
│                                 #   - useStableRef: 구조적 비교로 불필요한 참조 변경 방지
│                                 #   - 프로토콜/국가 분포 집계
│                                 #   - 대역폭 히스토리 (10개 버킷, 30초 윈도우)
│                                 #   - PPS: 최근 5초 기반 packets/sec 계산
│                                 #   - 평균 위협 레벨, 위협 유형별 카운트
│
├── workers/                      # Web Worker
│   └── matrix-rain.worker.ts     # OffscreenCanvas 매트릭스 레인
│                                 #   - 메인 스레드 부하 경감용 (선택적)
│                                 #   - init: OffscreenCanvas 전달 받아 초기화
│                                 #   - resize: 캔버스 크기 재설정
│                                 #   - requestAnimationFrame 루프
│
├── lib/                          # 공유 라이브러리
│   ├── traffic-generator.ts      # 트래픽 이벤트 생성기 (클라이언트 사이드)
│   │                             #   - Faker.js 기반 랜덤 이벤트 생성
│   │                             #   - generateTrafficEvent(): 단일 이벤트 생성
│   │                             #   - generateBatch(count): 배치 생성
│   │                             #   - 15% 위협 확률, threat_level 1-5
│   │                             #   - 32개 도시, src/dst 중복 방지
│   ├── event-buffer.ts           # 이벤트 배치 버퍼 클래스
│   │                             #   - EventBuffer<T>: 제네릭 배치 처리
│   │                             #   - push(item): 버퍼에 추가
│   │                             #   - start(): setInterval로 주기적 플러시 시작
│   │                             #   - stop(): clearInterval + 잔여 플러시
│   │                             #   - flush(): 버퍼 비우고 onFlush 콜백 호출
│   │                             #   - pending: 현재 버퍼 크기 조회
│   ├── types.ts                  # 타입 정의
│   │                             #   - TrafficEvent: 19개 필드 (id, created_at, IPs, 좌표, ...)
│   │                             #   - ArcData: 지구본 아크 데이터
│   └── constants.ts              # 상수 정의
│                                 #   - CITIES: 32개 도시 좌표
│                                 #   - PROTOCOLS: 10종 (TCP, UDP, ICMP, HTTP, ...)
│                                 #   - PROTOCOL_PORTS: 프로토콜-포트 매핑
│                                 #   - THREAT_TYPES: 10종 위협 유형
│                                 #   - ROLLING_WINDOW=100, MAX_ARCS=20,
│                                 #     MAX_LOG_ENTRIES=30, MAX_THREAT_ENTRIES=20
│                                 #   - ARC_TTL_MS=6000, RING_TTL_MS=3000
│                                 #   - BANDWIDTH_BUCKET_COUNT=10, BANDWIDTH_WINDOW_SEC=30,
│                                 #     BANDWIDTH_BUCKET_SEC=3
│
├── next.config.ts                # Next.js 설정
│                                 #   - transpilePackages: react-globe.gl, globe.gl, three-globe
│                                 #   - webpack alias: three, three/webgpu, three/tsl, three/addons
│                                 #   - 클라이언트 사이드 fallback: fs=false, path=false
├── vitest.config.ts              # Vitest 설정
├── vitest.setup.ts               # 테스트 환경 설정 (mock 등)
├── postcss.config.mjs            # PostCSS: @tailwindcss/postcss 플러그인
├── tsconfig.json                 # TypeScript: strict, bundler resolution, @/* 경로 별칭
└── package.json                  # 의존성 및 스크립트 정의
```

---

## 4. 데이터 흐름

### 전체 데이터 파이프라인

```
┌─────────────────────────────────────────────────────────────────┐
│                   클라이언트 사이드 데이터 생성                    │
│                                                                   │
│  ┌──────────────────────┐                                        │
│  │  setInterval         │  300ms 간격                            │
│  │  (GENERATION_        │                                        │
│  │   INTERVAL_MS)       │                                        │
│  └──────────┬───────────┘                                        │
│             │                                                     │
│             ▼                                                     │
│  ┌──────────────────────┐                                        │
│  │ traffic-generator.ts │  Faker.js 기반                         │
│  │                      │  - randomCity() × 2 (src/dst)         │
│  │ generateTrafficEvent │  - random protocol/port               │
│  │                      │  - 15% 확률 threat_level 1-5          │
│  │ + crypto.randomUUID  │  - packet_size 64~65535               │
│  │ + new Date().toISO   │                                        │
│  └──────────┬───────────┘                                        │
│             │  TrafficEvent                                       │
│             ▼                                                     │
│  ┌──────────────────────┐                                        │
│  │    EventBuffer       │  500ms 주기 플러시 (FLUSH_INTERVAL_MS) │
│  │                      │                                        │
│  │  buffer.push(event)  │  ~1.67개 이벤트/플러시 (300ms 생성     │
│  │  setInterval(flush)  │  주기 × 500ms 플러시 주기)             │
│  │                      │  → 초당 ~2회 상태 업데이트              │
│  └──────────┬───────────┘                                        │
│             │  batch: TrafficEvent[]                              │
│             ▼                                                     │
│  ┌──────────────────────────────────────┐                        │
│  │         useTrafficStream()           │                        │
│  │                                      │                        │
│  │  flushPending(batch):                │                        │
│  │   setEvents([...batch, ...prev]      │                        │
│  │     .slice(0, ROLLING_WINDOW))       │  ← 100개 유지         │
│  │   setTotalCount(prev + batch.length) │                        │
│  │   setThreats([...threatBatch, ...prev│                        │
│  │     .slice(0, MAX_THREAT_ENTRIES))   │  ← 20개 유지          │
│  │                                      │                        │
│  │  출력:                               │                        │
│  │   events[0..99]                      │                        │
│  │   threats[0..19]                     │                        │
│  │   isConnected (항상 true)            │                        │
│  │   totalCount (누적)                  │                        │
│  └──────────┬───────────────────────────┘                        │
│             │                                                     │
│             ▼                                                     │
│  ┌──────────────────────────────────────┐                        │
│  │         useTrafficStats()            │                        │
│  │         (useMemo + useStableRef)     │                        │
│  │                                      │                        │
│  │  입력: events, threats               │                        │
│  │                                      │                        │
│  │  계산:                               │                        │
│  │   protocolDistribution  (useStableRef│                        │
│  │   countryDistribution    shallowEqual│                        │
│  │   bandwidthHistory[10]   arrayEqual) │                        │
│  │   threatsByType                      │                        │
│  │   avgThreatLevel                     │                        │
│  │   totalBandwidth                     │                        │
│  │   packetsPerSecond (5초 윈도우)      │                        │
│  └──────────┬───────────────────────────┘                        │
│             │                                                     │
│       ┌─────┼─────────────────┐                                  │
│       ▼     ▼                 ▼                                  │
│  ┌────────┐ ┌──────────┐ ┌──────────┐                           │
│  │ Stats  │ │  Globe   │ │ Threat   │                           │
│  │ Panel  │ │ Section  │ │ Panel    │                           │
│  │ memo() │ │ memo()   │ │ memo()   │                           │
│  └────────┘ └──────────┘ └──────────┘                           │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────────┐                                                │
│  │ LogTerminal  │                                                │
│  │ memo()       │                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 이벤트 데이터 모델 (TrafficEvent)

```
TrafficEvent {
  id:               string      ← crypto.randomUUID() (클라이언트 생성)
  created_at:       string      ← new Date().toISOString() (클라이언트 생성)
  src_ip:           string      ← Faker.js IPv4
  src_country_code: string      ← 32개 도시 중 랜덤 선택
  src_city:         string|null ← 도시명
  src_lat/src_lng:  number      ← 위도/경도
  dst_ip:           string      ← Faker.js IPv4 (src와 다른 도시)
  dst_country_code: string
  dst_city:         string|null
  dst_lat/dst_lng:  number
  protocol:         string      ← TCP|UDP|ICMP|HTTP|HTTPS|DNS|SSH|FTP|SMTP|TLS
  port:             number|null ← 프로토콜 기본 포트 또는 랜덤 (1024-65535)
  packet_size:      number      ← 64 ~ 65535 bytes
  threat_level:     number      ← 0(정상) | 1-5(위협)
  threat_type:      string|null ← NULL 또는 위협 유형 10종 중 1
  status:           string      ← "active" (기본)
}
```

### 파생 통계 데이터 (TrafficStats)

```
TrafficStats {
  totalPackets:          number          ← events.length
  totalBandwidth:        number          ← sum(event.packet_size)
  protocolDistribution:  Record<K, V>    ← {TCP: 12, HTTPS: 8, ...}
  countryDistribution:   Record<K, V>    ← {US: 15, JP: 7, ...}
  threatCount:           number          ← threats.length
  threatsByType:         Record<K, V>    ← {"DDoS Attack": 3, ...}
  avgThreatLevel:        number          ← mean(threat.threat_level)
  bandwidthHistory:      number[]        ← 10개 시간 버킷별 대역폭 (30초 윈도우)
  packetsPerSecond:      number          ← 최근 5초 이벤트 수 / 5
}
```

---

## 5. 컴포넌트 계층

### 컴포넌트 트리

```
RootLayout (서버 컴포넌트)
│  - JetBrains Mono 폰트
│  - <html lang="en" className="dark">
│  - globals.css
│
└── Providers ("use client")
    │  - 현재 패스스루, 향후 전역 상태/테마 Provider 확장 가능
    │
    └── DashboardPage ("use client")
        │  - useState(booted) — BootSequence 완료 여부
        │  - useTrafficStream() → { events, threats, isConnected, totalCount }
        │  - useTrafficStats(events, threats) → stats
        │  - useMemo(() => <GlobeSection />) — Globe 재생성 방지
        │  - panelVariants: motion 기반 진입 애니메이션 (delay 0.15초 간격)
        │
        ├── BootSequence (조건부: !booted)
        │     ├── 7단계 부팅 메시지 (타이머 기반 순차 표시)
        │     ├── motion.div 프로그레스 바
        │     └── AnimatePresence 페이드아웃 → onComplete → setBooted(true)
        │
        ├── MatrixRain [dynamic, ssr: false]
        │     └── <canvas> (fixed, z:0, opacity:15%)
        │
        ├── motion.div (Header 래퍼, opacity/y 진입)
        │     └── Header — memo(Header)
        │           ├── GlitchText (title: "TRAFFIC SIGHT")
        │           │     ├── <span> 문자별 glitch-char
        │           │     ├── <span> glitch1 레이어 (cyan)
        │           │     └── <span> glitch2 레이어 (red)
        │           ├── 버전 배지 "v2.0.4"
        │           ├── "REALTIME" 배지
        │           ├── useAnimatedCounter → 이벤트 카운트 (RAF + DOM 직접 조작)
        │           ├── 디지털 시계 (1초 갱신)
        │           └── 연결 상태 (항상 CONNECTED, 녹색 펄스 닷)
        │
        ├── <main> CSS Grid: grid-cols-[280px_1fr_300px] (lg 이상)
        │   │
        │   ├── motion.aside (panelVariants, custom=0)
        │   │     └── StatsPanel — memo(StatsPanel)
        │   │           ├── CyberPanel "OVERVIEW" (variant: green, pulse)
        │   │           │     ├── AnimatedCounter "Total Packets" (RAF + cancelAnimationFrame)
        │   │           │     ├── AnimatedCounter "Threats"
        │   │           │     ├── Bandwidth (formatBytes)
        │   │           │     └── Packets/sec
        │   │           ├── CyberPanel "PROTOCOLS" (variant: cyan)
        │   │           │     └── ReactECharts (pie, 도넛, 상위 6 프로토콜, useMemo)
        │   │           ├── CyberPanel "BANDWIDTH" (variant: cyan)
        │   │           │     └── ReactECharts (line, area gradient, useMemo)
        │   │           └── CyberPanel "TOP SOURCES" (variant: green)
        │   │                 └── CSS 프로그레스 바 (topCountries useMemo, 상위 5개국)
        │   │
        │   ├── motion.section (panelVariants, custom=1)
        │   │     └── GlobeSection — memo(GlobeSection) [dynamic, ssr: false]
        │   │           ├── useContainerSize (ResizeObserver)
        │   │           ├── Globe (react-globe.gl) [dynamic, ssr: false]
        │   │           │     ├── arcsData (최대 20개, TTL 6초, transitionDuration=0)
        │   │           │     ├── ringsData (최대 15개, TTL 3초)
        │   │           │     └── pointsData (2초 스로틀, pointsMerge=true, transitionDuration=0)
        │   │           ├── handleGlobeReady: emissive glow + point light
        │   │           └── <div className="globe-vignette"> 비네트 오버레이
        │   │
        │   └── motion.aside (panelVariants, custom=2)
        │         └── ThreatPanel — memo(ThreatPanel)
        │               ├── CyberPanel "THREAT LEVEL" (variant: red, pulse)
        │               │     └── ReactECharts (gauge, 0-100%, useMemo)
        │               ├── CyberPanel "THREAT TYPES" (variant: red)
        │               │     └── 위협 유형 리스트 (threatTypeEntries useMemo, 상위 5개)
        │               └── CyberPanel "LIVE THREAT FEED" (variant: red)
        │                     └── AnimatePresence (mode: "sync")
        │                           └── motion.div (최대 10개 위협)
        │                                 ├── 타임스탬프
        │                                 ├── ThreatBadge (severity)
        │                                 ├── threat_type
        │                                 └── src/dst IP + city
        │
        ├── motion.div (MobileNav 래퍼, lg 미만에서만 표시)
        │     └── MobileNav
        │           ├── Tab Bar: ◉ GLOBE | ▦ STATS | ⚠ THREATS
        │           └── 탭 콘텐츠: globeSlot | StatsPanel | ThreatPanel
        │
        └── motion.footer (panelVariants, custom=3)
              └── LogTerminal — memo(LogTerminal)
                    ├── 터미널 헤더 (3색 닫기 버튼 + "Network Traffic Log" + entries 카운트)
                    ├── visibleEvents (useMemo, MAX_LOG_ENTRIES=30)
                    │     └── <div> (CSS .log-entry-appear, AnimatePresence 미사용)
                    │           ├── [timestamp] (formatTime 캐시)
                    │           ├── src_ip → dst_ip
                    │           ├── protocol :port
                    │           ├── [packet_size] (formatSize)
                    │           ├── route (city, country → city, country) (lg에서만)
                    │           └── threat badge (조건부)
                    └── 터미널 프롬프트 "root@traffic-sight:~$ █"
```

### 컴포넌트별 상태 소유권

| 컴포넌트 | 로컬 상태 | 외부 의존 | memo |
|----------|----------|----------|------|
| DashboardPage | booted | useTrafficStream, useTrafficStats | - |
| Header | time (1초 갱신) | isConnected, totalCount (props) | memo |
| GlobeSection | mounted, arcsData, ringsData, pointsData, size | events (props), globeRef | memo |
| StatsPanel | - | stats (props) | memo |
| ThreatPanel | - | threats, stats (props) | memo |
| LogTerminal | - | events (props), scrollRef | memo |
| MobileNav | activeTab | stats, threats, globeSlot (props) | - |
| BootSequence | visibleLines, fading | onComplete (props) | - |
| MatrixRain | - | canvasRef, animationFrame | - |
| GlitchText | - | containerRef, glitch timeout | - |
| AnimatedCounter | prevValue (ref) | value (props) | - |

---

## 6. 상태 관리

### 상태 관리 전략

Traffic Sight는 **외부 상태 관리 라이브러리 없이** React의 내장 Hook만으로 상태를 관리한다. 이는 단일 페이지 대시보드의 특성에 맞는 의도적인 선택이다.

```
┌─────────────────────────────────────────────────────┐
│                  상태 계층                            │
│                                                      │
│  ┌──── useTrafficStream (최상위 상태 소유자) ─────┐ │
│  │                                                 │ │
│  │  events:      TrafficEvent[]  (롤링 윈도우 100)│ │
│  │  threats:     TrafficEvent[]  (롤링 윈도우 20) │ │
│  │  isConnected: boolean (항상 true)              │ │
│  │  totalCount:  number (누적)                    │ │
│  │                                                 │ │
│  │  내부:                                         │ │
│  │   EventBuffer<TrafficEvent> (bufferRef)        │ │
│  │   setInterval(generateTrafficEvent, 300ms)     │ │
│  │   EventBuffer.flush(flushPending, 500ms)       │ │
│  │                                                 │ │
│  └───────────────┬─────────────────────────────────┘ │
│                  │                                    │
│                  ▼                                    │
│  ┌──── useTrafficStats (파생 상태) ───────────────┐ │
│  │                                                 │ │
│  │  useMemo(events, threats) → raw stats          │ │
│  │                                                 │ │
│  │  useStableRef(protocolDistribution,            │ │
│  │              shallowRecordEqual)               │ │
│  │  useStableRef(countryDistribution,             │ │
│  │              shallowRecordEqual)               │ │
│  │  useStableRef(threatsByType,                   │ │
│  │              shallowRecordEqual)               │ │
│  │  useStableRef(bandwidthHistory,                │ │
│  │              arrayEqual)                       │ │
│  │                                                 │ │
│  │  → 구조적으로 동일하면 이전 참조 유지           │ │
│  │  → 하위 컴포넌트의 불필요한 리렌더 방지         │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──── 컴포넌트 로컬 상태 ─────────────────────┐    │
│  │                                               │    │
│  │  DashboardPage:  booted (useState)            │    │
│  │  Header:         time (useState + setInterval)│    │
│  │  GlobeSection:   mounted, arcsData, ringsData,│    │
│  │                  pointsData, size (useState)   │    │
│  │  MobileNav:      activeTab (useState)         │    │
│  │  BootSequence:   visibleLines, fading         │    │
│  │  AnimatedCounter: prevValue (useRef)          │    │
│  │  GlitchText:     timeout (useRef)             │    │
│  │  MatrixRain:     animId, drops (useRef)       │    │
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 데이터 전파 방식

```
DashboardPage
│
├── events ──────────▶ GlobeSection (arcsData, ringsData, pointsData 계산)
├── events ──────────▶ LogTerminal (로그 엔트리 목록, MAX_LOG_ENTRIES=30)
├── events ──────────▶ useMemo(() => <GlobeSection />) → MobileNav.globeSlot
├── threats ─────────▶ ThreatPanel (위협 피드)
├── threats ─────────▶ MobileNav.threats
├── stats ───────────▶ StatsPanel (차트 데이터)
├── stats ───────────▶ ThreatPanel (게이지, 위협 유형 분포)
├── stats ───────────▶ MobileNav.stats
├── isConnected ─────▶ Header (연결 상태 표시, 항상 "CONNECTED")
└── totalCount ──────▶ Header (이벤트 카운트, useAnimatedCounter)
```

### 롤링 윈도우 메커니즘

```typescript
// useTrafficStream.ts의 flushPending 콜백 (배치 처리)
const flushPending = useCallback((batch: TrafficEvent[]) => {
  if (batch.length === 0) return;

  // 이벤트 배열: 배치를 맨 앞에 추가, 100개 초과시 자름
  setEvents((prev) => [...batch, ...prev].slice(0, ROLLING_WINDOW));    // 100

  // 누적 카운트는 배치 크기만큼 증가
  setTotalCount((prev) => prev + batch.length);

  // threat_level > 0인 이벤트만 별도 배열로 관리, 20개 제한
  const threatBatch = batch.filter((e) => e.threat_level > 0);
  if (threatBatch.length > 0) {
    setThreats((prev) => [...threatBatch, ...prev].slice(0, MAX_THREAT_ENTRIES)); // 20
  }
}, []);
```

이 패턴은 다음을 보장한다:
- **배치 처리**: EventBuffer가 여러 이벤트를 모아 한 번에 플러시 (초당 ~2회 상태 업데이트)
- **메모리 상한**: 최대 100개 이벤트 + 20개 위협만 유지
- **최신 우선**: 새 이벤트가 배열 맨 앞에 삽입
- **자동 만료**: 오래된 이벤트는 slice에 의해 자동 제거
- **누적 카운트**: totalCount는 롤링 윈도우와 별개로 계속 증가

---

## 7. 데이터 생성 및 버퍼링

### 클라이언트 사이드 데이터 생성 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  useTrafficStream() — useEffect 내부                             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  setInterval(생성 루프, GENERATION_INTERVAL_MS=300ms)      │   │
│  │                                                             │   │
│  │  매 300ms마다:                                             │   │
│  │    1. generateTrafficEvent()  ← traffic-generator.ts      │   │
│  │       - Faker.js로 src/dst 도시, IP, 프로토콜, 포트 생성  │   │
│  │       - 15% 확률로 위협 이벤트 (threat_level 1-5)          │   │
│  │    2. id = crypto.randomUUID()                             │   │
│  │    3. created_at = new Date().toISOString()                │   │
│  │    4. buffer.push(event)  → EventBuffer에 적재             │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  EventBuffer<TrafficEvent>                                 │   │
│  │  (FLUSH_INTERVAL_MS=500ms)                                 │   │
│  │                                                             │   │
│  │  내부 버퍼: T[] = []                                       │   │
│  │                                                             │   │
│  │  매 500ms마다 flush():                                     │   │
│  │    1. 버퍼가 비어있으면 skip                                │   │
│  │    2. const batch = this.buffer                             │   │
│  │    3. this.buffer = [] (비우기)                              │   │
│  │    4. onFlush(batch)  → flushPending 콜백 호출             │   │
│  │                                                             │   │
│  │  결과: 300ms 간격 생성 × 500ms 플러시                       │   │
│  │        → 플러시당 ~1.67개 이벤트                            │   │
│  │        → 초당 ~2회 React 상태 업데이트                      │   │
│  │        → 초당 ~3.3개 이벤트 생성                            │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  정리 (useEffect cleanup):                                       │
│    clearInterval(생성 루프)                                       │
│    buffer.stop()  → clearInterval + 잔여 flush                   │
│    bufferRef.current = null                                       │
└─────────────────────────────────────────────────────────────────┘
```

### EventBuffer 클래스 설계

```typescript
// lib/event-buffer.ts
export class EventBuffer<T> {
  private buffer: T[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private onFlush: (batch: T[]) => void,
    private intervalMs: number = 300
  )

  push(item: T)       // 버퍼에 아이템 추가
  flush()             // 버퍼를 비우고 onFlush 콜백 호출 (비어있으면 skip)
  start()             // setInterval로 주기적 flush 시작
  stop()              // clearInterval + 잔여 flush
  get pending()       // 현재 버퍼 크기 조회
}
```

주요 설계 포인트:
- **제네릭 타입**: `EventBuffer<T>`로 TrafficEvent 외 다른 타입에도 재사용 가능
- **배치 처리**: 개별 이벤트를 모아 한 번에 플러시하여 React 상태 업데이트 횟수 최소화
- **정리 보장**: `stop()` 호출 시 잔여 버퍼를 마지막으로 플러시한 뒤 타이머 정리
- **멱등성**: `start()`를 중복 호출해도 타이머가 이중 생성되지 않음

### 연결 수명 주기

```
1. DashboardPage 마운트
   │
   ├── BootSequence 표시 (부팅 애니메이션)
   │
   └── useTrafficStream() useEffect 실행
       ├── setIsConnected(true)  ← 즉시 "CONNECTED" 상태
       ├── EventBuffer 생성 (FLUSH_INTERVAL_MS=500)
       ├── buffer.start()        ← 주기적 플러시 시작
       └── setInterval(generateTrafficEvent, 300ms) ← 이벤트 생성 시작

2. 데이터 생성 중 (지속)
   │
   ├── 300ms마다: generateTrafficEvent → buffer.push(event)
   └── 500ms마다: buffer.flush() → flushPending(batch) → setState

3. BootSequence 완료 (~2.8초 후)
   │
   └── setBooted(true) → 대시보드 패널 진입 애니메이션 시작

4. 컴포넌트 언마운트
   │
   ├── clearInterval(생성 루프)
   ├── buffer.stop() → clearInterval + 잔여 flush
   └── bufferRef.current = null
```

---

## 8. 렌더링 전략

### 서버/클라이언트 컴포넌트 분리

```
서버 컴포넌트 (Server Component)
├── app/layout.tsx
│   - 메타데이터 (title, description, icons) 정적 생성
│   - JetBrains Mono 폰트 최적화 (next/font/google)
│   - HTML 구조 + Providers 래핑
│
클라이언트 컴포넌트 ("use client")
├── app/providers.tsx        ← 클라이언트 경계 시작점
├── app/page.tsx             ← 전체 대시보드 (실시간 상태 필요)
├── components/dashboard/*   ← 모든 대시보드 컴포넌트 (React.memo 적용)
├── components/effects/*     ← Canvas/DOM 조작 필요
├── components/ui/*          ← 클라이언트 이벤트 핸들링
└── hooks/*                  ← useState, useEffect 사용
```

### Dynamic Import 전략

```typescript
// page.tsx - SSR 불가능한 컴포넌트의 지연 로딩

// 1. MatrixRain: Canvas API 필요 (서버에 canvas 없음)
const MatrixRain = dynamic(
  () => import("@/components/effects/MatrixRain"),
  { ssr: false }
);

// 2. GlobeSection: Three.js + WebGL 필요 (서버에 GPU 없음)
const GlobeSection = dynamic(
  () => import("@/components/dashboard/GlobeSection"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-matrix-green/50 text-sm animate-pulse tracking-widest">
          LOADING GLOBE...
        </div>
      </div>
    ),
  }
);

// GlobeSection 내부에서도 이중 dynamic import
// components/dashboard/GlobeSection.tsx
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
```

### 렌더링 타임라인

```
서버 (빌드/요청 시)                    클라이언트 (브라우저)
───────────────────                    ───────────────────

1. layout.tsx 렌더
   - 메타데이터 생성
   - 폰트 프리로드 링크
   - HTML 셸 전송           ────────▶  2. HTML 수신, CSS 적용

                                       3. JS 번들 로드 + hydration

                                       4. DashboardPage 마운트
                                          ├── BootSequence 표시 (부팅 애니메이션)
                                          ├── MatrixRain 지연 로드
                                          ├── GlobeSection 지연 로드
                                          │   └── "LOADING GLOBE..." 표시
                                          └── useTrafficStream 시작
                                              ├── setIsConnected(true)
                                              ├── EventBuffer 생성 + start()
                                              └── setInterval(generateTrafficEvent, 300ms)

                                       5. 데이터 생성 시작 (~0초)
                                          └── 500ms 후 첫 배치 플러시 → 상태 업데이트

                                       6. BootSequence 완료 (~2.8초)
                                          ├── setBooted(true)
                                          ├── motion panelVariants 진입 애니메이션
                                          │   (delay: 0s, 0.15s, 0.3s, 0.45s)
                                          ├── 차트 그리기
                                          ├── 지구본 아크/링 표시
                                          └── 로그 엔트리 CSS 애니메이션

                                       7. 지속적 데이터 생성 (무한)
                                          ├── 300ms마다 이벤트 생성
                                          ├── 500ms마다 배치 플러시
                                          └── 초당 ~2회 React 상태 업데이트
```

---

## 9. 스타일링 시스템

### Tailwind CSS 4 구성

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* 사이버펑크 색상 팔레트 (12종) */
  --color-cyber-bg:         #0a0a0f;        /* 최상위 배경 (거의 검정) */
  --color-cyber-bg-light:   #12121a;        /* 밝은 배경 */
  --color-cyber-panel:      rgba(0,0,0,0.7); /* 패널 배경 (반투명) */
  --color-matrix-green:     #00ff41;        /* 주 색상: 매트릭스 녹색 */
  --color-matrix-green-dim: #00cc33;        /* 어두운 녹색 */
  --color-cyber-cyan:       #00d4ff;        /* 보조 색상: 시안 */
  --color-cyber-blue:       #0066ff;        /* 블루 */
  --color-threat-red:       #ff0040;        /* 위협: 빨강 */
  --color-threat-orange:    #ff6600;        /* 위협: 주황 */
  --color-threat-yellow:    #ffcc00;        /* 위협: 노랑 */
  --color-neon-purple:      #bf00ff;        /* 네온 퍼플 */

  /* 모노스페이스 폰트 스택 */
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code",
               ui-monospace, SFMono-Regular, monospace;
}
```

### 글로벌 UX 설정

```css
html, body {
  user-select: none;     /* 전역 텍스트 선택 비활성화 */
  cursor: default;       /* 기본 커서를 default로 설정 */
}

.globe-grab canvas {
  cursor: grab !important;    /* 지구본 캔버스는 grab 커서 */
}

.globe-grab canvas:active {
  cursor: grabbing !important; /* 드래그 중 grabbing 커서 */
}

button {
  cursor: pointer;       /* 버튼은 pointer 커서 (MobileNav 등) */
}
```

### 색상 체계

```
  시맨틱 용도                    색상         사용처
  ─────────────────────────────────────────────────────
  기본 텍스트/보더/글로우        #00ff41      매트릭스 녹색 (주 색상)
  보조 강조/하이라이트           #00d4ff      시안 (대역폭, dst, 대기 효과)
  프로토콜 강조                  #0066ff      블루
  위협 높음 (4-5)               #ff0040      빨간색 (위협 패널, 아크)
  위협 중간 (3)                 #ff6600      주황색
  위협 낮음 (1-2)               #ffcc00      노란색
  패킷 크기                     #bf00ff      퍼플
  배경                          #0a0a0f      거의 검정
  패널 배경                     rgba(0,0,0,0.7)  반투명 검정
```

### 커스텀 CSS 유틸리티 클래스

| 클래스 | 설명 | 적용 대상 |
|--------|------|----------|
| `neon-glow-green` | 녹색 box-shadow 3단계 (5/10/20px) | CyberPanel (green), LogTerminal |
| `neon-glow-cyan` | 시안 box-shadow 3단계 | CyberPanel (cyan) |
| `neon-glow-red` | 빨간 box-shadow 3단계 | CyberPanel (red) |
| `text-glow-green` | 녹색 text-shadow 2단계 (7/14px) | 카운터, 시계, 타이틀 |
| `text-glow-cyan` | 시안 text-shadow | 시계, 대역폭 값 |
| `text-glow-red` | 빨간 text-shadow | 위협 배지 |
| `cyber-border-pulse` | borderPulse 3초 무한 애니메이션 | CyberPanel (pulse=true) |
| `scanline-effect` | ::after 스캔라인 4초 수직 이동 | CyberPanel 내부 오버레이 |
| `fade-slide-in` | fadeSlideIn 0.6초 페이드+슬라이드 | 패널 진입 애니메이션 |
| `log-entry-appear` | logEntryAppear 0.3초 opacity+translateY | LogTerminal 로그 엔트리 |
| `globe-vignette` | radial-gradient 비네트 오버레이 | GlobeSection 지구본 위 |
| `globe-grab` | canvas cursor: grab/grabbing | GlobeSection 컨테이너 |

### 애니메이션 키프레임

```
glitch1/glitch2:     clip-path + translate 글리치 (GlitchText)
borderPulse:         보더 색상/그림자 맥동 (CyberPanel)
scanline:            수직 스캔라인 이동 (CyberPanel)
fadeSlideIn:         opacity 0→1, translateY 20px→0 (패널 진입)
logEntryAppear:      opacity 0→1, translateY -6px→0 (로그 엔트리)
```

### 반응형 디자인

```css
/* 데스크톱 (lg 이상) */
grid-cols-[280px_1fr_300px]    /* 3열: 스탯 | 글로브 | 위협 */

/* 모바일/태블릿 (lg 미만) */
hidden lg:grid                  /* 3열 그리드 숨김 */
lg:hidden                       /* MobileNav 표시 (탭 내비게이션) */
hidden md:flex                  /* 헤더 버전/모드 배지 숨김 */
hidden lg:inline                /* 로그 라우트 정보 숨김 */
hidden lg:flex                  /* 헤더 이벤트 카운트 숨김 */
```

---

## 10. 주요 설계 결정

### 10.1 전체 "use client" 대시보드

**결정**: 메인 페이지(page.tsx)를 포함한 모든 대시보드 컴포넌트를 "use client"로 선언한다.

**근거**:
- 클라이언트 사이드 데이터 생성(useTrafficStream)이 최상위에서 필요
- 모든 차트/애니메이션이 브라우저 API(Canvas, WebGL, requestAnimationFrame) 의존
- 서버 컴포넌트로 분리할 수 있는 순수 표현 컴포넌트가 거의 없음
- layout.tsx만 서버 컴포넌트로 유지하여 메타데이터/폰트 최적화 확보

**트레이드오프**: 초기 JS 번들 크기 증가, 대신 구현 단순성과 상태 공유 용이성 확보

### 10.2 클라이언트 사이드 데이터 생성 (서버리스)

**결정**: 외부 서버나 데이터베이스 없이 클라이언트에서 Faker.js로 직접 트래픽 데이터를 생성한다.

**근거**:
- 데모/시각화 목적의 대시보드로, 실제 네트워크 데이터가 불필요
- 서버 의존성 제거로 배포/운영 복잡성 대폭 감소
- 환경 변수 설정 없이 `npm run dev` 만으로 즉시 실행 가능
- 네트워크 지연 없이 안정적인 데이터 스트림 보장
- 오프라인 환경에서도 완전한 기능 동작

**트레이드오프**: 여러 클라이언트 간 데이터 공유 불가, 브라우저에서 Faker.js 번들 포함

### 10.3 EventBuffer를 통한 배치 처리

**결정**: 개별 이벤트 생성(300ms 간격)과 React 상태 업데이트(500ms 간격)를 분리하여 EventBuffer로 배치 처리한다.

**근거**:
- 300ms마다 직접 `setState`하면 초당 ~3.3회 리렌더 발생
- EventBuffer로 배치 처리하면 초당 ~2회로 감소 (40% 절감)
- 이벤트 생성 주기와 UI 업데이트 주기를 독립적으로 조절 가능
- 이벤트 폭주 시에도 UI 업데이트 빈도가 일정하게 유지됨

### 10.4 Globe의 이중 Dynamic Import

**결정**: page.tsx에서 GlobeSection을 dynamic import하고, GlobeSection 내부에서도 react-globe.gl를 한 번 더 dynamic import한다.

```
page.tsx ──dynamic──▶ GlobeSection.tsx ──dynamic──▶ react-globe.gl
  (ssr: false)                            (ssr: false)
```

**근거**:
- Three.js는 `window`, `document`, `WebGLRenderingContext` 등 브라우저 전용 API에 의존
- Next.js 정적 프리렌더링(빌드 시) 단계에서 서버 환경에는 이 API가 없어 빌드 실패
- 이중 dynamic import로 Three.js 코드가 브라우저에서만 로드되도록 보장
- 로딩 중 "LOADING GLOBE..." 플레이스홀더로 UX 유지

### 10.5 Three.js Webpack Alias 설정

**결정**: next.config.ts에서 Three.js 모듈 경로를 수동으로 webpack alias로 지정한다.

```typescript
config.resolve.alias = {
  three$:          ".../three/build/three.module.js",
  "three/webgpu$": ".../three/build/three.webgpu.js",
  "three/tsl$":    ".../three/build/three.tsl.js",
  "three/addons":  ".../three/examples/jsm",
};
```

**근거**:
- three.js 0.180.0에서 모듈 구조가 변경됨
- three-globe / react-globe.gl이 `three/webgpu`, `three/tsl` 등을 import하나 번들러가 자동 해석 못함
- 명시적 alias로 모듈 해석 오류 방지
- `transpilePackages`에 `react-globe.gl`, `globe.gl`, `three-globe` 포함하여 ESM 트랜스파일

### 10.6 외부 상태 관리 라이브러리 미사용

**결정**: Redux, Zustand 등 외부 상태 관리 없이 React 내장 Hook만 사용한다.

**근거**:
- 단일 페이지, 단일 데이터 소스(클라이언트 사이드 생성)
- 상태 트리가 얕음: events, threats, isConnected, totalCount + 파생 stats
- useState + useCallback + useMemo + useStableRef 조합으로 충분한 성능
- Providers.tsx를 확장 지점으로 남겨두어 향후 필요시 추가 가능

### 10.7 BootSequence 부팅 애니메이션

**결정**: 대시보드 진입 전 사이버펑크 테마의 부팅 시퀀스를 표시한다.

**근거**:
- 사이버펑크/해킹 테마에 몰입감을 높이는 UX 요소
- Globe, MatrixRain 등 무거운 컴포넌트 로딩 시간을 자연스럽게 가림
- ~2.8초의 짧은 부팅 시간으로 사용자 경험을 해치지 않음
- `booted` 상태와 motion panelVariants로 패널 순차 진입 애니메이션 구현

---

## 11. 성능 최적화

### 11.1 React.memo로 리렌더링 최소화

| 컴포넌트 | memo 적용 | 효과 |
|----------|-----------|------|
| Header | memo(Header) | isConnected/totalCount 변경 시에만 리렌더 |
| GlobeSection | memo(GlobeSection) | events 참조 변경 시에만 리렌더 |
| StatsPanel | memo(StatsPanel) | stats 참조 변경 시에만 리렌더 |
| ThreatPanel | memo(ThreatPanel) | threats/stats 참조 변경 시에만 리렌더 |
| LogTerminal | memo(LogTerminal) | events 참조 변경 시에만 리렌더 |

### 11.2 useStableRef로 구조적 비교

```typescript
// useTrafficStats.ts
function useStableRef<T>(value: T, isEqual: (a: T, b: T) => boolean): T {
  const ref = useRef(value);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

// 적용: protocolDistribution, countryDistribution, threatsByType, bandwidthHistory
// → useMemo가 새 객체를 반환해도, 내용이 동일하면 이전 참조를 유지
// → memo()로 감싼 하위 컴포넌트가 불필요하게 리렌더되지 않음
```

### 11.3 EventBuffer 배치 처리

```
이벤트 생성: 300ms 간격 (초당 ~3.3개)
버퍼 플러시: 500ms 간격 (초당 ~2회)

배치 처리 없을 때: 초당 ~3.3회 setState → 리렌더
배치 처리 적용 시: 초당 ~2회 setState → 리렌더 (약 40% 감소)
```

### 11.4 렌더링 최적화 기법

| 기법 | 적용 위치 | 효과 |
|------|----------|------|
| `useMemo` | useTrafficStats, GlobeSection, StatsPanel(protocolData, chart options, topCountries), ThreatPanel(gaugeOption, threatTypeEntries), LogTerminal(visibleEvents), page.tsx(globe) | 불필요한 재계산/재생성 방지 |
| `useCallback` | useTrafficStream(flushPending), page.tsx(handleBootComplete), GlobeSection(handleGlobeReady) | 핸들러 참조 안정성 |
| `lazyUpdate: true` | StatsPanel, ThreatPanel의 ReactECharts | ECharts 내부 diff 최소화 |
| Dynamic Import | MatrixRain, GlobeSection | 초기 로딩 코드 분할 |
| CSS animation | LogTerminal(.log-entry-appear) | AnimatePresence 대신 CSS로 진입 애니메이션, JS 오버헤드 제거 |
| `AnimatePresence mode="sync"` | ThreatPanel | 리스트 변경 시 height:0→auto 애니메이션 제거, 최소 리플로우 |

### 11.5 데이터 제한

```
상수                    값      목적
──────────────────────────────────────────
ROLLING_WINDOW         100     메모리 내 최대 이벤트 수
MAX_THREAT_ENTRIES     20      위협 피드 최대 엔트리
MAX_ARCS               20      지구본 동시 아크 수
MAX_RINGS              15      지구본 동시 링 수 (GlobeSection 내부)
MAX_LOG_ENTRIES        30      로그 화면 표시 수
ARC_TTL_MS             6000    아크 수명 (6초 후 제거)
RING_TTL_MS            3000    링 수명 (3초 후 제거)
GENERATION_INTERVAL_MS 300     이벤트 생성 주기
FLUSH_INTERVAL_MS      500     버퍼 플러시 주기
BANDWIDTH_BUCKET_COUNT 10      대역폭 차트 버킷 수
BANDWIDTH_WINDOW_SEC   30      대역폭 차트 시간 윈도우
BANDWIDTH_BUCKET_SEC   3       대역폭 버킷당 초
protocolData           6       파이 차트 상위 표시 수
topCountries           5       국가 바 차트 상위 표시 수
threatTypeEntries      5       위협 유형 리스트 상위 표시 수
threats display        10      위협 피드 화면 표시 수
```

### 11.6 3D 렌더링 최적화

```
기법                           설명
────────────────────────────────────────────────
pointsMerge: true             포인트 메시 병합 (draw call 감소)
pointsTransitionDuration: 0   포인트 전환 애니메이션 비활성화
arcsTransitionDuration: 0     아크 전환 애니메이션 비활성화
arcAltitudeAutoScale: 0.45    아크 높이 자동 스케일 (성능/가시성 균형)
atmosphereColor: #00d4ff      시안 대기 효과 (사이버 테마)
atmosphereAltitude: 0.25      대기 효과 고도
autoRotateSpeed: 0.8          느린 자동 회전 (GPU 부하 최소화)
ResizeObserver                 window resize 대신 컨테이너 크기 추적
enablePointerInteraction: false  포인트 hover 비활성화 (레이캐스팅 제거)
pointsData 2초 스로틀         POINTS_THROTTLE_MS=2000, 빈번한 재계산 방지
Arc/Ring TTL + 1초 cleanup    만료된 arc/ring 자동 제거, ID Set 동기화
emissive glow + point light   globe material 커스텀 (onGlobeReady)
globe-vignette                 CSS radial-gradient 오버레이 (엣지 페이드)
```

### 11.7 Canvas 최적화 (MatrixRain)

```
기법                           설명
────────────────────────────────────────────────
반투명 필킷                    fillRect("rgba(10,10,15,0.05)") - 잔상 효과 + clear 비용 절감
조건부 리셋                    Math.random() > 0.975 일 때만 드랍 리셋
opacity: 15%                   CSS 레벨 투명도로 GPU 합성 최적화
OffscreenCanvas Worker         matrix-rain.worker.ts (선택적 최적화)
  - 메인 스레드에서 Canvas 분리 가능
  - transferControlToOffscreen() → Worker로 전달
  - 메인 스레드 차트/애니메이션 성능 보호
```

### 11.8 AnimatedCounter 최적화

```typescript
// requestAnimationFrame 기반 숫자 카운팅 애니메이션
// DOM 직접 조작 (ref.current.textContent) → React 리렌더 없음
const duration = 400;
const eased = 1 - Math.pow(1 - progress, 3);  // easeOutCubic
el.textContent = current.toLocaleString();

// 정리: cancelAnimationFrame(frameId) — RAF 누수 방지
```

### 11.9 LogTerminal formatTime 캐시

```typescript
// 모듈 레벨 캐시 (컴포넌트 생명주기와 독립)
const timeCache = new Map<string, string>();
const TIME_CACHE_MAX = 200;

// 동일 created_at 문자열에 대해 Date 파싱 + toLocaleTimeString 재계산 방지
// 최대 200개 엔트리 유지, 초과 시 가장 오래된 엔트리 제거 (FIFO)
```

---

## 12. 의존성 관리

### 프로덕션 의존성

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| `next` | ^15.1.0 | 프레임워크 (App Router) | Turbopack dev 모드 |
| `react` / `react-dom` | ^19.0.0 | UI 라이브러리 | React 19 (최신) |
| `three` | ^0.180.0 | 3D 렌더링 엔진 | react-globe.gl 호환 버전 고정 |
| `react-globe.gl` | ^2.32.0 | 3D 지구본 컴포넌트 | three-globe 래퍼 |
| `echarts` | ^5.5.0 | 차트 라이브러리 | pie, line, gauge |
| `echarts-for-react` | ^3.0.2 | ECharts React 바인딩 | lazyUpdate 지원 |
| `motion` | ^12.0.0 | 애니메이션 라이브러리 | framer-motion v12, AnimatePresence |
| `gsap` | ^3.13.0 | 애니메이션 엔진 | (설치됨, 직접 사용 없음) |
| `@gsap/react` | ^2.1.0 | GSAP React 바인딩 | (설치됨, 직접 사용 없음) |
| `@faker-js/faker` | ^10.0.0 | 가짜 데이터 생성 | 클라이언트 사이드에서 직접 사용 |

### 개발 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `typescript` | ^5.7.0 | 타입 시스템 (strict mode) |
| `tailwindcss` | ^4.0.0 | CSS 프레임워크 (v4, PostCSS 플러그인 방식) |
| `@tailwindcss/postcss` | ^4.0.0 | Tailwind CSS 4 PostCSS 플러그인 |
| `@types/node` | ^22.0.0 | Node.js 타입 |
| `@types/react` | ^19.0.0 | React 19 타입 |
| `@types/react-dom` | ^19.0.0 | React DOM 19 타입 |
| `@types/three` | ^0.180.0 | Three.js 타입 (three와 동일 버전) |
| `eslint` | ^9.0.0 | 린터 |
| `@eslint/eslintrc` | ^3.0.0 | ESLint 설정 유틸 |
| `eslint-config-next` | ^15.1.0 | Next.js ESLint 설정 |
| `vitest` | ^4.0.18 | 테스트 러너 |
| `@vitejs/plugin-react` | ^5.1.4 | Vitest React 플러그인 |
| `@testing-library/react` | ^16.3.2 | 컴포넌트 테스트 |
| `@testing-library/jest-dom` | ^6.9.1 | DOM matcher 확장 |
| `@testing-library/user-event` | ^14.6.1 | 사용자 이벤트 시뮬레이션 |
| `jsdom` | ^28.1.0 | 브라우저 환경 시뮬레이션 |
| `tsx` | ^4.0.0 | TypeScript 실행 런타임 |

### 의존성 호환성 매트릭스

```
three@0.180.0 ←──── 반드시 이 버전 ────── three-globe/react-globe.gl 호환성
     │
     ├── three/build/three.module.js      ← webpack alias "three$"
     ├── three/build/three.webgpu.js      ← webpack alias "three/webgpu$"
     ├── three/build/three.tsl.js         ← webpack alias "three/tsl$"
     └── three/examples/jsm              ← webpack alias "three/addons"

react@19 ← motion@12 (framer-motion v12, React 19 호환)
         ← echarts-for-react@3 (React 19 호환)
         ← react-globe.gl@2.32 (React 19 호환)

next@15 ← @tailwindcss/postcss@4 (Tailwind CSS 4 방식)
        ← eslint-config-next@15
```

### 스크립트

```json
{
  "dev":           "next dev --turbopack",        // Turbopack 개발 서버
  "build":         "next build",                   // 프로덕션 빌드
  "start":         "next start",                   // 프로덕션 서버 시작
  "lint":          "next lint",                    // ESLint 실행
  "test":          "vitest run",                   // 전체 테스트 실행 (112개)
  "test:watch":    "vitest",                       // 워치 모드
  "test:coverage": "vitest run --coverage"         // 커버리지 리포트
}
```

### 환경 변수

환경 변수 설정 불필요 — 프로젝트는 외부 서비스 연결 없이 독립 실행된다.

```bash
# 개발 서버 즉시 실행 가능
npm run dev
```

---

> 이 문서는 Traffic Sight v0.1.0 코드베이스 기준으로 작성되었다.
> 마지막 업데이트: 2026-02-22
