---
description: UI 단일 입력 원칙(SSOT) 위반 여부와 Red(사용자 입력)/Blue(인용·계산)/Black(가정·고정) 3원색 컬러 코딩 준수 상태를 전수 감사합니다.
---

# `/audit-ssot-colors` — SSOT 단일 입력 및 3원색 컬러 코딩 전수 감사

`에이전트용_작업지시서_v1.4.0.md` 2.3절(`ui_rules.enabled: true`) 준수 여부를 다음 절차로 감사하십시오:

1. **SSOT 단일 입력 위치 검증**:
   * `src/components/` 하위 모든 `.tsx` 파일에서 `<input`, `<select`, `onChange` 등 사용자 입력 컨트롤이 오직 `MasterInputDock.tsx` 파일 한 곳에만 존재하는지 검색합니다.
   * 9대 입력 변수(`fy`, `fck`, `cover`, `ctc`, `db`, `bondCondition`, `barShape`, `spliceAlpha6`, `rebarUsageRatio`)가 각 1회씩만 입력 컨트롤로 정의되었는지 확인합니다.
2. **3원색 시맨틱 컬러 코딩 검증**:
   * 🔴 **사용자 입력값 (`Red`)**: 9대 입력 변수가 화면에 표시될 때 붉은색(`#DC2626` / `text-red-600` / `border-red-600`)으로 렌더링되는지 확인합니다.
   * 🔵 **인용 및 계산값 (`Blue`)**: $f_{yd}, f_{ctk}, f_{bd}, l_{b,t}, l_{b,c}, C_d, \alpha_1, \alpha_2, \alpha, l_{bd,\min}, l_{o,\min}, l_{bd}, l_o$가 파란색(`#2563EB` / `text-blue-600`)으로 렌더링되는지 확인합니다.
   * ⚫ **가정값 및 고정값 (`Black`)**: $\phi_c=0.65, \phi_s=0.90, \alpha_{3\sim5}=1.0$, 상수 $2.25, 4, 15d_b, 100\text{mm}, 200\text{mm}$가 검은색(`#111827` / `text-gray-900`)으로 렌더링되는지 확인합니다.
3. 감사 결과를 `[PASS / FAIL]` 체크리스트 표로 보고하십시오.
