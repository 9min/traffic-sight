# Traffic Sight - Git 워크플로우

> **이 문서는 프로젝트의 Git 사용 규칙을 정의합니다.**
> **모든 기여자(사람, AI 에이전트 포함)는 이 규칙을 반드시 따라야 합니다.**

---

## 목차

1. [브랜치 모델](#1-브랜치-모델)
2. [브랜치 네이밍 규칙](#2-브랜치-네이밍-규칙)
3. [커밋 컨벤션](#3-커밋-컨벤션)
4. [작업 흐름 (Feature Flow)](#4-작업-흐름-feature-flow)
5. [핫픽스 흐름 (Hotfix Flow)](#5-핫픽스-흐름-hotfix-flow)
6. [PR (Pull Request) 규칙](#6-pr-pull-request-규칙)
7. [머지 전략](#7-머지-전략)
8. [금지 사항](#8-금지-사항)
9. [릴리스 태깅](#9-릴리스-태깅)
10. [Git Hooks (자동 검증)](#10-git-hooks-자동-검증)
11. [긴급 상황 대응](#11-긴급-상황-대응)
12. [전체 플로우차트](#12-전체-플로우차트)

---

## 1. 브랜치 모델

```
main ─────────────────────────────────────────────→ 프로덕션 (보호됨)
 │
 └─ dev ──────────────────────────────────────────→ 개발 통합 (보호됨)
     │
     ├─ feat/globe-optimization ──→ (dev로 머지)
     ├─ feat/new-threat-chart   ──→ (dev로 머지)
     ├─ fix/realtime-reconnect  ──→ (dev로 머지)
     ├─ refactor/stats-hook     ──→ (dev로 머지)
     └─ docs/update-prd         ──→ (dev로 머지)

main ←── hotfix/critical-bug ──→ (main + dev 양쪽에 머지)
```

### 브랜치 역할

| 브랜치 | 역할 | 보호 | 직접 커밋 | 배포 타겟 |
|--------|------|------|----------|----------|
| `main` | 프로덕션 안정 코드 | **보호됨** | **금지** | Vercel Production |
| `dev` | 개발 통합 브랜치 | **보호됨** | **금지** | Vercel Preview |
| `feat/*` | 기능 개발 | - | 허용 | - |
| `fix/*` | 버그 수정 | - | 허용 | - |
| `refactor/*` | 리팩토링 | - | 허용 | - |
| `docs/*` | 문서 수정 | - | 허용 | - |
| `perf/*` | 성능 최적화 | - | 허용 | - |
| `chore/*` | 빌드/의존성/설정 | - | 허용 | - |
| `hotfix/*` | 프로덕션 긴급 수정 | - | 허용 | Vercel Production |

### 핵심 원칙

> **`main`과 `dev`에는 절대 직접 커밋하지 않는다.**
> 모든 변경사항은 작업 브랜치에서 PR을 통해서만 머지한다.

---

## 2. 브랜치 네이밍 규칙

### 형식

```
<type>/<short-description>
```

### 규칙

| 규칙 | 예시 (O) | 예시 (X) |
|------|---------|---------|
| 소문자 + 하이픈 구분 | `feat/add-heatmap-layer` | `feat/AddHeatmapLayer` |
| 영문만 사용 | `fix/globe-arc-color` | `fix/글로브아크색상` |
| 동사로 시작 | `feat/add-country-filter` | `feat/country-filter` |
| 간결하게 (3~5단어) | `fix/realtime-reconnect` | `fix/fix-the-bug-where-realtime-connection-drops-after-5-minutes` |
| 이슈 번호 포함 (선택) | `feat/add-heatmap-#42` | - |

### 타입 접두사

| 접두사 | 용도 |
|--------|------|
| `feat/` | 새 기능 추가 |
| `fix/` | 버그 수정 |
| `refactor/` | 기능 변경 없는 코드 개선 |
| `docs/` | 문서 추가/수정 |
| `perf/` | 성능 최적화 |
| `chore/` | 빌드, 의존성, 설정 변경 |
| `hotfix/` | 프로덕션 긴급 수정 |

---

## 3. 커밋 컨벤션

### Conventional Commits 형식

```
<type>(<scope>): <subject>

<body>       ← (선택)

<footer>     ← (선택)
```

### type (필수)

| type | 의미 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(globe): add threat arc pulse animation` |
| `fix` | 버그 수정 | `fix(realtime): handle reconnection on timeout` |
| `style` | 코드 스타일 (포매팅, 세미콜론 등) | `style(header): fix indentation` |
| `refactor` | 기능 변경 없는 코드 수정 | `refactor(stats): extract bandwidth calculator` |
| `docs` | 문서 | `docs: update GIT_WORKFLOW.md` |
| `perf` | 성능 개선 | `perf(matrix-rain): move to offscreen canvas` |
| `chore` | 빌드/설정/의존성 | `chore: upgrade three.js to 0.181.0` |
| `test` | 테스트 | `test(stats): add protocol distribution test` |
| `ci` | CI/CD 설정 | `ci: add build check workflow` |

### scope (선택, 권장)

변경 대상 컴포넌트/모듈명을 소문자로:

```
globe, stats, threat, log, header, matrix-rain, glitch,
realtime, supabase, generator, config, deps
```

### subject 규칙

| 규칙 | 예시 (O) | 예시 (X) |
|------|---------|---------|
| 영문 소문자로 시작 | `add heatmap layer` | `Add heatmap layer` |
| 명령형(imperative) 사용 | `add filter option` | `added filter option` |
| 마침표 없음 | `fix arc color` | `fix arc color.` |
| 50자 이내 | `add protocol filter` | `add a new filter component that allows users to filter by protocol type` |
| "왜" 보다 "무엇"을 기술 | `add protocol filter` | `because users need to filter` |

### body 규칙 (선택)

- 72자에서 줄바꿈
- "무엇"과 "왜"를 설명 (방법은 코드가 설명)
- 빈 줄로 subject와 구분

### footer 규칙 (선택)

```
# 이슈 참조
Refs: #42

# 브레이킹 체인지
BREAKING CHANGE: renamed useTrafficStream return value

# 공동 작성자
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 좋은 커밋 vs 나쁜 커밋

```bash
# 좋은 커밋 (O)
feat(globe): add threat level-based arc color gradient
fix(realtime): prevent duplicate subscription on remount
perf(matrix-rain): reduce canvas draw calls by 40%
docs: add Supabase setup guide to DEVELOPMENT.md

# 나쁜 커밋 (X)
update code
fix bug
WIP
asdf
feat: 기능 추가           ← 한글 금지 (subject에서)
feat(globe): Add Feature  ← 대문자 시작 금지
```

### 커밋 단위

- **하나의 커밋 = 하나의 논리적 변경**
- 리팩토링과 기능 추가를 하나의 커밋에 섞지 않는다
- "WIP" 커밋은 PR 머지 전에 squash한다

---

## 4. 작업 흐름 (Feature Flow)

### 4.1 브랜치 생성

```bash
# 반드시 dev에서 분기
git checkout dev
git pull origin dev
git checkout -b feat/add-heatmap-layer
```

### 4.2 작업 + 커밋

```bash
# 작업 후 관련 파일만 스테이징
git add components/dashboard/HeatmapLayer.tsx
git add hooks/useHeatmapData.ts
git commit -m "feat(heatmap): add base heatmap layer component"

# 추가 작업
git add components/dashboard/HeatmapLayer.tsx
git commit -m "feat(heatmap): add intensity color gradient"
```

### 4.3 dev 동기화 (리베이스)

```bash
# 작업 브랜치에서 dev의 최신 변경사항 가져오기
git fetch origin
git rebase origin/dev
# 충돌 발생 시 해결 후:
# git add <resolved-files>
# git rebase --continue
```

### 4.4 푸시 + PR 생성

```bash
git push origin feat/add-heatmap-layer
# GitHub에서 feat/add-heatmap-layer → dev PR 생성
```

### 4.5 리뷰 + 머지

- PR 리뷰 통과
- `npm run build` 성공 확인
- **Squash and Merge** 로 dev에 머지
- 머지 후 작업 브랜치 삭제

### 4.6 dev → main 릴리스

```bash
# dev가 안정적인 상태일 때
# GitHub에서 dev → main PR 생성
# "Create a merge commit" 로 머지
```

---

## 5. 핫픽스 흐름 (Hotfix Flow)

프로덕션(main)에 긴급 수정이 필요한 경우:

```bash
# 1. main에서 분기
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-crash

# 2. 수정 + 커밋
git add .
git commit -m "fix(realtime): prevent crash on null event payload"

# 3. main으로 PR → 머지
git push origin hotfix/fix-critical-crash
# GitHub에서 hotfix/fix-critical-crash → main PR 생성
# 리뷰 후 머지

# 4. dev에도 반영 (중요!)
git checkout dev
git pull origin dev
git merge origin/main
git push origin dev
```

---

## 6. PR (Pull Request) 규칙

### PR 제목 형식

커밋 컨벤션과 동일:

```
feat(globe): add threat arc pulse animation
fix(realtime): handle reconnection timeout
```

### PR 본문 템플릿

```markdown
## 변경 사항
- (무엇을 변경했는지 bullet point로)

## 변경 이유
- (왜 이 변경이 필요한지)

## 테스트
- [ ] `npm run build` 성공
- [ ] `npm run lint` 통과
- [ ] 로컬에서 해당 기능 동작 확인
- [ ] 기존 기능에 영향 없음 확인

## 스크린샷 (UI 변경 시)
(해당되는 경우 첨부)
```

### PR 머지 조건

| 조건 | 필수 |
|------|------|
| 빌드 성공 (`npm run build`) | **필수** |
| 린트 통과 (`npm run lint`) | **필수** |
| 1명 이상 리뷰 승인 | 권장 |
| 충돌 없음 | **필수** |
| PR 설명 작성 | **필수** |

### PR 머지 방법

| 타겟 | 머지 전략 | 이유 |
|------|----------|------|
| `feat/* → dev` | **Squash and Merge** | 작업 커밋을 하나로 정리 |
| `fix/* → dev` | **Squash and Merge** | 깔끔한 히스토리 |
| `dev → main` | **Create a Merge Commit** | dev 이력 보존 |
| `hotfix/* → main` | **Squash and Merge** | 단일 수정 커밋 |

---

## 7. 머지 전략

### Rebase 원칙

```
작업 브랜치는 항상 타겟 브랜치 위에 rebase 한다.
merge commit으로 동기화하지 않는다.
```

```bash
# (O) 올바른 동기화
git fetch origin
git rebase origin/dev

# (X) 잘못된 동기화
git merge origin/dev    ← 작업 브랜치에서 하지 말 것
```

### 충돌 해결 원칙

1. `git rebase`로 충돌 발생 시 **파일별로 수동 해결**
2. 해결 후 `git add <file>` → `git rebase --continue`
3. 확신이 없으면 `git rebase --abort`로 롤백
4. **절대 `--force`로 밀어붙이지 않는다**

---

## 8. 금지 사항

### 절대 하지 말 것

| 금지 항목 | 이유 |
|----------|------|
| `main`에 직접 push | 프로덕션 안정성 파괴 |
| `dev`에 직접 push | 통합 브랜치 오염 |
| `git push --force` (main/dev) | 다른 사람의 커밋 삭제 |
| `git reset --hard` (공유 브랜치) | 히스토리 파괴 |
| `.env.local` 커밋 | 시크릿 노출 |
| `node_modules/` 커밋 | 불필요한 대용량 파일 |
| 빌드 깨진 상태로 PR 머지 | dev/main 오염 |
| 한 커밋에 여러 기능 혼합 | 롤백 불가능 |
| "WIP" 상태로 PR 머지 | 불완전한 코드 유입 |

### force push가 허용되는 유일한 경우

```bash
# 자기 작업 브랜치에서만, rebase 후 허용
git push --force-with-lease origin feat/my-feature
```

> `--force` 대신 반드시 `--force-with-lease` 사용 (원격에서 다른 변경이 있으면 거부됨)

---

## 9. 릴리스 태깅

### Semantic Versioning

```
v<MAJOR>.<MINOR>.<PATCH>
```

| 변경 유형 | 버전 업 | 예시 |
|----------|---------|------|
| 호환성 깨지는 변경 | MAJOR | v1.0.0 → v2.0.0 |
| 새 기능 추가 | MINOR | v2.0.0 → v2.1.0 |
| 버그 수정 | PATCH | v2.1.0 → v2.1.1 |

### 태깅 절차

```bash
# dev → main 머지 후
git checkout main
git pull origin main
git tag -a v2.1.0 -m "feat: add heatmap layer, fix realtime reconnect"
git push origin v2.1.0
```

---

## 10. Git Hooks (자동 검증)

### pre-commit: 빌드 + 린트 자동 검증

프로젝트에 다음 스크립트가 설정되어 커밋 전 자동으로 검증합니다:

```bash
# .husky/pre-commit (설정 시)
npm run lint
npm run build
```

### commit-msg: 커밋 메시지 형식 검증

```bash
# .husky/commit-msg (설정 시)
# Conventional Commits 형식이 아니면 커밋 거부
# 패턴: ^(feat|fix|style|refactor|docs|perf|chore|test|ci)(\(.+\))?: .+
```

### 수동 검증 (hooks 미설정 시)

hooks가 설정되지 않은 환경에서는 **커밋 전 반드시 수동으로 확인**:

```bash
npm run lint && npm run build
# 둘 다 통과한 경우에만 커밋
```

---

## 11. 긴급 상황 대응

### main이 깨진 경우

```bash
# 1. 즉시 이전 커밋으로 revert
git checkout main
git revert HEAD
git push origin main

# 2. 원인 파악 후 hotfix 브랜치에서 수정
git checkout -b hotfix/revert-and-fix
```

### 잘못된 머지를 한 경우

```bash
# PR 머지를 되돌리기 (GitHub UI에서)
# → PR 페이지 → "Revert" 버튼 → revert PR 생성 → 머지
```

### 시크릿이 커밋된 경우

```bash
# 1. 즉시 해당 시크릿 폐기/로테이션 (Supabase Dashboard에서)
# 2. git history에서 제거
git filter-branch --force --tree-filter \
  'rm -f .env.local' HEAD
git push --force-with-lease origin main

# 3. 새 시크릿으로 .env.local 재설정
```

---

## 12. 전체 플로우차트

```
[새 작업 시작]
     │
     ▼
 dev에서 분기 ─────────────── git checkout -b feat/xxx
     │
     ▼
 작업 + 커밋 ─────────────── git commit (Conventional Commits)
     │
     ▼
 lint + build 확인 ────────── npm run lint && npm run build
     │
     ├─ 실패 → 수정 후 재커밋
     │
     ▼
 dev 리베이스 ─────────────── git rebase origin/dev
     │
     ├─ 충돌 → 해결 → continue
     │
     ▼
 push ────────────────────── git push origin feat/xxx
     │
     ▼
 PR 생성 ─────────────────── feat/xxx → dev
     │
     ▼
 리뷰 + CI 확인
     │
     ├─ 수정 요청 → 추가 커밋 → 재리뷰
     │
     ▼
 Squash and Merge ─────────── dev에 머지
     │
     ▼
 작업 브랜치 삭제
     │
     ▼
 [릴리스 시점]
     │
     ▼
 dev → main PR ────────────── Create a Merge Commit
     │
     ▼
 태그 생성 ────────────────── git tag -a v2.x.x
     │
     ▼
 Vercel 자동 배포 ─────────── Production 반영
```

---

## 빠른 참조 카드

```bash
# 새 기능 시작
git checkout dev && git pull && git checkout -b feat/xxx

# 작업 중 dev 동기화
git fetch origin && git rebase origin/dev

# 커밋
git add <files> && git commit -m "feat(scope): description"

# 푸시
git push origin feat/xxx

# PR 머지 후 정리
git checkout dev && git pull && git branch -d feat/xxx

# 핫픽스
git checkout main && git pull && git checkout -b hotfix/xxx
# ... 수정 후 main에 PR, 머지 후 dev에도 반영
```
