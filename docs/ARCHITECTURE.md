# Traffic Sight - 아키텍처 문서

> 사이버펑크 테마의 실시간 네트워크 트래픽 대시보드
> Next.js 15 | React 19 | Supabase Realtime | Three.js | ECharts

---

## 목차

1. [시스템 개요](#1-시스템-개요)
2. [아키텍처 다이어그램](#2-아키텍처-다이어그램)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [데이터 흐름](#4-데이터-흐름)
5. [컴포넌트 계층](#5-컴포넌트-계층)
6. [상태 관리](#6-상태-관리)
7. [실시간 통신](#7-실시간-통신)
8. [렌더링 전략](#8-렌더링-전략)
9. [스타일링 시스템](#9-스타일링-시스템)
10. [주요 설계 결정](#10-주요-설계-결정)
11. [성능 최적화](#11-성능-최적화)
12. [의존성 관리](#12-의존성-관리)

---

## 1. 시스템 개요

Traffic Sight는 전 세계 네트워크 트래픽을 실시간으로 모니터링하고 시각화하는 사이버펑크 테마의 대시보드 애플리케이션이다. Supabase Realtime을 통해 트래픽 이벤트를 실시간으로 수신하며, 3D 지구본(react-globe.gl) 위에 트래픽 아크를 렌더링하고, ECharts 차트와 모션 애니메이션 기반의 위협 피드를 통해 네트워크 상태를 종합적으로 표시한다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **3D 지구본 시각화** | react-globe.gl 기반, 출발지-도착지 간 트래픽 아크 표시 |
| **실시간 통계 패널** | 프로토콜 분포(파이), 대역폭 추이(라인), 상위 국가(바) |
| **위협 탐지 피드** | 게이지 차트 + AnimatePresence 기반 실시간 위협 목록 |
| **로그 터미널** | 매트릭스 스타일 녹색 로그 엔트리, 터미널 UI |
| **시각 이펙트** | 캔버스 매트릭스 레인, CSS 글리치 텍스트, 네온 글로우 |

### 기술 스택

| 계층 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router, Turbopack) |
| UI 라이브러리 | React 19 |
| 3D 렌더링 | Three.js 0.180.0, react-globe.gl 2.32.0 |
| 차트 | ECharts 5.5.0 (echarts-for-react) |
| 애니메이션 | Motion (framer-motion) v12, GSAP 3.13.0 |
| 백엔드/DB | Supabase (PostgreSQL + Realtime) |
| 스타일링 | Tailwind CSS 4 (PostCSS 플러그인) |
| 타입 시스템 | TypeScript 5.7 (strict mode) |
| 폰트 | JetBrains Mono (next/font/google) |

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
│  │  │              DashboardPage ("use client")             │    │   │
│  │  │                                                        │    │   │
│  │  │  ┌─ Hooks ───────────────────────────────────────┐    │    │   │
│  │  │  │  useTrafficStream  ←── Supabase Realtime      │    │    │   │
│  │  │  │  useTrafficStats   ←── useMemo(events)        │    │    │   │
│  │  │  └───────────────────────────────────────────────┘    │    │   │
│  │  │                        │                               │    │   │
│  │  │          ┌─────────────┼─────────────┐                │    │   │
│  │  │          ▼             ▼             ▼                │    │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐         │    │   │
│  │  │  │  Stats   │ │  Globe   │ │   Threat     │         │    │   │
│  │  │  │  Panel   │ │ Section  │ │   Panel      │         │    │   │
│  │  │  │(ECharts) │ │(Three.js)│ │(ECharts+     │         │    │   │
│  │  │  │          │ │          │ │ Motion)      │         │    │   │
│  │  │  └──────────┘ └──────────┘ └──────────────┘         │    │   │
│  │  │          │                                            │    │   │
│  │  │          ▼                                            │    │   │
│  │  │  ┌───────────────────────────────────┐               │    │   │
│  │  │  │       LogTerminal (Motion)        │               │    │   │
│  │  │  └───────────────────────────────────┘               │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐                          │   │
│  │  │ MatrixRain   │  │ GlitchText   │  ← 배경 이펙트 레이어   │   │
│  │  │ (Canvas 2D)  │  │ (CSS+JS)     │                          │   │
│  │  └──────────────┘  └──────────────┘                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
           │                                        ▲
           │  Supabase Realtime (WebSocket)          │
           ▼                                        │
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                     │
│                                                                     │
│  ┌───────────────────┐     ┌──────────────────────────────┐        │
│  │  PostgreSQL DB    │     │  Realtime Engine             │        │
│  │                   │────▶│  (postgres_changes)          │        │
│  │  traffic_events   │     │  event: INSERT               │        │
│  │  - id (UUID)      │     │  schema: public              │        │
│  │  - src_ip/dst_ip  │     │  table: traffic_events       │        │
│  │  - coordinates    │     └──────────────────────────────┘        │
│  │  - protocol/port  │                                              │
│  │  - threat_level   │                                              │
│  │  - packet_size    │     ┌──────────────────────────────┐        │
│  └───────────────────┘     │  generate-traffic.ts         │        │
│           ▲                │  (Faker.js, 2-5 events/sec)  │        │
│           │                │  15% threat probability       │        │
│           └────────────────│  32 cities worldwide          │        │
│                            └──────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### 대시보드 레이아웃 구조

```
┌──────────────────────────────────────────────────────────────┐
│  Header (GlitchText + Clock + Connection Status)     z:20   │
├───────────┬────────────────────────────┬─────────────────────┤
│           │                            │                     │
│  Stats    │      GlobeSection          │    ThreatPanel      │
│  Panel    │      (3D Globe)            │    (Gauge +         │
│  280px    │      flex: 1               │     Feed)           │
│           │                            │    300px            │
│  - 개요   │   ┌──────────────────┐     │                     │
│  - 프로토콜│   │  react-globe.gl  │     │  - 위협 레벨       │
│  - 대역폭 │   │  + arcs/points   │     │  - 위협 유형       │
│  - 상위국가│   └──────────────────┘     │  - 실시간 피드     │
│           │                            │                     │
├───────────┴────────────────────────────┴─────────────────────┤
│  LogTerminal (200px)                                  z:10   │
│  [22:15:30] 192.168.1.1 → 10.0.0.1 HTTPS :443 [2.1KB]     │
│  [22:15:29] 172.16.0.5 → 203.0.113.1 SSH :22 [512B]       │
│  root@traffic-sight:~$ █                                     │
└──────────────────────────────────────────────────────────────┘

  ← 배경: MatrixRain (Canvas, z:0, opacity:15%) →
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
│   │                             #   - CSS Grid 3단 레이아웃 구성
│   ├── globals.css               # 전역 스타일
│   │                             #   - Tailwind CSS 4 @import "tailwindcss"
│   │                             #   - @theme 블록: 사이버펑크 색상 변수 12종
│   │                             #   - 네온 글로우 유틸리티 (green/cyan/red)
│   │                             #   - 애니메이션: borderPulse, scanline, glitch1/2, fadeSlideIn
│   │                             #   - 스크롤바/선택 영역 커스터마이징
│   └── providers.tsx             # Provider 래퍼 (현재 패스스루, 확장 지점)
│
├── components/
│   ├── dashboard/                # 대시보드 핵심 컴포넌트
│   │   ├── Header.tsx            # 상단 헤더
│   │   │                         #   - GlitchText 로 타이틀 렌더링
│   │   │                         #   - 1초 간격 시계 (setInterval)
│   │   │                         #   - 연결 상태 표시등 (green/red dot)
│   │   │                         #   - 이벤트 총 카운트
│   │   ├── GlobeSection.tsx      # 3D 지구본
│   │   │                         #   - react-globe.gl (double dynamic import)
│   │   │                         #   - 자동 회전 (autoRotate: 0.5)
│   │   │                         #   - arcsData: MAX_ARCS(30)개 제한, 위협은 빨간색
│   │   │                         #   - pointsData: 도시 마커 (src=green/red, dst=cyan)
│   │   ├── StatsPanel.tsx        # 왼쪽 통계 패널
│   │   │                         #   - AnimatedCounter: requestAnimationFrame 카운터
│   │   │                         #   - 프로토콜 도넛 차트 (ECharts pie, 상위 6개)
│   │   │                         #   - 대역폭 추이 라인 차트 (ECharts line)
│   │   │                         #   - 상위 소스 국가 바 차트 (CSS 기반, 상위 5개)
│   │   ├── ThreatPanel.tsx       # 오른쪽 위협 패널
│   │   │                         #   - 위협 게이지 (ECharts gauge, 0-100%)
│   │   │                         #   - 위협 유형별 분포 (상위 5개)
│   │   │                         #   - AnimatePresence 실시간 위협 피드 (최대 10개)
│   │   │                         #   - ThreatBadge: LOW/MEDIUM/HIGH/CRITICAL/SEVERE
│   │   └── LogTerminal.tsx       # 하단 로그 터미널
│   │                             #   - 터미널 UI (3색 닫기 버튼, 프롬프트)
│   │                             #   - AnimatePresence 로그 엔트리 애니메이션
│   │                             #   - 위협 이벤트 좌측 빨간 보더 강조
│   │                             #   - 자동 스크롤 (scrollTop = 0, 최신 상단)
│   │
│   ├── effects/                  # 시각 이펙트 컴포넌트
│   │   ├── MatrixRain.tsx        # 매트릭스 비 효과
│   │   │                         #   - Canvas 2D, requestAnimationFrame 루프
│   │   │                         #   - 카타카나 + 숫자 + 영문 문자셋
│   │   │                         #   - fixed position, z:0, opacity:15%
│   │   │                         #   - 리사이즈 대응 (window resize listener)
│   │   └── GlitchText.tsx        # 글리치 텍스트 효과
│   │                             #   - JS: 2-4초 간격 랜덤 문자 치환 (2-4글자)
│   │                             #   - CSS: glitch1/2 키프레임 레이어 (cyan/red)
│   │                             #   - clip-path + translate 기반 글리치
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
│   ├── useTrafficStream.ts       # 실시간 트래픽 구독
│   │                             #   - Supabase postgres_changes 구독
│   │                             #   - 초기 데이터 fetch (최근 50건)
│   │                             #   - 롤링 윈도우: events(50), threats(20)
│   │                             #   - 연결 상태 추적 (isConnected)
│   │                             #   - totalCount 누적 카운터
│   └── useTrafficStats.ts        # 파생 통계 계산
│                                 #   - useMemo 기반 (events, threats 의존)
│                                 #   - 프로토콜/국가 분포 집계
│                                 #   - 대역폭 히스토리 (10개 버킷)
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
│   ├── supabase/
│   │   ├── client.ts             # Supabase 브라우저 클라이언트
│   │   │                         #   - placeholder URL 폴백 (프리렌더링 대응)
│   │   │                         #   - eventsPerSecond: 10 설정
│   │   └── types.ts              # 타입 정의
│   │                             #   - TrafficEvent: 20개 필드
│   │                             #   - ArcData: 지구본 아크 데이터
│   │                             #   - Database: Supabase 제네릭 타입
│   └── constants.ts              # 상수 정의
│                                 #   - CITIES: 32개 도시 좌표
│                                 #   - PROTOCOLS: 10종 (TCP, UDP, ICMP, HTTP, ...)
│                                 #   - PROTOCOL_PORTS: 프로토콜-포트 매핑
│                                 #   - THREAT_TYPES: 10종 위협 유형
│                                 #   - 윈도우 크기: ROLLING_WINDOW=50, MAX_ARCS=30,
│                                 #     MAX_LOG_ENTRIES=50, MAX_THREAT_ENTRIES=20
│
├── scripts/                      # 스크립트
│   ├── generate-traffic.ts       # 트래픽 데이터 생성기
│   │                             #   - Faker.js 기반, SUPABASE_SERVICE_ROLE_KEY 사용
│   │                             #   - 1초 간격 배치 삽입 (2-5건)
│   │                             #   - 15% 위협 확률, threat_level 1-5
│   │                             #   - Ctrl+C 우아한 종료
│   └── schema.sql                # DB 스키마
│                                 #   - traffic_events 테이블
│                                 #   - idx_traffic_created_at (DESC)
│                                 #   - idx_traffic_threat (partial, threat_level > 0)
│                                 #   - Realtime 활성화 주석 안내
│
├── next.config.ts                # Next.js 설정
│                                 #   - transpilePackages: react-globe.gl, globe.gl, three-globe
│                                 #   - webpack alias: three, three/webgpu, three/tsl, three/addons
│                                 #   - 클라이언트 사이드 fallback: fs=false, path=false
├── postcss.config.mjs            # PostCSS: @tailwindcss/postcss 플러그인
├── tsconfig.json                 # TypeScript: strict, bundler resolution, @/* 경로 별칭
└── package.json                  # 의존성 및 스크립트 정의
```

---

## 4. 데이터 흐름

### 전체 데이터 파이프라인

```
[generate-traffic.ts]                [Supabase PostgreSQL]
       │                                     │
       │  INSERT (2-5건/초)                  │
       │  supabase.from("traffic_events")    │
       │  .insert(events)                    │
       └────────────────────────▶            │
                                             │
                                    ┌────────┴────────┐
                                    │  Realtime Engine │
                                    │  postgres_changes│
                                    │  event: INSERT   │
                                    └────────┬────────┘
                                             │
                                    WebSocket│(실시간 브로드캐스트)
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │    useTrafficStream()     │
                               │                          │
                               │  1. 초기: SELECT * FROM  │
                               │     traffic_events       │
                               │     LIMIT 50             │
                               │     ORDER BY created_at  │
                               │     DESC                 │
                               │                          │
                               │  2. 실시간: channel      │
                               │     .on("postgres_       │
                               │      changes", INSERT)   │
                               │                          │
                               │  출력:                   │
                               │   events[0..49]          │
                               │   threats[0..19]         │
                               │   isConnected            │
                               │   totalCount             │
                               └─────────┬────────────────┘
                                         │
                                         ▼
                               ┌──────────────────────────┐
                               │    useTrafficStats()      │
                               │    (useMemo)              │
                               │                          │
                               │  입력: events, threats   │
                               │                          │
                               │  계산:                   │
                               │   protocolDistribution   │
                               │   countryDistribution    │
                               │   bandwidthHistory[10]   │
                               │   threatsByType          │
                               │   avgThreatLevel         │
                               │   totalBandwidth         │
                               │   packetsPerSecond       │
                               └─────────┬────────────────┘
                                         │
                       ┌─────────────────┼─────────────────┐
                       ▼                 ▼                 ▼
               ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
               │  StatsPanel  │ │ GlobeSection │ │ ThreatPanel  │
               │              │ │              │ │              │
               │ stats ──────▶│ │ events ─────▶│ │ threats ────▶│
               │ pie/line/bar │ │ arcs/points  │ │ gauge/feed   │
               └──────────────┘ └──────────────┘ └──────────────┘
                                                        │
                                         ┌──────────────┘
                                         ▼
                                 ┌──────────────┐
                                 │ LogTerminal  │
                                 │              │
                                 │ events ─────▶│
                                 │ terminal log │
                                 └──────────────┘
```

### 이벤트 데이터 모델 (TrafficEvent)

```
TrafficEvent {
  id:               UUID        ← DB 자동 생성
  created_at:       TIMESTAMPTZ ← DB 자동 생성
  src_ip:           INET        ← Faker.js IPv4
  src_country_code: CHAR(2)     ← 32개 도시 중 랜덤 선택
  src_city:         VARCHAR     ← 도시명
  src_lat/src_lng:  FLOAT8      ← 위도/경도
  dst_ip:           INET        ← Faker.js IPv4 (src와 다른 도시)
  dst_country_code: CHAR(2)
  dst_city:         VARCHAR
  dst_lat/dst_lng:  FLOAT8
  protocol:         VARCHAR(10) ← TCP|UDP|ICMP|HTTP|HTTPS|DNS|SSH|FTP|SMTP|TLS
  port:             INTEGER     ← 프로토콜 기본 포트 또는 랜덤 (1024-65535)
  packet_size:      INTEGER     ← 64 ~ 65535 bytes
  threat_level:     SMALLINT    ← 0(정상) | 1-5(위협)
  threat_type:      VARCHAR(50) ← NULL 또는 위협 유형 10종 중 1
  status:           VARCHAR(20) ← "active" (기본)
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
  bandwidthHistory:      number[]        ← 10개 시간 버킷별 대역폭
  packetsPerSecond:      number          ← min(events.length, 5)
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
        │  - useTrafficStream() → { events, threats, isConnected, totalCount }
        │  - useTrafficStats(events, threats) → stats
        │
        ├── MatrixRain [dynamic, ssr: false]
        │     └── <canvas> (fixed, z:0, opacity:15%)
        │
        ├── Header
        │     ├── GlitchText (title: "TRAFFIC SIGHT")
        │     │     ├── <span> 문자별 glitch-char
        │     │     ├── <span> glitch1 레이어 (cyan)
        │     │     └── <span> glitch2 레이어 (red)
        │     ├── 버전 배지 "v2.0.4"
        │     ├── "REALTIME" 배지
        │     ├── 이벤트 카운트 표시
        │     ├── 디지털 시계 (1초 갱신)
        │     └── 연결 상태 (녹색/빨간 펄스 닷)
        │
        ├── <main> CSS Grid: grid-cols-[280px_1fr_300px]
        │   │
        │   ├── StatsPanel (left, 280px)
        │   │     ├── CyberPanel "OVERVIEW" (variant: green, pulse)
        │   │     │     ├── AnimatedCounter "Total Packets"
        │   │     │     ├── AnimatedCounter "Threats"
        │   │     │     ├── Bandwidth (formatBytes)
        │   │     │     └── Packets/sec
        │   │     ├── CyberPanel "PROTOCOLS" (variant: cyan)
        │   │     │     └── ReactECharts (pie, 도넛, 상위 6 프로토콜)
        │   │     ├── CyberPanel "BANDWIDTH" (variant: cyan)
        │   │     │     └── ReactECharts (line, area gradient)
        │   │     └── CyberPanel "TOP SOURCES" (variant: green)
        │   │           └── CSS 프로그레스 바 (상위 5개국)
        │   │
        │   ├── GlobeSection (center, flex: 1) [dynamic, ssr: false]
        │   │     ├── Globe (react-globe.gl)
        │   │     │     ├── arcsData (최대 30개, 위협=red, 정상=green)
        │   │     │     └── pointsData (도시 마커)
        │   │     └── <div> gradient overlay
        │   │
        │   └── ThreatPanel (right, 300px)
        │         ├── CyberPanel "THREAT LEVEL" (variant: red, pulse)
        │         │     └── ReactECharts (gauge, 0-100%)
        │         ├── CyberPanel "THREAT TYPES" (variant: red)
        │         │     └── 위협 유형 리스트 (상위 5개)
        │         └── CyberPanel "LIVE THREAT FEED" (variant: red)
        │               └── AnimatePresence (mode: popLayout)
        │                     └── motion.div (최대 10개 위협)
        │                           ├── 타임스탬프
        │                           ├── ThreatBadge (severity)
        │                           ├── threat_type
        │                           └── src/dst IP + city
        │
        └── LogTerminal (footer, 200px)
              ├── 터미널 헤더 (3색 닫기 버튼 + "Network Traffic Log")
              ├── AnimatePresence (mode: popLayout)
              │     └── motion.div (이벤트별 로그 라인)
              │           ├── [timestamp]
              │           ├── src_ip → dst_ip
              │           ├── protocol :port
              │           ├── [packet_size]
              │           ├── route (city, country → city, country)
              │           └── threat badge (조건부)
              └── 터미널 프롬프트 "root@traffic-sight:~$ █"
```

### 컴포넌트별 상태 소유권

| 컴포넌트 | 로컬 상태 | 외부 의존 |
|----------|----------|----------|
| DashboardPage | - | useTrafficStream, useTrafficStats |
| Header | time (1초 갱신) | isConnected, totalCount (props) |
| GlobeSection | mounted | events (props), globeRef |
| StatsPanel | - | stats (props) |
| ThreatPanel | - | threats, stats (props) |
| LogTerminal | - | events (props), scrollRef |
| MatrixRain | - | canvasRef, animationFrame |
| GlitchText | - | containerRef, glitch timeout |
| AnimatedCounter | prevValue (ref) | value (props) |

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
│  │  events:      TrafficEvent[]  (롤링 윈도우 50) │ │
│  │  threats:     TrafficEvent[]  (롤링 윈도우 20) │ │
│  │  isConnected: boolean                          │ │
│  │  totalCount:  number                           │ │
│  │                                                 │ │
│  └───────────────┬─────────────────────────────────┘ │
│                  │                                    │
│                  ▼                                    │
│  ┌──── useTrafficStats (파생 상태) ───────────────┐ │
│  │                                                 │ │
│  │  useMemo(events, threats) → TrafficStats       │ │
│  │  (매 events/threats 변경시 자동 재계산)         │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌──── 컴포넌트 로컬 상태 ─────────────────────┐    │
│  │                                               │    │
│  │  Header:        time (useState + setInterval) │    │
│  │  GlobeSection:  mounted (useState)            │    │
│  │  AnimatedCounter: prevValue (useRef)          │    │
│  │  GlitchText:    timeout (useRef)              │    │
│  │  MatrixRain:    animId, drops (useRef)        │    │
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 데이터 전파 방식

```
DashboardPage
│
├── events ──────────▶ GlobeSection (arcsData, pointsData 계산)
├── events ──────────▶ LogTerminal (로그 엔트리 목록)
├── threats ─────────▶ ThreatPanel (위협 피드)
├── stats ───────────▶ StatsPanel (차트 데이터)
├── stats ───────────▶ ThreatPanel (게이지, 위협 유형 분포)
├── isConnected ─────▶ Header (연결 상태 표시)
└── totalCount ──────▶ Header (이벤트 카운트)
```

### 롤링 윈도우 메커니즘

```typescript
// useTrafficStream.ts의 addEvent 콜백
const addEvent = useCallback((event: TrafficEvent) => {
  // 이벤트 배열: 최신 이벤트를 맨 앞에 추가, 50개 초과시 자름
  setEvents((prev) => [event, ...prev].slice(0, ROLLING_WINDOW));    // 50

  // 누적 카운트는 계속 증가
  setTotalCount((prev) => prev + 1);

  // threat_level > 0인 이벤트만 별도 배열로 관리, 20개 제한
  if (event.threat_level > 0) {
    setThreats((prev) => [event, ...prev].slice(0, MAX_THREAT_ENTRIES)); // 20
  }
}, []);
```

이 패턴은 다음을 보장한다:
- **메모리 상한**: 최대 50개 이벤트 + 20개 위협만 유지
- **최신 우선**: 새 이벤트가 배열 맨 앞에 삽입 (unshift)
- **자동 만료**: 오래된 이벤트는 slice에 의해 자동 제거
- **누적 카운트**: totalCount는 롤링 윈도우와 별개로 계속 증가

---

## 7. 실시간 통신

### Supabase Realtime 구독 아키텍처

```
┌─────────────┐          ┌──────────────────────┐
│  PostgreSQL │          │   Supabase Realtime  │
│             │  WAL     │                      │
│  INSERT     │ ────────▶│  postgres_changes    │
│  INTO       │  trigger │  channel:            │
│  traffic_   │          │   "traffic-realtime" │
│  events     │          │                      │
└─────────────┘          └──────────┬───────────┘
                                    │
                         WebSocket  │  payload.new = TrafficEvent
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  useTrafficStream()  │
                         │                      │
                         │  channel.on(         │
                         │    "postgres_changes"│
                         │    { event: "INSERT" │
                         │      schema: "public"│
                         │      table:          │
                         │       "traffic_events"│
                         │    }                 │
                         │    (payload) => {    │
                         │      addEvent(       │
                         │       payload.new)   │
                         │    }                 │
                         │  )                   │
                         │  .subscribe(status)  │
                         │                      │
                         │  status:             │
                         │   "SUBSCRIBED" →     │
                         │    isConnected=true  │
                         └──────────────────────┘
```

### 연결 수명 주기

```
1. 컴포넌트 마운트
   │
   ├── fetchInitial()
   │   └── SELECT * FROM traffic_events ORDER BY created_at DESC LIMIT 50
   │
   ├── supabase.channel("traffic-realtime")
   │   └── .on("postgres_changes", { event: "INSERT", ... })
   │   └── .subscribe((status) => setIsConnected(status === "SUBSCRIBED"))
   │
   └── channelRef.current = channel

2. 실시간 수신 중
   │
   └── INSERT 감지 → addEvent(payload.new as TrafficEvent)

3. 컴포넌트 언마운트
   │
   └── supabase.removeChannel(channelRef.current)
       (WebSocket 연결 정리)
```

### Supabase 클라이언트 설정

```typescript
// lib/supabase/client.ts
createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,  // 초당 최대 10개 이벤트 처리
    },
  },
});
```

주요 설계 포인트:
- **eventsPerSecond: 10** - 클라이언트 측 스로틀링, 과도한 렌더링 방지
- **placeholder 폴백** - `NEXT_PUBLIC_SUPABASE_URL`이 없으면 `"https://placeholder.supabase.co"` 사용
- **단일 인스턴스** - 모듈 레벨 `export const supabase`로 전체 앱에서 하나의 클라이언트 공유

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
├── components/dashboard/*   ← 모든 대시보드 컴포넌트
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
                                          ├── MatrixRain 지연 로드
                                          ├── GlobeSection 지연 로드
                                          │   └── "LOADING GLOBE..." 표시
                                          └── Header, Stats, Threat, Log
                                              즉시 렌더 (빈 상태)

                                       5. useTrafficStream
                                          ├── fetchInitial() → DB 쿼리
                                          └── channel.subscribe() → WS 연결

                                       6. 데이터 도착 → 전체 리렌더
                                          ├── 차트 그리기
                                          ├── 지구본 아크 표시
                                          └── 로그 엔트리 애니메이션

                                       7. 실시간 이벤트 수신 (지속)
                                          └── 개별 이벤트마다 상태 업데이트
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

### 색상 체계

```
  시맨틱 용도                    색상         사용처
  ─────────────────────────────────────────────────────
  기본 텍스트/보더/글로우        #00ff41      매트릭스 녹색 (주 색상)
  보조 강조/하이라이트           #00d4ff      시안 (대역폭, dst)
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

### 애니메이션 키프레임

```
glitch1/glitch2:  clip-path + translate 글리치 (GlitchText)
borderPulse:      보더 색상/그림자 맥동 (CyberPanel)
scanline:         수직 스캔라인 이동 (CyberPanel)
fadeSlideIn:      opacity 0→1, translateY 20px→0 (패널 진입)
```

### 반응형 디자인

```css
/* 데스크톱 (lg 이상) */
grid-cols-[280px_1fr_300px]    /* 3열: 스탯 | 글로브 | 위협 */

/* 모바일/태블릿 (lg 미만) */
grid-cols-1                     /* 단일 열: 글로브만 표시 */
hidden lg:block                 /* StatsPanel, ThreatPanel 숨김 */
hidden md:flex                  /* 헤더 버전/모드 배지 숨김 */
hidden lg:inline                /* 로그 라우트 정보 숨김 */
```

---

## 10. 주요 설계 결정

### 10.1 전체 "use client" 대시보드

**결정**: 메인 페이지(page.tsx)를 포함한 모든 대시보드 컴포넌트를 "use client"로 선언한다.

**근거**:
- 실시간 데이터 구독(useTrafficStream)이 최상위에서 필요
- 모든 차트/애니메이션이 브라우저 API(Canvas, WebGL, requestAnimationFrame) 의존
- 서버 컴포넌트로 분리할 수 있는 순수 표현 컴포넌트가 거의 없음
- layout.tsx만 서버 컴포넌트로 유지하여 메타데이터/폰트 최적화 확보

**트레이드오프**: 초기 JS 번들 크기 증가, 대신 구현 단순성과 상태 공유 용이성 확보

### 10.2 Globe의 이중 Dynamic Import

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

### 10.3 Three.js Webpack Alias 설정

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

### 10.4 Supabase Placeholder 폴백

**결정**: Supabase 클라이언트 생성 시 환경 변수가 없으면 placeholder URL로 폴백한다.

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";
```

**근거**:
- Next.js 빌드 시 정적 페이지 프리렌더링 단계에서 `createClient`가 호출됨
- 환경 변수가 빌드 환경에 없으면 `undefined`가 전달되어 빌드 실패
- placeholder를 사용하면 빌드는 성공하고, 런타임에 실제 URL로 교체됨
- 실제 연결 실패 시 `isConnected = false`로 UI에 "OFFLINE" 표시

### 10.5 외부 상태 관리 라이브러리 미사용

**결정**: Redux, Zustand 등 외부 상태 관리 없이 React 내장 Hook만 사용한다.

**근거**:
- 단일 페이지, 단일 데이터 소스(Supabase Realtime)
- 상태 트리가 얕음: events, threats, isConnected, totalCount + 파생 stats
- useState + useCallback + useMemo 조합으로 충분한 성능
- Providers.tsx를 확장 지점으로 남겨두어 향후 필요시 추가 가능

### 10.6 데이터 생성기 분리

**결정**: 트래픽 데이터 생성기를 별도 스크립트(`scripts/generate-traffic.ts`)로 분리하고 `SUPABASE_SERVICE_ROLE_KEY`를 사용한다.

**근거**:
- 대시보드 클라이언트는 `anon` 키만 사용 (읽기 + 실시간 구독)
- 데이터 삽입은 `service_role` 키 필요 (RLS 우회)
- 별도 프로세스로 실행하여 대시보드 성능에 영향 없음
- `tsx` 런타임으로 TypeScript 직접 실행 (`npm run generate-traffic`)

---

## 11. 성능 최적화

### 11.1 렌더링 최적화

| 기법 | 적용 위치 | 효과 |
|------|----------|------|
| `useMemo` | useTrafficStats, GlobeSection (arcsData, pointsData) | 불필요한 재계산 방지 |
| `useCallback` | useTrafficStream (addEvent) | 이벤트 핸들러 참조 안정성 |
| `lazyUpdate: true` | StatsPanel, ThreatPanel의 ReactECharts | ECharts 내부 diff 최소화 |
| Dynamic Import | MatrixRain, GlobeSection | 초기 로딩 코드 분할 |
| `AnimatePresence mode="popLayout"` | ThreatPanel, LogTerminal | 리스트 변경시 최소 리플로우 |

### 11.2 데이터 제한

```
상수                    값      목적
──────────────────────────────────────────
ROLLING_WINDOW         50      메모리 내 최대 이벤트 수
MAX_THREAT_ENTRIES     20      위협 피드 최대 엔트리
MAX_ARCS               30      지구본 동시 아크 수
MAX_LOG_ENTRIES        50      (예약) 로그 최대 수
eventsPerSecond        10      Supabase 클라이언트 스로틀
bandwidthHistory       10      버킷 수 (차트 데이터 포인트)
protocolData           6       파이 차트 상위 표시 수
topCountries           5       국가 바 차트 상위 표시 수
threatTypeEntries      5       위협 유형 리스트 상위 표시 수
threats display        10      위협 피드 화면 표시 수
```

### 11.3 3D 렌더링 최적화

```
기법                           설명
────────────────────────────────────────────────
pointsMerge: true             포인트 메시 병합 (draw call 감소)
arcAltitudeAutoScale: 0.3     아크 높이 자동 스케일 (성능/가시성 균형)
atmosphereAltitude: 0.15      대기 효과 최소화
width/height 동적 계산         window 크기 기반 (과도한 해상도 방지)
autoRotateSpeed: 0.5          느린 자동 회전 (GPU 부하 최소화)
```

### 11.4 Canvas 최적화 (MatrixRain)

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

### 11.5 AnimatedCounter 최적화

```typescript
// requestAnimationFrame 기반 숫자 카운팅 애니메이션
// DOM 직접 조작 (ref.current.textContent) → React 리렌더 없음
const duration = 500;
const eased = 1 - Math.pow(1 - progress, 3);  // easeOutCubic
el.textContent = current.toLocaleString();
```

### 11.6 DB 인덱스

```sql
-- 최신 이벤트 조회 최적화 (초기 로드, ORDER BY created_at DESC)
CREATE INDEX idx_traffic_created_at ON traffic_events (created_at DESC);

-- 위협 이벤트 필터링 (partial index, threat_level > 0인 행만)
CREATE INDEX idx_traffic_threat ON traffic_events (threat_level) WHERE threat_level > 0;
```

---

## 12. 의존성 관리

### 프로덕션 의존성

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| `next` | ^15.1.0 | 프레임워크 (App Router) | Turbopack dev 모드 |
| `react` / `react-dom` | ^19.0.0 | UI 라이브러리 | React 19 (최신) |
| `@supabase/supabase-js` | ^2.49.0 | Supabase 클라이언트 | Realtime 포함 |
| `@supabase/ssr` | ^0.6.0 | Supabase SSR 유틸 | (설치됨, 현재 미사용) |
| `three` | ^0.180.0 | 3D 렌더링 엔진 | react-globe.gl 호환 버전 고정 |
| `react-globe.gl` | ^2.32.0 | 3D 지구본 컴포넌트 | three-globe 래퍼 |
| `echarts` | ^5.5.0 | 차트 라이브러리 | pie, line, gauge |
| `echarts-for-react` | ^3.0.2 | ECharts React 바인딩 | lazyUpdate 지원 |
| `motion` | ^12.0.0 | 애니메이션 라이브러리 | framer-motion v12, AnimatePresence |
| `gsap` | ^3.13.0 | 애니메이션 엔진 | (설치됨, 직접 사용 없음) |
| `@gsap/react` | ^2.1.0 | GSAP React 바인딩 | (설치됨, 직접 사용 없음) |
| `@faker-js/faker` | ^10.0.0 | 가짜 데이터 생성 | generate-traffic.ts |
| `dotenv` | ^17.3.1 | 환경 변수 로드 | generate-traffic.ts (.env.local) |

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
| `eslint-config-next` | ^15.1.0 | Next.js ESLint 설정 |
| `tsx` | ^4.0.0 | TypeScript 실행 런타임 (scripts 실행용) |

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
  "dev":              "next dev --turbopack",       // Turbopack 개발 서버
  "build":            "next build",                  // 프로덕션 빌드
  "start":            "next start",                  // 프로덕션 서버 시작
  "lint":             "next lint",                   // ESLint 실행
  "generate-traffic": "tsx scripts/generate-traffic.ts"  // 트래픽 생성기
}
```

### 환경 변수

```
필수 (런타임):
  NEXT_PUBLIC_SUPABASE_URL       - Supabase 프로젝트 URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY  - Supabase 익명 키 (클라이언트용)

필수 (generate-traffic 스크립트):
  SUPABASE_SERVICE_ROLE_KEY      - Supabase 서비스 롤 키 (데이터 삽입용)

선택:
  (.env.local 파일에 저장)
```

---

> 이 문서는 Traffic Sight v0.1.0 코드베이스 기준으로 작성되었다.
> 마지막 업데이트: 2026-02-20
