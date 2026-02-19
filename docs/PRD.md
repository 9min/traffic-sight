# Traffic Sight - 제품 요구사항 명세서 (PRD)

> **문서 버전:** v2.0.4
> **최종 수정일:** 2026-02-20
> **상태:** 개발 진행 중
> **작성자:** Traffic Sight 개발팀

---

## 목차

1. [개요](#1-개요)
2. [배경 및 목적](#2-배경-및-목적)
3. [타겟 사용자](#3-타겟-사용자)
4. [핵심 기능](#4-핵심-기능)
5. [레이아웃 설계](#5-레이아웃-설계)
6. [데이터 모델](#6-데이터-모델)
7. [기술 스택](#7-기술-스택)
8. [성공 지표](#8-성공-지표)
9. [향후 확장 계획](#9-향후-확장-계획)

---

## 1. 개요

### 1.1 제품명

**Traffic Sight** - 실시간 네트워크 트래픽 모니터링 대시보드

### 1.2 한 줄 요약

사이버펑크/매트릭스 테마의 3D 글로브 기반 실시간 네트워크 트래픽 시각화 대시보드로, Faker.js가 생성한 모의 트래픽 데이터를 Supabase Realtime을 통해 스트리밍하여 시각적으로 인상적인 보안 모니터링 경험을 제공한다.

### 1.3 제품 비전

Traffic Sight는 네트워크 보안 관제 센터(SOC)의 시각적 경험을 웹 브라우저에서 재현하는 것을 목표로 한다. 전 세계 32개 주요 도시 간의 네트워크 트래픽 흐름을 3D 글로브 위에 실시간 아크 애니메이션으로 표시하며, 매트릭스 레인 배경, 글리치 텍스트 이펙트, 네온 글로우 UI 등 사이버펑크 미학을 전면적으로 적용하여 기술적 완성도와 시각적 몰입감을 동시에 달성한다.

### 1.4 핵심 가치 제안

| 가치 | 설명 |
|------|------|
| **시각적 임팩트** | 사이버펑크 테마의 3D 글로브, 매트릭스 레인, 글리치 이펙트로 강렬한 첫인상 제공 |
| **실시간 데이터 스트리밍** | Supabase Realtime의 `postgres_changes` 구독을 통한 1초 이내 데이터 반영 |
| **포트폴리오 가치** | 프론트엔드 기술력, 3D 시각화, 실시간 데이터 처리 역량을 한 번에 입증 |
| **교육적 가치** | WebGL 3D 렌더링, 실시간 구독, 애니메이션 기법 학습 레퍼런스 |

---

## 2. 배경 및 목적

### 2.1 프로젝트 배경

현대 사이버 보안 관제 시스템은 대량의 네트워크 트래픽 데이터를 실시간으로 수집, 분석, 시각화하는 것이 핵심이다. 그러나 실제 보안 관제 시스템은 접근이 제한적이며, 개발자가 이러한 시스템의 프론트엔드 기술을 학습하거나 시연하기 어렵다.

Traffic Sight는 이러한 간극을 해소하기 위해 탄생하였다. Faker.js를 활용한 사실적인 모의 트래픽 데이터 생성과 Supabase의 실시간 데이터베이스 기능을 조합하여, 실제 보안 관제 대시보드에 준하는 시각적 경험을 만들어낸다.

### 2.2 프로젝트 목적

1. **기술 시연(Tech Demo):** 최신 프론트엔드 기술 스택(Next.js 15, React 19, Three.js, ECharts)의 통합 활용 능력을 시연한다.
2. **포트폴리오 프로젝트:** 개발자 포트폴리오에서 기술적 깊이와 디자인 감각을 동시에 보여주는 대표 프로젝트로 활용한다.
3. **학습 레퍼런스:** 3D 시각화, 실시간 데이터 스트리밍, 고성능 애니메이션 구현의 실전 레퍼런스를 제공한다.
4. **사이버 보안 관심 유발:** 네트워크 트래픽과 위협 탐지의 개념을 시각적으로 이해할 수 있는 교육 도구로 기능한다.

### 2.3 스코프 경계

| 범위 내 (In-Scope) | 범위 외 (Out-of-Scope) |
|---------------------|----------------------|
| Faker.js 기반 모의 트래픽 데이터 생성 | 실제 네트워크 패킷 캡처 및 분석 |
| Supabase Realtime 기반 실시간 스트리밍 | 자체 WebSocket 서버 구축 |
| 3D 글로브 트래픽 시각화 | 2D 지도 기반 시각화 |
| 사이버펑크/매트릭스 테마 UI | 다중 테마 지원 |
| 데스크탑 반응형 (1024px 이상) | 모바일 최적화 (768px 이하) |
| 읽기 전용 대시보드 | 사용자 인증 및 데이터 필터링 |

---

## 3. 타겟 사용자

### 3.1 주요 타겟 사용자

#### 페르소나 A: 프론트엔드 개발자 (포트폴리오 활용)

- **프로필:** 취업 준비 중인 주니어~미드레벨 프론트엔드 개발자
- **니즈:** 기술적 깊이와 시각적 완성도를 동시에 보여줄 수 있는 포트폴리오 프로젝트
- **사용 시나리오:** GitHub 레포지토리 fork 후 Supabase 프로젝트 연결, Vercel 배포하여 자신의 포트폴리오로 활용
- **핵심 관심사:** 코드 품질, 아키텍처 설계, 최신 기술 스택 활용

#### 페르소나 B: 사이버 보안 애호가

- **프로필:** 네트워크 보안에 관심 있는 IT 전공 학생 또는 주니어 보안 분석가
- **니즈:** 네트워크 트래픽 모니터링의 개념을 직관적으로 이해할 수 있는 시각화 도구
- **사용 시나리오:** 데모 대시보드를 실행하여 트래픽 패턴, 프로토콜 분포, 위협 유형 등을 관찰
- **핵심 관심사:** 보안 위협 시각화, 프로토콜 분석, 지리적 트래픽 분포

#### 페르소나 C: 기술 면접관 / 리크루터

- **프로필:** 개발자 채용을 담당하는 기술 면접관
- **니즈:** 지원자의 기술적 역량을 빠르게 파악할 수 있는 시각적 결과물
- **사용 시나리오:** 배포된 데모 URL을 통해 실시간 동작을 확인하고, 소스 코드를 리뷰
- **핵심 관심사:** 코드 구조, 성능 최적화, 실시간 처리 능력

### 3.2 사용자 여정 (User Flow)

```
사용자가 배포된 URL에 접속
  │
  ├─ 매트릭스 레인 배경 위에 글리치 텍스트 타이틀 확인
  │
  ├─ 3D 글로브에서 실시간 트래픽 아크 애니메이션 관찰
  │   ├─ 초록색 아크: 정상 트래픽
  │   └─ 빨간색 아크: 위협 트래픽
  │
  ├─ 좌측 통계 패널에서 트래픽 개요 확인
  │   ├─ 총 패킷 수 (애니메이션 카운터)
  │   ├─ 프로토콜 분포 도넛 차트
  │   ├─ 대역폭 추이 라인 차트
  │   └─ 상위 5개 소스 국가
  │
  ├─ 우측 위협 패널에서 보안 상황 파악
  │   ├─ 위협 레벨 게이지
  │   ├─ 위협 유형별 카운트
  │   └─ 실시간 위협 피드 (슬라이드-인 애니메이션)
  │
  └─ 하단 로그 터미널에서 개별 이벤트 상세 확인
      ├─ 타임스탬프, IP, 프로토콜, 포트, 패킷 크기
      └─ 위협 이벤트 하이라이트
```

---

## 4. 핵심 기능

### 4.1 3D 글로브 트래픽 시각화

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `GlobeSection.tsx` |
| **기반 라이브러리** | `react-globe.gl` (Three.js 기반) |
| **지구 텍스처** | `three-globe/example/img/earth-dark.jpg` (다크 테마) |
| **대기 효과** | 초록색 (`#00ff41`) 대기광, 고도 0.15 |
| **자동 회전** | 활성화, 속도 0.5 |
| **동적 로딩** | Next.js `dynamic()` SSR 비활성화, 로딩 인디케이터 제공 |

#### 4.1.1 트래픽 아크 (Arc)

- **최대 동시 표시:** 30개 (`MAX_ARCS`)
- **정상 트래픽:** 초록-시안 그라데이션 (`rgba(0, 255, 65, 0.8)` -> `rgba(0, 212, 255, 0.4)`), 선 두께 0.8
- **위협 트래픽:** 빨강-오렌지 그라데이션 (`rgba(255, 0, 64, 0.8)` -> `rgba(255, 102, 0, 0.4)`), 선 두께 1.5
- **대시 애니메이션:** 길이 0.3~0.5, 간격 1~2, 애니메이션 시간 1500~2500ms (랜덤)
- **아크 고도:** 자동 스케일 0.3

#### 4.1.2 도시 마커 (Point)

- **데이터 소스:** 트래픽 이벤트의 출발지/목적지 좌표에서 중복 제거
- **마커 크기:** 반경 0.3, 고도 0.01
- **색상 분류:**
  - 출발지 (정상): `#00ff41` (매트릭스 그린)
  - 출발지 (위협): `#ff0040` (위협 레드)
  - 목적지: `#00d4ff` (사이버 시안)
- **포인트 병합:** 활성화 (`pointsMerge={true}`)

### 4.2 통계 패널 (Stats Panel)

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `StatsPanel.tsx` |
| **위치** | 좌측 사이드바 (너비 280px) |
| **데이터 소스** | `useTrafficStats` 훅 (이벤트 배열 기반 실시간 계산) |

#### 4.2.1 오버뷰 카드

- **총 패킷 수:** `AnimatedCounter` 컴포넌트, 500ms ease-out 커빅 보간 애니메이션
- **위협 수:** 동일 카운터 애니메이션 적용
- **대역폭:** 바이트 단위 자동 포맷 (B / KB / MB)
- **초당 패킷:** 최근 이벤트 기반 계산 (최대 5)

#### 4.2.2 프로토콜 분포 차트

- **차트 유형:** ECharts 도넛(Pie) 차트, 내경 45%, 외경 70%
- **지원 프로토콜:** TCP, UDP, ICMP, HTTP, HTTPS, DNS, SSH, FTP, SMTP, TLS (상위 6개 표시)
- **색상 팔레트:** `#00ff41`, `#00d4ff`, `#0066ff`, `#bf00ff`, `#ff6600`, `#ffcc00`
- **라벨:** 모노스페이스 폰트 9px, 매트릭스 그린
- **강조 효과:** 호버 시 그린 새도우 블러 10px

#### 4.2.3 대역폭 추이 차트

- **차트 유형:** ECharts 라인(Line) 차트, smooth 보간
- **데이터:** 이벤트를 10개 버킷으로 분할, 버킷별 패킷 크기 합산
- **스타일:** 시안 라인(`#00d4ff`, 2px), 시안 그라데이션 영역 (0.3 -> 0 불투명도)
- **Y축:** 바이트 단위 자동 포맷

#### 4.2.4 상위 소스 국가

- **표시:** 상위 5개 국가 코드, 트래픽 수, 프로그레스 바
- **프로그레스 바:** 1위 대비 비율 계산, 매트릭스 그린 60% 불투명도
- **갱신:** 이벤트 추가 시 실시간 재계산

### 4.3 위협 패널 (Threat Panel)

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `ThreatPanel.tsx` |
| **위치** | 우측 사이드바 (너비 300px) |
| **최대 저장 건수** | 20건 (`MAX_THREAT_ENTRIES`) |

#### 4.3.1 위협 레벨 게이지

- **차트 유형:** ECharts 게이지(Gauge) 차트
- **범위:** 0~100% (평균 위협 레벨 x 20으로 환산)
- **색상 구간:**
  - 0~30%: `#00ff41` (안전, 매트릭스 그린)
  - 30~60%: `#ffcc00` (주의, 옐로우)
  - 60~100%: `#ff0040` (위험, 레드)
- **각도:** 시작 220도, 종료 -40도
- **프로그레스 바:** 폭 10px, 라운드 캡

#### 4.3.2 위협 유형 분포

- **표시:** 상위 5개 위협 유형, 발생 횟수
- **위협 유형 (10종):**

| 위협 유형 | 설명 |
|-----------|------|
| DDoS Attack | 분산 서비스 거부 공격 |
| SQL Injection | SQL 삽입 공격 |
| Port Scan | 포트 스캔 |
| Brute Force | 무차별 대입 공격 |
| XSS Attack | 크로스 사이트 스크립팅 |
| Man-in-the-Middle | 중간자 공격 |
| Malware C2 | 악성코드 커맨드 앤 컨트롤 |
| Data Exfiltration | 데이터 유출 |
| Ransomware | 랜섬웨어 |
| Zero-Day Exploit | 제로데이 익스플로잇 |

#### 4.3.3 실시간 위협 피드

- **표시:** 최근 위협 이벤트 10건
- **애니메이션:** Motion(Framer Motion) `AnimatePresence` + `popLayout` 모드
  - 진입: `opacity: 0 -> 1`, `x: 20 -> 0`, `height: 0 -> auto` (300ms)
  - 퇴장: `opacity: 1 -> 0`, `x: 0 -> -20`, `height: auto -> 0` (300ms)
- **각 항목 표시 정보:** 타임스탬프, 위협 레벨 배지, 위협 유형, 출발지/목적지 IP, 출발지/목적지 도시 및 국가
- **위협 레벨 배지 색상:**

| 레벨 | 라벨 | 색상 |
|------|------|------|
| 1 | LOW | `#ffcc00` |
| 2 | MEDIUM | `#ffcc00` |
| 3 | HIGH | `#ff6600` |
| 4 | CRITICAL | `#ff0040` |
| 5 | SEVERE | `#ff0040` |

### 4.4 로그 터미널 (Log Terminal)

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `LogTerminal.tsx` |
| **위치** | 하단 풀 와이드 (높이 200px) |
| **최대 표시 건수** | 50건 (`ROLLING_WINDOW`) |

#### 4.4.1 터미널 UI

- **헤더:** 3색 도트(빨강/노랑/초록) + "Network Traffic Log" 타이틀 + 항목 수 표시
- **프롬프트:** `root@traffic-sight:~$ █` (깜빡이는 커서)
- **폰트:** JetBrains Mono, 11px, 행간 20px
- **스크롤:** 새 이벤트 수신 시 최상단으로 자동 스크롤

#### 4.4.2 로그 항목 구성

```
[HH:MM:SS] SRC_IP → DST_IP PROTOCOL :PORT [SIZE] SRC_CITY,CC → DST_CITY,CC ⚠ THREAT_TYPE
```

- **타임스탬프:** 매트릭스 그린 40% 불투명도
- **IP 주소:** 사이버 시안
- **프로토콜:** 정상=매트릭스 그린, 위협=위협 레드 (볼드)
- **포트:** 매트릭스 그린 50% 불투명도
- **크기:** 네온 퍼플 60% 불투명도
- **도시 경로:** 매트릭스 그린 25% 불투명도 (lg 이상에서만 표시)
- **위협 배지:** 빨간 테두리 + 배경, 텍스트 글로우 효과
- **위협 항목:** 좌측 빨간 보더 2px, 빨간 배경 5% 불투명도

#### 4.4.3 애니메이션

- Motion `AnimatePresence` + `popLayout` 모드
- 진입: `opacity: 0 -> 1`, `y: -10 -> 0` (200ms)

### 4.5 매트릭스 레인 배경

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `MatrixRain.tsx` |
| **렌더링 방식** | HTML Canvas 2D, `requestAnimationFrame` 루프 |
| **Z 레이어** | `z-0`, 모든 UI 요소 뒤에 배치 |
| **불투명도** | 15% (`opacity-15`) |

#### 4.5.1 구현 상세

- **문자 세트:** 일본어 카타카나 + 숫자(0-9) + 영문 대문자(A-Z)
- **폰트 크기:** 14px 모노스페이스
- **기본 색상:** `#00ff41` (매트릭스 그린), 밝기 변동 (불투명도 0.3~1.0 랜덤)
- **하이라이트:** 2% 확률로 `#ffffff` (흰색) 문자 렌더링 (열의 선두 문자 효과)
- **트레일 효과:** 매 프레임 `rgba(10, 10, 15, 0.05)` 오버레이로 잔상 생성
- **열 리셋:** 화면 하단 도달 후 2.5% 확률로 상단에서 재시작
- **리사이즈 대응:** `window.resize` 이벤트로 캔버스 크기 및 열 수 재계산

### 4.6 글리치 텍스트 이펙트

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `GlitchText.tsx` |
| **적용 대상** | 헤더 타이틀 "TRAFFIC SIGHT" |

#### 4.6.1 구현 상세

- **글리치 문자:** `!<>-_\\/[]{}--=+*^?#_` + 일본어 카타카나 일부
- **동작 주기:** 2~6초 간격으로 랜덤 트리거
- **글리치 범위:** 매 트리거 시 2~4개 문자 랜덤 선택
- **글리치 색상:** 시안(`#00d4ff`) 또는 레드(`#ff0040`) 50% 확률
- **복원 시간:** 100~250ms 후 원래 문자로 복원
- **레이어 효과:** 시안/레드 색상의 2개 겹침 레이어, CSS `glitch1`/`glitch2` 애니메이션

### 4.7 실시간 데이터 스트리밍

| 항목 | 상세 |
|------|------|
| **훅** | `useTrafficStream.ts` |
| **프로토콜** | Supabase Realtime (`postgres_changes` 이벤트) |
| **채널명** | `traffic-realtime` |

#### 4.7.1 연결 흐름

```
1. 컴포넌트 마운트
   │
   ├─ 초기 데이터 페치 (최근 50건, created_at DESC)
   │   ├─ events 상태 초기화
   │   ├─ threats 필터링 (threat_level > 0)
   │   └─ totalCount 초기화
   │
   └─ Supabase Realtime 채널 구독
       ├─ 이벤트: INSERT
       ├─ 스키마: public
       ├─ 테이블: traffic_events
       │
       └─ 콜백: addEvent()
           ├─ events 배열 선두에 추가 (최대 50건 유지)
           ├─ totalCount 증가
           └─ threat_level > 0 이면 threats 배열에 추가 (최대 20건 유지)
```

#### 4.7.2 연결 상태

- **SUBSCRIBED:** 헤더에 초록색 점 + "CONNECTED" 텍스트 + 펄스 애니메이션
- **기타 상태:** 빨간색 점 + "OFFLINE" 텍스트

#### 4.7.3 Supabase 클라이언트 설정

- **이벤트 처리 속도 제한:** 초당 10건 (`eventsPerSecond: 10`)
- **인증:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key) 사용

### 4.8 데이터 생성기 스크립트

| 항목 | 상세 |
|------|------|
| **스크립트** | `scripts/generate-traffic.ts` |
| **실행 명령** | `npm run generate-traffic` |
| **런타임** | `tsx` (TypeScript 직접 실행) |

#### 4.8.1 생성 로직

- **생성 주기:** 1초마다 배치 생성
- **배치 크기:** 2~5건 (랜덤)
- **위협 확률:** 15%
- **위협 레벨:** 1~5 (위협 시 랜덤)
- **패킷 크기:** 64~65,535 바이트 (랜덤)
- **도시 풀:** 전 세계 32개 주요 도시 (출발지와 목적지 중복 방지)
- **프로토콜:** 10종 (TCP, UDP, ICMP, HTTP, HTTPS, DNS, SSH, FTP, SMTP, TLS)
- **포트:** 프로토콜별 기본 포트 매핑, 미매핑 시 1024~65535 랜덤
- **인증:** `SUPABASE_SERVICE_ROLE_KEY` (service role key) 사용
- **종료:** `Ctrl+C` (SIGINT) 시 총 생성 건수 출력 후 정상 종료

### 4.9 CyberPanel UI 컴포넌트

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `CyberPanel.tsx` |
| **용도** | 모든 대시보드 카드의 기본 컨테이너 |

#### 4.9.1 기능

- **변형(Variant):** `green` / `cyan` / `red` - 각각 테두리, 글로우, 타이틀, 인디케이터 도트 색상 변경
- **펄스 효과:** `pulse` prop으로 테두리 펄스 애니메이션 토글
- **코너 장식:** 네 모서리에 L자형 보더 장식 (매트릭스 그린 60%)
- **타이틀 바:** 인디케이터 도트(펄스) + 대문자 트래킹 레터 타이틀 + 3도트 장식
- **스캔라인 효과:** 전체 패널 위에 반투명 스캔라인 오버레이
- **배경:** 블랙 70% 불투명도 + `backdrop-blur-sm`

### 4.10 헤더 (Header)

| 항목 | 상세 |
|------|------|
| **컴포넌트** | `Header.tsx` |
| **구성 요소** | 로고 + 글리치 타이틀 / 버전 + REALTIME 배지 / 이벤트 카운터 / 시계 + 연결 상태 |

#### 4.10.1 세부 요소

- **로고:** 이중 정사각형 회전 아이콘 (네온 그린 글로우)
- **버전 배지:** `v2.0.4` (그린 테두리)
- **REALTIME 배지:** 시안 테두리 + 배경
- **이벤트 카운터:** 총 수신 이벤트 수 (1000 단위 구분자)
- **시계:** 24시간 형식 (`HH:MM:SS`), 1초마다 갱신, 시안 텍스트 글로우
- **연결 상태:** 원형 인디케이터 + CONNECTED/OFFLINE 텍스트

---

## 5. 레이아웃 설계

### 5.1 전체 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header                                                             │
│  [Logo + GlitchText "TRAFFIC SIGHT"] [v2.0.4] [Events: N] [Clock] [Status] │
├──────────────┬──────────────────────────────────┬───────────────────┤
│              │                                  │                   │
│  Stats Panel │         3D Globe                 │  Threat Panel     │
│  (280px)     │         (flex: 1)                │  (300px)          │
│              │                                  │                   │
│  ┌──────┐   │      ┌─────────────────┐         │  ┌──────────┐    │
│  │OVERVIEW│  │      │                 │         │  │THREAT LV │    │
│  │Packets │  │      │   ○ 3D Globe    │         │  │  Gauge   │    │
│  │Threats │  │      │   Auto-rotate   │         │  └──────────┘    │
│  │Bandwidth│ │      │   Arc Anim      │         │  ┌──────────┐    │
│  │Pkts/sec│  │      │                 │         │  │THREAT    │    │
│  └──────┘   │      └─────────────────┘         │  │TYPES     │    │
│  ┌──────┐   │                                  │  └──────────┘    │
│  │PROTOCOLS│ │                                  │  ┌──────────┐    │
│  │Donut   │  │                                  │  │LIVE FEED │    │
│  └──────┘   │                                  │  │  ↕ slide  │    │
│  ┌──────┐   │                                  │  │  in/out   │    │
│  │BANDWIDTH│ │                                  │  └──────────┘    │
│  │Line    │  │                                  │                   │
│  └──────┘   │                                  │                   │
│  ┌──────┐   │                                  │                   │
│  │TOP SRC│  │                                  │                   │
│  └──────┘   │                                  │                   │
├──────────────┴──────────────────────────────────┴───────────────────┤
│  Log Terminal (200px height, full width)                            │
│  ● ● ● Network Traffic Log                             N entries   │
│  [HH:MM:SS] SRC_IP → DST_IP PROTO :PORT [SIZE] ROUTE  ⚠ THREAT   │
│  [HH:MM:SS] SRC_IP → DST_IP PROTO :PORT [SIZE] ROUTE              │
│  ...                                                                │
│  root@traffic-sight:~$ █                                           │
└─────────────────────────────────────────────────────────────────────┘

 ░░░░░░░░░░ Matrix Rain Background (z-0, opacity 15%) ░░░░░░░░░░░░░░
```

### 5.2 CSS Grid 구성

```css
/* 메인 콘텐츠 영역 */
grid-template-columns: 280px 1fr 300px;  /* lg 이상 */
grid-template-columns: 1fr;              /* lg 미만 (사이드바 숨김) */
```

### 5.3 Z-Index 레이어 구조

| Z-Index | 요소 | 설명 |
|---------|------|------|
| `z-0` | MatrixRain Canvas | 최하단 배경 레이어 |
| `z-10` | Main Content (글로브, 패널) | 주요 콘텐츠 영역 |
| `z-10` | Footer (로그 터미널) | 하단 로그 영역 |
| `z-20` | Header | 최상단 고정 네비게이션 |

### 5.4 반응형 브레이크포인트

| 브레이크포인트 | 동작 |
|---------------|------|
| **1920px** (Full HD) | 전체 레이아웃 표시, 글로브 최대 크기 |
| **1440px** | 동일 레이아웃, 글로브 크기 약간 축소 |
| **1024px** (lg) | 3열 그리드 유지, 요소 압축 |
| **1024px 미만** | 좌/우 사이드바 숨김 (`hidden lg:block`), 글로브만 표시 |

### 5.5 색상 시스템

| 토큰명 | 값 | 용도 |
|--------|------|------|
| `cyber-bg` | 다크 배경 | 페이지 배경색 |
| `matrix-green` | `#00ff41` | 주요 텍스트, 정상 상태, 보더 |
| `cyber-cyan` | `#00d4ff` | 보조 강조, 시간, IP 주소 |
| `neon-purple` | 퍼플 계열 | 패킷 크기 표시 |
| `threat-red` | `#ff0040` | 위협 관련 요소 |
| `threat-orange` | `#ff6600` | 위협 유형 텍스트, 중간 위험도 |
| `threat-yellow` | `#ffcc00` | 낮은 위험도, 주의 |

### 5.6 글로우(Glow) 효과 클래스

| 클래스 | 효과 |
|--------|------|
| `neon-glow-green` | 매트릭스 그린 네온 글로우 |
| `neon-glow-cyan` | 사이버 시안 네온 글로우 |
| `neon-glow-red` | 위협 레드 네온 글로우 |
| `text-glow-green` | 텍스트 그린 발광 |
| `text-glow-cyan` | 텍스트 시안 발광 |
| `text-glow-red` | 텍스트 레드 발광 |
| `scanline-effect` | CRT 스캔라인 오버레이 |
| `cyber-border-pulse` | 테두리 펄스 애니메이션 |

---

## 6. 데이터 모델

### 6.1 Supabase 테이블: `traffic_events`

#### 6.1.1 스키마 정의

```sql
CREATE TABLE traffic_events (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  src_ip        TEXT NOT NULL,
  src_country_code TEXT NOT NULL,
  src_city      TEXT,
  src_lat       DOUBLE PRECISION NOT NULL,
  src_lng       DOUBLE PRECISION NOT NULL,
  dst_ip        TEXT NOT NULL,
  dst_country_code TEXT NOT NULL,
  dst_city      TEXT,
  dst_lat       DOUBLE PRECISION NOT NULL,
  dst_lng       DOUBLE PRECISION NOT NULL,
  protocol      TEXT NOT NULL,
  port          INTEGER,
  packet_size   INTEGER NOT NULL,
  threat_level  INTEGER NOT NULL DEFAULT 0,
  threat_type   TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
);
```

#### 6.1.2 필드 상세

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | UUID | PK | 자동 생성 고유 식별자 |
| `created_at` | TIMESTAMPTZ | O | 이벤트 생성 시간 (자동) |
| `src_ip` | TEXT | O | 출발지 IPv4 주소 (Faker 생성) |
| `src_country_code` | TEXT | O | 출발지 국가 코드 (ISO 3166-1 alpha-2) |
| `src_city` | TEXT | - | 출발지 도시명 |
| `src_lat` | DOUBLE PRECISION | O | 출발지 위도 |
| `src_lng` | DOUBLE PRECISION | O | 출발지 경도 |
| `dst_ip` | TEXT | O | 목적지 IPv4 주소 (Faker 생성) |
| `dst_country_code` | TEXT | O | 목적지 국가 코드 |
| `dst_city` | TEXT | - | 목적지 도시명 |
| `dst_lat` | DOUBLE PRECISION | O | 목적지 위도 |
| `dst_lng` | DOUBLE PRECISION | O | 목적지 경도 |
| `protocol` | TEXT | O | 네트워크 프로토콜 |
| `port` | INTEGER | - | 대상 포트 번호 |
| `packet_size` | INTEGER | O | 패킷 크기 (바이트) |
| `threat_level` | INTEGER | O | 위협 레벨 (0: 정상, 1~5: 위협) |
| `threat_type` | TEXT | - | 위협 유형 (threat_level > 0 시 설정) |
| `status` | TEXT | O | 이벤트 상태 (기본값: `active`) |

#### 6.1.3 Supabase Realtime 설정

```sql
-- Realtime publication 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_events;
```

### 6.2 TypeScript 인터페이스

```typescript
// lib/supabase/types.ts

export interface TrafficEvent {
  id: string;
  created_at: string;
  src_ip: string;
  src_country_code: string;
  src_city: string | null;
  src_lat: number;
  src_lng: number;
  dst_ip: string;
  dst_country_code: string;
  dst_city: string | null;
  dst_lat: number;
  dst_lng: number;
  protocol: string;
  port: number | null;
  packet_size: number;
  threat_level: number;
  threat_type: string | null;
  status: string;
}

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  stroke: number;
  id: string;
}
```

### 6.3 통계 인터페이스

```typescript
// hooks/useTrafficStats.ts

export interface TrafficStats {
  totalPackets: number;          // 총 패킷 수
  totalBandwidth: number;        // 총 대역폭 (바이트)
  protocolDistribution: Record<string, number>;   // 프로토콜별 분포
  countryDistribution: Record<string, number>;    // 국가별 분포
  threatCount: number;           // 위협 수
  threatsByType: Record<string, number>;          // 위협 유형별 분포
  avgThreatLevel: number;        // 평균 위협 레벨
  bandwidthHistory: number[];    // 대역폭 히스토리 (10개 버킷)
  packetsPerSecond: number;      // 초당 패킷 수
}
```

### 6.4 도시 좌표 데이터

전 세계 32개 주요 도시의 좌표 데이터가 `lib/constants.ts`에 하드코딩되어 있다.

| 지역 | 도시 |
|------|------|
| **북미** | New York, Los Angeles, Chicago, Toronto, Mexico City |
| **남미** | São Paulo, Buenos Aires |
| **유럽** | London, Paris, Berlin, Amsterdam, Stockholm, Frankfurt, Warsaw, Helsinki, Moscow, Istanbul |
| **중동/아프리카** | Dubai, Cape Town, Johannesburg |
| **아시아** | Tokyo, Seoul, Beijing, Shanghai, Singapore, Mumbai, Hong Kong, Taipei, Bangkok, Kuala Lumpur, Jakarta |
| **오세아니아** | Sydney |

### 6.5 프로토콜 및 포트 매핑

| 프로토콜 | 기본 포트 |
|----------|----------|
| HTTP | 80 |
| HTTPS | 443 |
| DNS | 53 |
| SSH | 22 |
| FTP | 21 |
| SMTP | 25 |
| TCP | 8080 |
| UDP | 5060 |
| ICMP | 0 |
| TLS | 443 |

---

## 7. 기술 스택

### 7.1 프론트엔드 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | ^15.1.0 | App Router 기반 React 프레임워크, Turbopack 개발 서버 |
| **React** | ^19.0.0 | UI 라이브러리, Server/Client Components |
| **TypeScript** | ^5.7.0 | 정적 타입 시스템 |

### 7.2 3D 시각화

| 기술 | 버전 | 용도 |
|------|------|------|
| **react-globe.gl** | ^2.32.0 | Three.js 기반 3D 글로브 컴포넌트 |
| **Three.js** | ^0.180.0 | WebGL 3D 렌더링 엔진 |

### 7.3 차트

| 기술 | 버전 | 용도 |
|------|------|------|
| **ECharts** | ^5.5.0 | 고성능 차트 라이브러리 |
| **echarts-for-react** | ^3.0.2 | ECharts의 React 래퍼 |

### 7.4 실시간 데이터

| 기술 | 버전 | 용도 |
|------|------|------|
| **@supabase/supabase-js** | ^2.49.0 | Supabase 클라이언트 (Realtime, DB) |
| **@supabase/ssr** | ^0.6.0 | Supabase SSR 유틸리티 |

### 7.5 데이터 생성

| 기술 | 버전 | 용도 |
|------|------|------|
| **@faker-js/faker** | ^10.0.0 | 모의 네트워크 트래픽 데이터 생성 |

### 7.6 애니메이션

| 기술 | 버전 | 용도 |
|------|------|------|
| **GSAP** | ^3.13.0 | 고성능 애니메이션 엔진 |
| **@gsap/react** | ^2.1.0 | GSAP React 통합 |
| **Motion** (Framer Motion) | ^12.0.0 | 선언적 React 애니메이션 (리스트 진입/퇴장) |

### 7.7 스타일링

| 기술 | 버전 | 용도 |
|------|------|------|
| **Tailwind CSS** | ^4.0.0 | 유틸리티 퍼스트 CSS (다크 테마, 네온 글로우, 커스텀 색상) |
| **JetBrains Mono** | (Google Fonts) | 모노스페이스 기본 폰트 |

### 7.8 개발 도구

| 기술 | 버전 | 용도 |
|------|------|------|
| **ESLint** | ^9.0.0 | 코드 린팅 |
| **eslint-config-next** | ^15.1.0 | Next.js ESLint 규칙 |
| **tsx** | ^4.0.0 | TypeScript 직접 실행 (데이터 생성기) |
| **dotenv** | ^17.3.1 | 환경 변수 로딩 |

### 7.9 배포

| 플랫폼 | 용도 |
|--------|------|
| **Vercel** | Next.js 호스팅 및 자동 배포 |
| **Supabase** | PostgreSQL 데이터베이스 + Realtime 서비스 |

### 7.10 프로젝트 구조

```
traffic-sight/
├── app/
│   ├── globals.css         # 전역 스타일 (Tailwind, 커스텀 글로우, 애니메이션)
│   ├── layout.tsx          # 루트 레이아웃 (다크 모드, JetBrains Mono)
│   ├── page.tsx            # 메인 대시보드 페이지
│   └── providers.tsx       # 클라이언트 프로바이더 래퍼
├── components/
│   ├── dashboard/
│   │   ├── GlobeSection.tsx    # 3D 글로브 + 아크 + 마커
│   │   ├── Header.tsx          # 헤더 (타이틀, 시계, 연결 상태)
│   │   ├── LogTerminal.tsx     # 로그 터미널
│   │   ├── StatsPanel.tsx      # 통계 패널 (차트, 카운터)
│   │   └── ThreatPanel.tsx     # 위협 패널 (게이지, 피드)
│   ├── effects/
│   │   ├── GlitchText.tsx      # 글리치 텍스트 이펙트
│   │   └── MatrixRain.tsx      # 매트릭스 레인 Canvas
│   └── ui/
│       └── CyberPanel.tsx      # 사이버펑크 카드 컨테이너
├── hooks/
│   ├── useTrafficStats.ts      # 트래픽 통계 계산 훅
│   └── useTrafficStream.ts     # Supabase Realtime 구독 훅
├── lib/
│   ├── constants.ts            # 상수 (도시, 프로토콜, 위협 유형)
│   └── supabase/
│       ├── client.ts           # Supabase 클라이언트 초기화
│       └── types.ts            # TypeScript 타입 정의
├── scripts/
│   └── generate-traffic.ts     # 트래픽 데이터 생성 스크립트
├── workers/
│   └── matrix-rain.worker.ts   # 매트릭스 레인 Web Worker (예비)
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

### 7.11 환경 변수

| 변수명 | 용도 | 사용처 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트, 생성기 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (RLS 적용) | 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 (RLS 우회) | 생성기 스크립트 |

---

## 8. 성공 지표

### 8.1 성능 지표 (Performance Metrics)

| 지표 | 목표치 | 측정 방법 |
|------|--------|----------|
| **렌더링 프레임율** | 60fps 유지 | Chrome DevTools Performance 탭 |
| **실시간 지연 시간** | 데이터 삽입 후 1초 이내 UI 반영 | Supabase INSERT 타임스탬프 vs 클라이언트 수신 시간 비교 |
| **3D 글로브 초기 로딩** | 3초 이내 | `dynamic()` 로딩 완료까지 소요 시간 |
| **매트릭스 레인 CPU 사용률** | 메인 스레드 부하 10% 이하 | Chrome Performance Monitor |
| **메모리 사용량** | 안정 상태에서 200MB 이하 | Chrome Task Manager |

### 8.2 데이터 처리 지표

| 지표 | 목표치 | 설명 |
|------|--------|------|
| **이벤트 생성 속도** | 2~5건/초 | 생성기 스크립트 배치 크기 |
| **위협 비율** | 약 15% | 전체 이벤트 대비 위협 이벤트 비율 |
| **롤링 윈도우** | 최근 50건 | 클라이언트 측 이벤트 버퍼 크기 |
| **최대 동시 아크** | 30개 | 글로브 위 동시 표시 아크 수 |
| **최대 위협 항목** | 20건 | 위협 패널 버퍼 크기 |

### 8.3 반응형 지표

| 해상도 | 상태 | 세부 사항 |
|--------|------|----------|
| **1920 x 1080** (Full HD) | 완전 지원 | 3열 레이아웃 + 모든 패널 표시 |
| **1440 x 900** | 완전 지원 | 3열 레이아웃 유지, 글로브 약간 축소 |
| **1024 x 768** | 부분 지원 | 3열 레이아웃 유지 (lg 브레이크포인트) |
| **1024px 미만** | 기본 지원 | 글로브 + 로그 터미널만 표시, 사이드바 숨김 |

### 8.4 코드 품질 지표

| 지표 | 목표치 |
|------|--------|
| TypeScript strict 모드 | 활성화 |
| ESLint 에러 | 0건 |
| 컴포넌트 재사용성 | CyberPanel 기반 일관된 UI |
| 상태 관리 | React 내장 훅 (useState, useMemo, useCallback) |
| SSR 호환성 | 3D/Canvas 컴포넌트는 `dynamic({ ssr: false })` 처리 |

---

## 9. 향후 확장 계획

### 9.1 단기 (Phase 2)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **모바일 반응형** | 768px 이하 모바일 레이아웃 최적화, 글로브 터치 인터랙션 | 높음 |
| **다크/라이트 테마 전환** | 사이버펑크 외 클린 라이트 테마 옵션 | 중간 |
| **필터링 기능** | 프로토콜, 국가, 위협 레벨별 실시간 필터 | 높음 |
| **글로브 클릭 인터랙션** | 도시 마커 클릭 시 해당 도시 트래픽 상세 팝업 | 중간 |
| **사운드 이펙트** | 위협 감지 시 알림 사운드, 키보드 타이핑 효과음 | 낮음 |

### 9.2 중기 (Phase 3)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **히스토리 타임라인** | 과거 트래픽 데이터 시간대별 재생(Replay) 기능 | 높음 |
| **커스텀 도시 설정** | 사용자 지정 도시 좌표 추가/삭제 | 중간 |
| **위협 시나리오 모드** | DDoS 공격, 랜섬웨어 확산 등 사전 정의된 시나리오 재생 | 높음 |
| **실시간 알림(Push)** | 위협 레벨 4 이상 시 브라우저 알림 | 중간 |
| **다국어 지원** | 한국어/영어/일본어 UI 전환 | 낮음 |
| **매트릭스 레인 Web Worker** | Canvas 렌더링을 OffscreenCanvas + Web Worker로 분리하여 메인 스레드 부하 감소 | 높음 |

### 9.3 장기 (Phase 4)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **실제 네트워크 데이터 연동** | 실제 서버 로그 또는 Cloudflare/AWS 트래픽 데이터 연동 | 높음 |
| **AI 이상 탐지** | 머신러닝 기반 트래픽 패턴 이상 탐지 및 자동 분류 | 중간 |
| **협업 모드** | 다중 사용자가 동일 대시보드를 실시간 공유 (Supabase Presence) | 중간 |
| **대시보드 커스터마이징** | 드래그 앤 드롭 위젯 배치, 차트 유형 변경 | 낮음 |
| **API 엔드포인트** | REST API로 외부 시스템에서 트래픽 데이터 주입 | 중간 |
| **PDF 보고서 생성** | 특정 시간대 트래픽/위협 요약 보고서 PDF 내보내기 | 낮음 |

### 9.4 기술 부채 및 개선 사항

| 항목 | 현재 상태 | 개선 방향 |
|------|----------|----------|
| 글로브 크기 계산 | `window.innerWidth * 0.5` 하드코딩 | `ResizeObserver` 기반 동적 크기 조정 |
| 상태 관리 | `useState` + `useCallback` | 대규모 확장 시 Zustand 또는 Jotai 도입 검토 |
| 초기 데이터 로딩 | 단순 `select` 쿼리 | 페이지네이션 + 인피니트 스크롤 |
| 에러 핸들링 | 최소 수준 | Error Boundary + Toast 알림 |
| 테스트 | 미구현 | Vitest + React Testing Library + Playwright E2E |
| 접근성 | 미적용 | ARIA 레이블, 키보드 내비게이션, 고대비 모드 |
| Providers 래퍼 | 빈 프래그먼트 | 향후 전역 상태/테마 프로바이더 추가 시 활용 |

---

> **문서 끝.** 이 PRD는 Traffic Sight 프로젝트의 현재 구현 상태를 기반으로 작성되었으며, 프로젝트 진행에 따라 지속적으로 갱신된다.
