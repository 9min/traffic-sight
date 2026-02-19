# Traffic Sight - 개발 워크플로우

> 프로젝트 셋업부터 배포까지의 전체 개발 가이드

---

## 목차

1. [사전 요구사항](#1-사전-요구사항)
2. [초기 셋업](#2-초기-셋업)
3. [Supabase 설정](#3-supabase-설정)
4. [로컬 개발](#4-로컬-개발)
5. [데이터 생성기 실행](#5-데이터-생성기-실행)
6. [빌드 및 배포](#6-빌드-및-배포)
7. [트러블슈팅](#7-트러블슈팅)
8. [개발 규칙](#8-개발-규칙)
9. [브랜치 전략](#9-브랜치-전략)
10. [코드 리뷰 체크리스트](#10-코드-리뷰-체크리스트)

---

## 1. 사전 요구사항

| 도구 | 최소 버전 | 확인 명령어 |
|------|----------|------------|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Git | 2.x | `git -v` |

추가로 필요:
- **Supabase 계정** (무료 플랜 가능): https://supabase.com
- **Vercel 계정** (배포 시): https://vercel.com

---

## 2. 초기 셋업

### 2.1 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd traffic-sight
npm install
```

### 2.2 환경 변수 설정

`.env.local` 파일을 편집하여 Supabase 자격증명을 입력합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

> **주의:** `NEXT_PUBLIC_SUPABASE_URL`은 반드시 `https://`로 시작하는 유효한 URL이어야 합니다.
> 빌드 시 Supabase 클라이언트가 URL을 검증합니다.

### 2.3 자격증명 확인 위치

Supabase Dashboard → Settings → API:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Supabase 설정

### 3.1 데이터베이스 스키마 생성

Supabase Dashboard → SQL Editor에서 `scripts/schema.sql` 내용을 실행합니다:

```sql
CREATE TABLE traffic_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  src_ip INET NOT NULL,
  src_country_code CHAR(2) NOT NULL,
  src_city VARCHAR(100),
  src_lat DOUBLE PRECISION NOT NULL,
  src_lng DOUBLE PRECISION NOT NULL,
  dst_ip INET NOT NULL,
  dst_country_code CHAR(2) NOT NULL,
  dst_city VARCHAR(100),
  dst_lat DOUBLE PRECISION NOT NULL,
  dst_lng DOUBLE PRECISION NOT NULL,
  protocol VARCHAR(10) NOT NULL,
  port INTEGER,
  packet_size INTEGER NOT NULL,
  threat_level SMALLINT DEFAULT 0,
  threat_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX idx_traffic_created_at ON traffic_events (created_at DESC);
CREATE INDEX idx_traffic_threat ON traffic_events (threat_level) WHERE threat_level > 0;
```

### 3.2 Realtime 활성화

1. Supabase Dashboard → **Database** → **Replication**
2. **Source** 섹션에서 `traffic_events` 테이블의 토글을 **ON**
3. 또는 SQL Editor에서:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE traffic_events;
```

### 3.3 RLS (Row Level Security) 설정

개발 환경에서 간편하게 사용하려면:

```sql
ALTER TABLE traffic_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON traffic_events
  FOR SELECT USING (true);

CREATE POLICY "Allow service insert" ON traffic_events
  FOR INSERT WITH CHECK (true);
```

> **프로덕션 주의:** 위 정책은 개발용입니다. 프로덕션에서는 적절한 인증 정책을 적용하세요.

---

## 4. 로컬 개발

### 4.1 개발 서버 시작

```bash
npm run dev
```

Turbopack이 활성화된 상태로 `http://localhost:3000`에서 실행됩니다.

### 4.2 개발 중 확인 사항

| 항목 | 확인 방법 |
|------|----------|
| Matrix Rain 배경 | 페이지 로드 시 녹색 문자 낙하 애니메이션 |
| Globe 렌더링 | 중앙에 3D 지구본 표시 + 자동 회전 |
| 헤더 글리치 | "TRAFFIC SIGHT" 텍스트에 주기적 글리치 효과 |
| 연결 상태 | Supabase 연결 시 헤더에 녹색 "CONNECTED" |
| 실시간 데이터 | 생성기 실행 시 아크, 로그, 차트 실시간 업데이트 |

### 4.3 핫 리로드

Turbopack이 파일 변경을 감지하여 자동으로 리로드합니다.
단, `next.config.ts` 변경 시에는 서버를 재시작해야 합니다.

---

## 5. 데이터 생성기 실행

### 5.1 기본 실행

```bash
npm run generate-traffic
```

- 초당 2~5개의 트래픽 이벤트를 생성합니다
- 약 15%의 이벤트에 위협 정보가 포함됩니다
- `Ctrl+C`로 중지합니다

### 5.2 출력 예시

```
🚀 Traffic Sight - Data Generator
================================
📡 Supabase URL: https://your-project.supabase.co
⏳ Generating traffic events...

Press Ctrl+C to stop

[14:32:01] ✅ Inserted 3 events (Total: 3)
[14:32:02] ✅ Inserted 5 events (Total: 8)
[14:32:03] ✅ Inserted 2 events (Total: 10)
```

### 5.3 데이터 확인

- **Supabase Dashboard** → Table Editor → `traffic_events` 테이블에서 데이터 확인
- **브라우저 콘솔** → Supabase Realtime 이벤트 수신 로그 확인

### 5.4 테이블 초기화 (필요 시)

```sql
TRUNCATE TABLE traffic_events;
```

---

## 6. 빌드 및 배포

### 6.1 프로덕션 빌드

```bash
npm run build
```

성공 시 출력:
```
Route (app)                                 Size  First Load JS
┌ ○ /                                     ~430 kB        ~530 kB
└ ○ /_not-found                            995 B         103 kB
```

### 6.2 로컬 프로덕션 테스트

```bash
npm run build && npm start
```

### 6.3 Vercel 배포

#### CLI 배포
```bash
npx vercel --prod
```

#### GitHub 연동 자동 배포
1. Vercel Dashboard에서 GitHub 저장소 연결
2. **Environment Variables**에 3개 환경 변수 추가
3. `main` 브랜치 push 시 자동 배포

#### Vercel 환경 변수 설정

| 변수 | Environments |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (선택적) |

### 6.4 데이터 생성기 운영

데이터 생성기는 프론트엔드와 별도로 실행해야 합니다:

| 방법 | 설명 |
|------|------|
| **로컬 실행** | `npm run generate-traffic` (개발/데모) |
| **서버 실행** | PM2, systemd 등으로 데몬화 |
| **Supabase Edge Function** | 서버리스로 주기적 실행 |
| **GitHub Actions** | cron 스케줄로 주기적 실행 |

---

## 7. 트러블슈팅

### three.js 모듈 해석 오류

**증상:**
```
Module not found: Can't resolve 'three/webgpu'
Module not found: Can't resolve 'three/tsl'
```

**해결:**
- `three@0.180.0` 설치 확인: `npm ls three`
- `next.config.ts`의 webpack alias 확인

### Supabase URL 오류

**증상:**
```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

**해결:**
- `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`이 `https://`로 시작하는지 확인
- 플레이스홀더도 유효한 URL 형식이어야 함

### Globe가 렌더링되지 않음

**해결:**
- 브라우저 콘솔에서 WebGL 관련 오류 확인
- `GlobeSection.tsx`가 `dynamic import + ssr: false`로 로드되는지 확인
- Three.js 버전이 0.180.0인지 확인

### Realtime 이벤트 수신 안 됨

**해결:**
1. Supabase Dashboard → Database → Replication에서 `traffic_events` 활성화 확인
2. `.env.local`의 Supabase 키가 올바른지 확인
3. 브라우저 콘솔에서 WebSocket 연결 상태 확인
4. RLS 정책이 SELECT를 허용하는지 확인

### 빌드 시 정적 프리렌더링 오류

**증상:** 빌드 중 `/` 페이지 프리렌더링 실패

**해결:**
- `.env.local`의 Supabase URL이 유효한 `https://` URL인지 확인
- Supabase 클라이언트가 빌드 시에도 초기화되므로 URL 형식이 중요

---

## 8. 개발 규칙

### 파일 생성 규칙

- 새 컴포넌트는 해당 디렉토리에 생성 (dashboard/, effects/, ui/)
- 클라이언트 컴포넌트는 반드시 `"use client"` 디렉티브 추가
- 타입은 `lib/supabase/types.ts`에 중앙 관리
- 상수는 `lib/constants.ts`에 중앙 관리

### 스타일 규칙

- Tailwind 유틸리티 클래스 우선 사용
- 사이버 테마 색상은 `globals.css`의 `@theme` 토큰 사용
- 새 글로우/애니메이션 효과는 `globals.css`에 추가
- 인라인 스타일은 동적 값에만 사용

### 성능 규칙

- ECharts에 반드시 `lazyUpdate: true` 적용
- 대량 데이터는 롤링 윈도우로 제한 (`lib/constants.ts`의 상수 활용)
- `useMemo`/`useCallback`으로 불필요한 재계산 방지
- Globe 아크는 최대 30개로 제한

---

## 9. Git 워크플로우

> **⚠ 모든 Git 사용 규칙은 `/docs/GIT_WORKFLOW.md` 문서를 반드시 따라야 합니다.**

자세한 내용은 → **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** 참조

### 핵심 요약

- **`main`/`dev` 직접 커밋 금지** — PR을 통해서만 머지
- **작업 브랜치는 `dev`에서 분기** — 핫픽스만 `main`에서 분기
- **커밋 컨벤션:** `<type>(<scope>): <subject>` (Conventional Commits)
- **PR 머지 전 필수:** `npm run lint && npm run build` 통과
- **머지 전략:** 작업→dev는 Squash and Merge, dev→main은 Merge Commit
- **금지:** `--force` push (main/dev), `.env.local` 커밋, WIP 상태 머지

---

## 10. 코드 리뷰 체크리스트

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
- [ ] 불필요한 리렌더링이 없는가?
- [ ] 대용량 데이터 처리 시 메모리 누수가 없는가?
- [ ] 애니메이션이 60fps를 유지하는가?

### 코드 품질
- [ ] TypeScript 타입이 정확한가?
- [ ] `"use client"` 디렉티브가 적절한가?
- [ ] 사이버 테마 컨벤션을 따르는가?

### 빌드
- [ ] `npm run build`가 성공하는가?
- [ ] `npm run lint`가 통과하는가?
- [ ] Supabase 연결 없이도 빌드가 되는가?
