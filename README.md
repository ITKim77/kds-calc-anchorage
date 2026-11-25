# 📐 KDS기반 철근 정착 및 겹이음길이 계산기 (`kds-calc-anchorage`)

> **Live Web App (GitHub Pages)**: **[https://itkim77.github.io/kds-calc-anchorage/](https://itkim77.github.io/kds-calc-anchorage/)**  
> **Reference Standard**: `KDS 24 14 21:2025 (콘크리트교 설계기준 - 한계상태설계법 4.5.4 ~ 4.5.5)` & `CEB-FIP 1990 / 2010`  
> **Reference Calculation Parity**: `[쌓기부 역T형옹벽] Ch07 철근 정착 및 이음길이(변경)_26.11.24.pdf` 대비 **유사율 100.0% 검증 완료 (`9/9 Golden Tests Passed`)**  
> **Live Sync Status**: `VERIFIED (9/9 Parity Tests PASS | SSOT 3-Color PASS | Auto-Deploy Active)`

---

## 1. 프로젝트 개요 (Project Overview)

**KDS기반 철근 정착 및 겹이음길이 계산기**는 참조 구조계산서(`Ch07 철근 정착 및 이음길이`)의 엔지니어링 로직과 반올림 규칙을 100% 정합하게 구현한 웹 기반 구조설계 소프트웨어입니다.

* **9대 핵심 변수 단일 입력(SSOT)**: 철근강도($f_y$), 콘크리트 강도($f_{ck}$), 피복두께($c$), 철근간격($\text{CTC}$), 철근직경($d_b$), 철근위치($\eta_1$ 양호/불량), 갈고리 형성/미형성(철근형상), 겹침이음계수($\alpha_{6,lo}$), 철근사용률($A_{s,req}/A_{s,used}$)을 입력하면 **설계정착길이($l_{bd}$)** 및 **설계겹이음길이($l_o$)**를 즉시 산정합니다.
* **중학생도 30초 만에 이해하는 직관적 피드백**: 복잡한 한계상태설계법 수식을 일상 비유(콘크리트의 악력 $f_{bd}$, 블리딩 물주머니 현상 $\eta_1$, 갈고리·살 두께 할인 보너스 $\alpha_1\cdot\alpha_2$, 압축 끝단 받침 힘 $-15d_b$, 안전 최소 마지노선 $15d_b$)와 **실시간 비례 반응형 SVG 블루프린트**로 시각화합니다.
* **상위 10% Swiss Precision Engineering UI**: 평범한 대시보드 템플릿을 배제하고 스위스 타이포그래피 그리드(Swiss International Grid)와 엄격한 **3원색 데이터 출처 컬러 코딩**을 적용했습니다.

---

## 2. UI/UX 데이터 표현 및 단일 출처 원칙 (SSOT & 3-Color Semantic Governance)

본 애플리케이션은 화면에 표시되는 모든 수치와 컨트롤에 대해 엄격한 단일 진실 공급원(SSOT) 및 3원색 컬러 코딩 규칙을 강제합니다:

| 데이터 구분 | 시맨틱 컬러 | HEX 코드 | 적용 변수 및 규칙 |
| :--- | :---: | :---: | :--- |
| 🔴 **사용자 입력값 (User Input)** | **Red** | `#DC2626` | 9대 입력 변수 (`fy`, `fck`, `c`, `CTC`, `db`, `철근위치`, `철근형상`, `α6,lo`, `철근사용률`). 중복 입력창을 엄격히 금지하며 오직 좌측 **`MasterInputDock`** 한 곳에서만 정의·조작됨 |
| 🔵 **인용 및 계산값 (Cited & Computed)** | **Blue** | `#2563EB` | KDS 기준 인용/유도값($f_{cm}, f_{ctm}, f_{ctk}$) 및 시스템 계산 결과($f_{yd}, f_{bd}, \eta_1, \eta_2, l_{b,t}, l_{b,c}, C_d, \alpha_1, \alpha_2, \alpha, l_{bd,\min}, l_{o,\min}, l_{bd}, l_o$) |
| ⚫ **가정값 또는 고정값 (Assumed & Constant)** | **Black** | `#111827` | 시스템 고정 상수 및 기본 가정값 ($\phi_c = 0.65$, $\phi_s = 0.90$, $\alpha_{3\sim5} = 1.0$, 부착상수 $2.25$, 선단지압 $15d_b$, 최소길이 계수 $15d_b, 100\text{mm}, 200\text{mm}$) |

---

## 3. 도메인 수식 및 참조 계산서 100% 정합성 검증 (Domain Logic & 100% Parity)

### 3.1. 핵심 산정 수식 요약
1. **설계 부착강도 ($f_{bd}$)**:
   $$f_{bd} = 2.25 \cdot f_{ctk} \cdot \phi_c \cdot \eta_1 \cdot \eta_2$$
   * $f_{ctk} = 0.7 \cdot f_{ctm} = 0.7 \times \left(0.30 \cdot (f_{ck} + \Delta f)^{2/3}\right)$ ($f_{ck}=35\text{ MPa}$일 때 $f_{ctk} = 2.415\text{ MPa}$)
2. **기본정착길이 ($l_{b,t}, l_{b,c}$)**:
   * 인장측: $l_{b,t} = \text{round}_{10}\left(\frac{d_b \cdot f_{yd}}{4 \cdot f_{bd}}\right) = \text{round}_{10}\left(25.48 \cdot \frac{d_b}{\eta_1}\right)$
   * 압축측(선단지압 $15d_b$ 반영): $l_{b,c} = \text{round}_{10}\left(25.48 \cdot \frac{d_b}{\eta_1} - 15 d_b\right)$
3. **설계정착길이 ($l_{bd}$) 및 설계겹이음길이 ($l_o$)**:
   * $l_{bd} = \max\left(\text{round}_{10}\left(\alpha \cdot l_b \cdot \frac{A_{s,req}}{A_{s,used}}\right),\ \text{round}_{10}(15 d_b)\right)$
   * $l_o = \max\left(\text{round}_{10}\left(\alpha_o \cdot l_b \cdot \frac{A_{s,req}}{A_{s,used}}\right),\ \text{round}_{10}(15 d_b)\right)$

### 3.2. 참조 계산서(`Ch07`) 골든 정답 대조표 (`100.0% Exact Match`)

| 직경 | $l_{b,t}$ (인장) | $l_{b,c}$ (압축) | 최소길이 ($15d_b$) | 정착 ①·② ($C_d=50$, 인장·갈고리) | 정착 ③·④ (압축측) | 이음 ⓐ·ⓑ ($C_d=30$, 인장·직선) | 이음 ⓒ ($C_d=45$, 인장·직선) | 이음 ⓓ·ⓔ (압축측) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **H13** | `330` | `140` | `200` | $\alpha=0.6 \rightarrow$ **`200`** | **`200`** | $\alpha_o=1.2 \rightarrow$ **`200`** (`계산 280`) | $\alpha_o=1.1 \rightarrow$ **`240`** | **`200`** (`계산 150`) |
| **H16** | `410` | `170` | `240` | $\alpha=0.7 \rightarrow$ **`280`** | **`240`** | $\alpha_o=1.3 \rightarrow$ **`280`** (`계산 370`) | $\alpha_o=1.1 \rightarrow$ **`310`** | **`240`** (`계산 180`) |
| **H19** | `480` | `200` | `290` | $\alpha=1.0 \rightarrow$ **`480`** | **`290`** | $\alpha_o=1.4 \rightarrow$ **`480`** (`계산 460`) | $\alpha_o=1.2 \rightarrow$ **`400`** | **`290`** (`계산 210`) |
| **H22** | `560` | `230` | `330` | $\alpha=1.0 \rightarrow$ **`560`** | **`330`** | $\alpha_o=1.4 \rightarrow$ **`560`** (`계산 560`) | $\alpha_o=1.3 \rightarrow$ **`500`** | **`330`** (`계산 240`) |
| **H25** | `640` | `260` | `380` | $\alpha=1.0 \rightarrow$ **`640`** | **`380`** | $\alpha_o=1.5 \rightarrow$ **`640`** (`계산 650`) | $\alpha_o=1.3 \rightarrow$ **`590`** | **`380`** (`계산 270`) |
| **H29** | `740` | `300` | `440` | $\alpha=1.0 \rightarrow$ **`740`** | **`440`** | $\alpha_o=1.5 \rightarrow$ **`740`** (`계산 770`) | $\alpha_o=1.4 \rightarrow$ **`710`** | **`440`** (`계산 320`) |

---

## 4. 아키텍처 및 Anthropic Multi-Agent Harness 구조

```text
kds-calc-anchorage/
├── CLAUDE.md                 # 프로젝트 거버넌스 헌법 및 3-Tier 하네스 규약
├── PROGRESS.md               # 에이전트 간 실시간 진행 상태 및 검증 지표 추적
├── PLAN.md                   # 마스터 백로그 및 에이전트 독점 쓰기 권한(File Ownership) 정의
├── .github/workflows/
│   └── deploy.yml            # main 브랜치 Push 시 유사율 100% 검증 + GitHub Pages 즉시 자동 배포
├── .claude/                  # Claude Code 확장 하네스 (5 Agents, 4 Commands, 3 Skills, 3 Hooks)
├── doc/                      # 참조 계산서 PDF 원본
├── src/
│   ├── core/                 # 순수 TypeScript KDS 24 14 21 정착·이음 계산 엔진
│   └── components/           # SSOT MasterInputDock, SemanticValue, InteractiveBlueprint 등
└── tests/
    └── parity.test.ts        # 참조 계산서 전 구간 유사율 100% 골든 검증 테스트
```

---

## 5. 실행 및 검증 명령어 (Commands)

```bash
# 의존성 설치
npm install

# 참조 계산서(Ch07) 유사율 100% 골든 테스트 실행
npm run test:parity

# SSOT 단일 입력창 위반 정적 감사 훅 실행
npm run audit:ssot

# 프로덕션 빌드 검증
npm run build
```

---

## 6. 자동 반영 및 실시간 배포 파이프라인 (Continuous Sync & GitHub Pages)

본 저장소는 `.github/workflows/deploy.yml`을 통해 **`main` 브랜치에 변경사항이 커밋·푸시될 때마다** 자동으로:
1. `npm run audit:ssot` (SSOT 단일 입력 감사)
2. `npm run test:parity` (참조 계산서 유사율 100% 검증)
3. `npm run build` (정적 프로덕션 번들 빌드)
를 수행한 뒤 **[https://itkim77.github.io/kds-calc-anchorage/](https://itkim77.github.io/kds-calc-anchorage/)** 에 즉시 배포합니다.
