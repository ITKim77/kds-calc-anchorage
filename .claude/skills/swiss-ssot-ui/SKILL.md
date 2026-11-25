---
name: swiss-ssot-ui
description: 상위 10% 스위스 엔지니어링 그리드 미학과 SSOT 단일 입력 패널 및 Red(사용자 입력)/Blue(인용·계산)/Black(가정·고정) 3원색 시맨틱 컬러 코딩을 강제하는 UI 디자인 스킬.
---

# Top 10% Swiss Engineering UI & SSOT Color Coding Skill (`swiss-ssot-ui`)

본 스킬은 `에이전트용_작업지시서_v1.4.0.md`의 **2.3. UI/UX 데이터 표현 및 단일 출처 원칙 (`ui_rules.enabled: true`)**과 **상위 10% UI 디자인 목표**를 달성하기 위한 프론트엔드 설계 규약입니다.

## 1. 3원색 데이터 출처 시맨틱 컬러 코딩 (Mandatory Color Tokens)

화면 상에 노출되는 모든 숫자, 수식 변수, 배지, 입력 컨트롤은 데이터 출처에 따라 반드시 다음 3가지 색상 중 하나로만 표기되어야 합니다:

1. 🔴 **사용자 입력값 (`Red` — `#DC2626`)**:
   * **적용 대상**: 9대 사용자 입력 변수 (`철근강도 fy`, `콘크리트 강도 fck`, `피복두께 c`, `철근간격 CTC`, `철근직경 db`, `철근위치 양호/불량`, `갈고리 형성/미형성`, `겹침이음계수 α6,lo`, `철근사용률 As,req/As,used`).
   * **스타일**: `text-[#DC2626]`, `border-[#DC2626]`, `bg-red-50/70`, 입력 컨트롤 포커스 링 `ring-red-600`.
2. 🔵 **인용 및 계산값 (`Blue` — `#2563EB`)**:
   * **적용 대상**: KDS 기준 인용/유도값($f_{ctk}, f_{cm}, f_{ctm}$) 및 시스템 계산 결과($f_{yd}, f_{bd}, \eta_1, \eta_2, l_{b,t}, l_{b,c}, a, C_d, \alpha_1, \alpha_2, \alpha_t, \alpha_c, \alpha_o, l_{bd,\min}, l_{o,\min}, l_{bd}, l_o$).
   * **스타일**: `text-[#2563EB]`, `border-[#2563EB]`, `bg-blue-50/70`.
3. ⚫ **가정값 또는 고정값 (`Black` — `#111827`)**:
   * **적용 대상**: 시스템 상수 및 고정 가정값 ($\phi_c = 0.65$, $\phi_s = 0.90$, $\alpha_3 = \alpha_4 = \alpha_5 = \alpha_{6,lbd} = 1.0$, 수식 상수 $2.25, 4, 15, 0.3, 0.6, 100\text{mm}, 200\text{mm}$).
   * **스타일**: `text-[#111827]`, `border-slate-800`, `bg-slate-100`.

## 2. 단일 진실 공급원 (SSOT Input Governance)
* 동일 변수의 입력창을 여러 곳에 분산 배치하는 것을 엄격히 금지합니다.
* 모든 `<input>`, `<select>`, 세그먼트 토글 버튼은 오직 `src/components/MasterInputDock.tsx` 컴포넌트 한 곳에만 배치합니다.

## 3. 상위 10% 스위스 엔지니어링 미학 (Swiss Precision Instrument Panel)
* **Grid-First Layout**: 둥글고 흐릿한 카드 나열 대신, 건축 구조계산서와 정밀 계측기(Braun / Linear / Swiss Grid)에서 영감을 얻은 `1px solid #CBD5E1` 헤어라인 그리드와 명확한 섹션 인덱스(`01 / INPUTS`, `02 / LIVE BLUEPRINT`, `03 / EASY EXPLAINER`, `04 / KDS PARITY TABLE`)를 사용합니다.
* **Typography**: 한글 해설은 가독성이 뛰어난 `Pretendard`, 모든 수식·치수·계수는 `JetBrains Mono` (`tabular-nums`) 고정폭 폰트를 사용하여 소수점 자릿수 정렬을 완벽히 맞춥니다.
