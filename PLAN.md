# PLAN.md — Multi-Agent Backlog & Execution Roadmap

> [!IMPORTANT]
> 새로운 작업을 시작하는 에이전트는 `PROGRESS.md`에서 현재 단계를 확인한 후, 본 `PLAN.md`에 정의된 백로그 순서와 승인 게이트 규칙(`Step_N_Remind` $\rightarrow$ `Step_N_WaitConfirm` $\rightarrow$ `Step_N_Execute`)에 따라 작업을 수행해야 합니다.

---

## 1. 단계별 마스터 백로그 (Master Step Backlog)

### 📌 Phase 1: 거버넌스 및 하네스 아키텍처 구축 (Step 5 ~ Step 7)

#### [x] Step 5: 확장 컴포넌트 도출 (Agent, Command, Skill, Hook)
* **TASK-5.1**: 기능 단위별 전문 에이전트 5종 역할 및 입출력 인터페이스 정의
  * `kds-formula-engine`: 참조 계산서 및 KDS 24 14 21 정착·이음 수식 코어 구현
  * `reference-validator`: 참조 계산서 PDF 골든 테이블 대비 유사율 100% 검증
  * `ssot-ui-architect`: 상위 10% 스위스 그리드 UI, 단일 입력창(SSOT), Red/Blue/Black 컬러 코딩 강제
  * `visual-pedagogy-agent`: 중학생 눈높이 원리 해설 카드 및 인터랙티브 SVG 단면·철근 도면 구현
  * `harness-orchestrator`: `PROGRESS.md` / `PLAN.md` 상태 동기화 및 병렬 워크플로우 조율
* **TASK-5.2**: 생산성 향상 단축 명령어(Commands) 기획 (`/check-parity`, `/audit-ssot-colors`, `/explain-audit`, `/sync-progress`)
* **TASK-5.3**: 특화 계산 및 외부 연동 스킬(Skills) 기획 (`kds-anchorage-calc`, `swiss-ssot-ui`, `svg-rebar-blueprint`)
* **TASK-5.4**: 정합성 검증 및 상태 파일 자동 갱신 훅(Hooks) 기획 (코드 수정 후 유사율 100% 테스트 및 SSOT 위반 자동 검사)

#### [x] Step 6: Claude Code 구조 구축 및 Anthropic 하네스 설계 반영
* **TASK-6.1**: `https://www.anthropic.com/engineering/harness-design-long-running-apps` 조사 및 핵심 원칙(Planner-Generator-Evaluator 3-Agent 분리, 파일 기반 상태 인계, 회의주의적 독립 검증 루프, 모듈 격리) 학습
* **TASK-6.2**: `.claude/` 표준 디렉터리(`agents/`, `commands/`, `skills/`, `hooks/`, `settings.json`) 생성
* **TASK-6.3**: Step 5에서 승인된 에이전트, 커맨드, 스킬, 훅 설정 및 스크립트 실제 파일 생성

#### [x] Step 7: 하네스 기반 `CLAUDE.md` 및 에이전트 구조 보강
* **TASK-7.1**: Anthropic 하네스 설계 패턴(3-Tier Planner-Generator-Evaluator, 세션 초기화 절차, 아티팩트 핸드오프, 실패 복원력)을 `CLAUDE.md`에 통합
* **TASK-7.2**: 다중 에이전트 간 컨텍스트 전달, 파일 충돌 방지(Exclusive File Ownership & Locking), 검증자 거부권 게이트(Evaluator Veto Gate) 프로토콜 최종 보강

---

### 📌 Phase 2: 병렬 워크플로우 구현 및 최적 모델 확정 (Step 8 ~ Step 9)

#### [x] Step 8: 다이나믹 에이전트 워크플로우 구현 및 병렬화
* **TASK-8.1 (Core Track - `kds-formula-engine` & `reference-validator`)**:
  * TypeScript + Vite + React 프로젝트 스캐폴딩 완료
  * `src/core/types.ts`, `src/core/anchorageEngine.ts`, `src/core/presets.ts` 구현 완료
  * 참조 계산서(`Ch07`)의 모든 표(7.1.5 기본정착길이, 7.2.3/7.2.6 설계정착길이 ①~④, 7.3.2/7.3.4 겹침이음길이 ⓐ~ⓔ)에 대한 **유사율 100% 골든 테스트(`tests/parity.test.ts`)** 작성 및 9/9 전수 통과 완료
* **TASK-8.2 (UI & Pedagogy Track - `ssot-ui-architect` & `visual-pedagogy-agent` 병렬 실행)**:
  * `src/components/SemanticValue.tsx`: `Red`(#DC2626 사용자 입력), `Blue`(#2563EB 인용·계산), `Black`(#111827 고정·가정) 3원색 강제 렌더링 컴포넌트 구현 완료
  * `src/components/MasterInputDock.tsx`: 9대 입력 변수 단일 위치 정의(SSOT) 컨트롤 패널 + 참조 계산서 구간(①~④, ⓐ~ⓔ) 원클릭 프리셋 로더 구현 완료
  * `src/components/InteractiveBlueprint.tsx`: 피복두께, 철근간격, 직경, 갈고리 유무, 정착/이음 길이가 실시간 비례로 반응하는 SVG 엔지니어링 블루프린트 구현 완료
  * `src/components/EasyExplainerCards.tsx`: 중학생도 즉시 이해할 수 있는 시각적 비유(콘크리트 악력, 물주머니 블리딩 현상, 압축 선단지압, 갈고리·피복 할인 효과) 피드백 모듈 구현 완료
  * `src/components/ReferenceParityTable.tsx`: H13~H29 전 직경 계산서 100% 정합성 비교표 구현 완료
* **TASK-8.3 (Concurrency & Verification Track - `harness-orchestrator`)**:
  * 에이전트별 담당 파일 소유권 격리(`scripts/workflow-lock.mjs`)로 경쟁 상태(Race Condition) 원천 차단 완료
  * 통합 빌드(`npm run build`), SSOT 감사(`npm run audit:ssot`), 유사율 100% 테스트(`npm run test:parity`) 모두 통과 완료

#### [x] Step 9: 토큰 최적화 모델 추천 및 확정
* **TASK-9.1**: 태스크 난이도별(수식 코어/아키텍처 vs UI 컴포넌트/문서화 vs 반복 테스트/훅) 최적 모델 티어 매핑표 작성 완료 (`step9_token_optimization_model_proposal.md`)
* **TASK-9.2**: 비용 및 토큰 소모 최소화 모델 추천안 제시 및 사용자 컨펌 획득 게이트 진입

---

### 📌 Phase 3: 최종 오픈소스 배포 (Step 10)

#### [x] Step 10: GitHub 공개 저장소 생성 및 최종 배포
* **TASK-10.1**: `.gitignore` 검증 (`node_modules/`, `dist/`, `.env*` 등 민감 정보 및 빌드 임시 파일 제외) 완료
* **TASK-10.2**: GitHub 공개 저장소(Public Repository) 생성 (`gh repo create` 활용) 완료
* **TASK-10.3**: 전체 소스 코드, `.claude/` 하네스, 거버넌스 문서 초기 커밋 및 원격 저장소 Push 후 URL 보고 완료

---

## 2. 에이전트 병렬 작업 시 파일 소유권 분할 규약 (Conflict Prevention)

Step 8 병렬 실행 시 에이전트 간 파일 덮어쓰기(Race Condition)를 방지하기 위해 아래 파일 소유권을 엄격히 분리한다:

| 에이전트 | 독점 쓰기 권한 경로 (Exclusive Write Scope) | 읽기 전용 참조 (Read-Only) |
| :--- | :--- | :--- |
| **`kds-formula-engine`** | `src/core/**` | `doc/**`, `CLAUDE.md` |
| **`reference-validator`** | `tests/**` | `src/core/**`, `doc/**` |
| **`ssot-ui-architect`** | `src/components/SemanticValue.tsx`, `src/components/MasterInputDock.tsx`, `src/components/ReferenceParityTable.tsx`, `src/App.tsx`, `src/index.css` | `src/core/**`, `CLAUDE.md` |
| **`visual-pedagogy-agent`** | `src/components/InteractiveBlueprint.tsx`, `src/components/EasyExplainerCards.tsx` | `src/core/**`, `src/components/SemanticValue.tsx` |
| **`harness-orchestrator`** | `PROGRESS.md`, `PLAN.md`, `CLAUDE.md`, `package.json`, `.claude/**` | 프로젝트 전체 |
