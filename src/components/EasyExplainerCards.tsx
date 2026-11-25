import React from 'react';
import { AnchorageInputState, RebarCalculationResult } from '../core/types';
import { SemanticValue } from './SemanticValue';

export interface EasyExplainerCardsProps {
  state: AnchorageInputState;
  result: RebarCalculationResult;
}

/**
 * EasyExplainerCards.tsx
 * "중학생도 30초 만에 이해하는 단계별 판정 & 원리 피드백"
 * - Top Headline Verdict Banner: 최종 설계정착길이(lbdDesign) & 설계겹이음길이(loDesign) 및 지배 원인 요약
 * - 4 Step-by-Step Analogy Cards:
 *   Step 1. 콘크리트의 악력 (부착강도 fbd)
 *   Step 2. 기본정착길이 (lb) & 압축 끝단 받침 힘 (-15db)
 *   Step 3. 갈고리 & 콘크리트 살 두께 할인 보너스 (α1, α2, α6)
 *   Step 4. 철근사용률(As,req/As,used)과 최소 안전 마지노선 (15db)
 *
 * CRITICAL RULE:
 * - Strictly uses <SemanticValue /> for Red(input), Blue(computed), Black(constant).
 * - NEVER includes <input> or <select> tags!
 */
export const EasyExplainerCards: React.FC<EasyExplainerCardsProps> = ({
  state,
  result,
}) => {
  const isTension = state.stressZone === 'tension';
  const isPoorBond = state.bondCondition === 'poor';
  const isHook = state.barShape === 'hook' && isTension;

  return (
    <section
      aria-label="중학생도 30초 만에 이해하는 단계별 판정 및 원리 피드백"
      className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden"
    >
      {/* ====================================================================
          TOP HEADLINE VERDICT BANNER
         ==================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 border-b border-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono text-xs font-bold">
              30초 핵심 판정
            </span>
            <h2 className="text-sm md:text-base font-bold tracking-tight">
              중학생도 30초 만에 이해하는 단계별 판정 & 물리적 원리 피드백
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-950/60 px-3 py-1 rounded border border-slate-700">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span className="text-slate-200">사용자 입력(Red)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="text-slate-200">인용/계산값(Blue)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-200">고정상수(Black)</span>
            </span>
          </div>
        </div>

        {/* Verdict Summary Box */}
        <div className="bg-white text-slate-900 rounded-md p-3.5 border border-slate-200 shadow-inner grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Anchorage Final Verdict */}
          <div className="flex items-start gap-3 p-2.5 rounded bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs">
              l_bd
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-slate-900 text-sm mb-0.5 flex flex-wrap items-center gap-1.5">
                <span>① 최종 설계정착길이:</span>
                <SemanticValue source="computed" value={result.lbdDesign} unit="mm" badge />
                <span className="text-[11px] font-normal text-slate-600">
                  (철근 <SemanticValue source="input" value={`H${state.db}`} /> 굵기의 약{' '}
                  <SemanticValue
                    source="computed"
                    value={(result.lbdDesign / state.db).toFixed(1)}
                    unit="배"
                  />
                  )
                </span>
              </div>
              <p className="text-slate-700">
                {result.isLbdMinGoverning ? (
                  <>
                    할인 보너스를 적용한 계산 길이(
                    <SemanticValue source="computed" value={result.lbdCalc} unit="mm" />)가 너무 짧아져서,
                    현장 안전 마지노선인 <SemanticValue source="constant" value="15" />×
                    <SemanticValue source="input" symbol="db" value={state.db} /> ={' '}
                    <SemanticValue source="computed" value={result.lbdMin} unit="mm" />가 최종 길이로 채택되었습니다!
                  </>
                ) : (
                  <>
                    기본정착길이(<SemanticValue source="computed" value={result.lbActive} unit="mm" />)에
                    영향계수(<SemanticValue source="computed" symbol="α" value={result.alphaAnchorage.toFixed(1)} />)와
                    사용률(<SemanticValue source="input" value={state.rebarUsageRatioAnchorage.toFixed(2)} />)을 반영한 계산 길이{' '}
                    <SemanticValue source="computed" value={result.lbdCalc} unit="mm" />가 최소 마지노선(
                    <SemanticValue source="computed" value={result.lbdMin} unit="mm" />)보다 크므로 계산값이 그대로 최종 채택되었습니다.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Lap Splice Final Verdict */}
          <div className="flex items-start gap-3 p-2.5 rounded bg-slate-50 border border-slate-200">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs">
              l_o
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-slate-900 text-sm mb-0.5 flex flex-wrap items-center gap-1.5">
                <span>② 최종 설계겹이음길이:</span>
                <SemanticValue source="computed" value={result.loDesign} unit="mm" badge />
                <span className="text-[11px] font-normal text-slate-600">
                  (철근 <SemanticValue source="input" value={`H${state.db}`} /> 굵기의 약{' '}
                  <SemanticValue
                    source="computed"
                    value={(result.loDesign / state.db).toFixed(1)}
                    unit="배"
                  />
                  )
                </span>
              </div>
              <p className="text-slate-700">
                {result.isLoMinGoverning ? (
                  <>
                    이음 계산 길이(<SemanticValue source="computed" value={result.loCalc} unit="mm" />)보다
                    최소 안전 마지노선 <SemanticValue source="constant" value="15" />×
                    <SemanticValue source="input" symbol="db" value={state.db} /> ={' '}
                    <SemanticValue source="computed" value={result.loMin} unit="mm" />가 더 커서 최소이음길이가 지배합니다!
                  </>
                ) : (
                  <>
                    두 철근이 나란히 힘을 주고받는 겹침이음 할증(
                    <SemanticValue source="input" symbol="α6,lo" value={state.spliceAlpha6.toFixed(1)} />)과
                    이음부 철근사용률(<SemanticValue source="input" value={state.rebarUsageRatioSplice.toFixed(2)} />)을 곱한 계산 길이{' '}
                    <SemanticValue source="computed" value={result.loCalc} unit="mm" />가 최종 채택되었습니다.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          4 STEP-BY-STEP ANALOGY CARDS
         ==================================================================== */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
        {/* ------------------------------------------------------------------
            STEP 1: 콘크리트의 악력 (부착강도 fbd)
           ------------------------------------------------------------------ */}
        <article className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
                  STEP 1
                </span>
                <h3 className="text-xs md:text-sm font-bold text-slate-900">
                  콘크리트의 악력 (설계부착강도 <span className="font-mono text-[#2563EB]">f_bd</span>)
                </h3>
              </div>
              <SemanticValue
                source="computed"
                symbol="fbd"
                value={result.fbd.toFixed(3)}
                unit="MPa"
                badge
              />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
              <strong>💡 중학생 눈높이 원리:</strong> 철근 표면에 볼록 튀어나온 마디(돌기)가 콘크리트를{' '}
              <span className="font-semibold text-slate-900">45° 각도로 밀어내며 꽉 맞물리는 힘</span>이 바로
              상수 <SemanticValue source="constant" value="2.25" />입니다. 콘크리트 강도(
              <SemanticValue source="input" symbol="fck" value={state.fck} unit="MPa" />)가 셀수록 인장강도(
              <SemanticValue source="computed" symbol="fctk" value={result.fctk.toFixed(3)} unit="MPa" />)도 커져서 철근을 꽉 쥐는 악력이 세집니다.
            </p>

            <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 블리딩 물주머니 위치 영향 (η₁):</span>
                <span>
                  <SemanticValue source="computed" symbol="η1" value={result.eta1.toFixed(1)} /> (
                  {isPoorBond ? '불량: 철근 밑 물주머니로 악력 30% 감소!' : '양호: 빈틈 없이 100% 밀착'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 굵은 철근 지름 영향 (η₂):</span>
                <span>
                  <SemanticValue source="computed" symbol="η2" value={result.eta2.toFixed(2)} /> (
                  {state.db <= 32 ? '32mm 이하: 감소 없음 1.0' : '32mm 초과: 굵기 보정 적용'})
                </span>
              </div>
            </div>
          </div>

          {/* Live Color-Coded Formula Box */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 bg-slate-100/70 px-3 py-2 rounded font-mono text-xs flex flex-wrap items-center justify-between gap-1">
            <span className="text-slate-600">f_bd = 2.25 × η₁ × η₂ × (f_ctk / φ_c) =</span>
            <span>
              <SemanticValue source="constant" value="2.25" /> ×{' '}
              <SemanticValue source="computed" value={result.eta1.toFixed(1)} /> ×{' '}
              <SemanticValue source="computed" value={result.eta2.toFixed(2)} /> × (
              <SemanticValue source="computed" value={result.fctk.toFixed(3)} /> /{' '}
              <SemanticValue source="constant" value="0.65" />) ={' '}
              <SemanticValue source="computed" value={result.fbd.toFixed(3)} unit="MPa" />
            </span>
          </div>
        </article>

        {/* ------------------------------------------------------------------
            STEP 2: 기본정착길이 (lb) & 압축 끝단 받침 힘 (-15db)
           ------------------------------------------------------------------ */}
        <article className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
                  STEP 2
                </span>
                <h3 className="text-xs md:text-sm font-bold text-slate-900">
                  기본정착길이 (<span className="font-mono text-[#2563EB]">l_b</span>) & 압축 끝단 받침 힘 (
                  <span className="font-mono text-[#111827]">-15d_b</span>)
                </h3>
              </div>
              <SemanticValue
                source="computed"
                symbol={isTension ? 'lb,t' : 'lb,c'}
                value={result.lbActive}
                unit="mm"
                badge
              />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
              <strong>💡 중학생 눈높이 원리:</strong> 철근을 잡아당기는 힘(설계항복강도{' '}
              <SemanticValue source="computed" symbol="fyd" value={result.fyd} unit="MPa" /> ={' '}
              <SemanticValue source="input" symbol="fy" value={state.fy} /> ×{' '}
              <SemanticValue source="constant" symbol="φs" value="0.90" />)을 콘크리트 악력(
              <SemanticValue source="computed" symbol="fbd" value={result.fbd.toFixed(3)} />)으로 나누면,
              철근 굵기(<SemanticValue source="input" symbol="db" value={state.db} unit="mm" />)의{' '}
              <SemanticValue source="computed" value={result.kbFactor.toFixed(2)} />배만큼 묻어야 한다는 기본 공식이 나옵니다.
            </p>

            <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 인장측 기본정착 (당기는 힘):</span>
                <span>
                  <SemanticValue source="computed" symbol="lb,t" value={result.lbt} unit="mm" /> (원시값{' '}
                  <SemanticValue source="computed" value={result.lbtRaw.toFixed(1)} unit="mm" />)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 압축측 끝단 받침 할인 (-15d_b):</span>
                <span>
                  밀 때는 끝단 단면이 직접 버텨줘서{' '}
                  <SemanticValue source="constant" value="15" />×
                  <SemanticValue source="input" value={state.db} /> ={' '}
                  <SemanticValue source="computed" value={15 * state.db} unit="mm" /> 즉시 차감! (
                  <SemanticValue source="computed" symbol="lb,c" value={result.lbc} unit="mm" />)
                </span>
              </div>
            </div>
          </div>

          {/* Live Color-Coded Formula Box */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 bg-slate-100/70 px-3 py-2 rounded font-mono text-xs flex flex-wrap items-center justify-between gap-1">
            {isTension ? (
              <>
                <span className="text-slate-600">l_b,t = (25.48 × d_b) / η₁ =</span>
                <span>
                  (<SemanticValue source="computed" value={result.kbFactor.toFixed(2)} /> ×{' '}
                  <SemanticValue source="input" value={state.db} />) /{' '}
                  <SemanticValue source="computed" value={result.eta1.toFixed(1)} /> ={' '}
                  <SemanticValue source="computed" value={result.lbtRaw.toFixed(1)} /> →{' '}
                  <SemanticValue source="computed" value={result.lbt} unit="mm" />
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-600">l_b,c = l_b,t - 15 × d_b =</span>
                <span>
                  <SemanticValue source="computed" value={result.lbtRaw.toFixed(1)} /> -{' '}
                  <SemanticValue source="constant" value="15" /> ×{' '}
                  <SemanticValue source="input" value={state.db} /> ={' '}
                  <SemanticValue source="computed" value={result.lbcRaw.toFixed(1)} /> →{' '}
                  <SemanticValue source="computed" value={result.lbc} unit="mm" />
                </span>
              </>
            )}
          </div>
        </article>

        {/* ------------------------------------------------------------------
            STEP 3: 갈고리 & 콘크리트 살 두께 할인 보너스 (α1, α2, α6)
           ------------------------------------------------------------------ */}
        <article className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
                  STEP 3
                </span>
                <h3 className="text-xs md:text-sm font-bold text-slate-900">
                  갈고리 & 콘크리트 살 두께 할인 보너스 (<span className="font-mono text-[#2563EB]">α_1, α_2, α_6</span>)
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <SemanticValue
                  source="computed"
                  symbol="α정착"
                  value={result.alphaAnchorage.toFixed(1)}
                  badge
                />
                <SemanticValue
                  source="computed"
                  symbol="α이음"
                  value={result.alphaSplice.toFixed(1)}
                  badge
                />
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
              <strong>💡 중학생 눈높이 원리:</strong> 철근 끝을 90° 갈고리로 구부려 걸어주면(
              <SemanticValue
                source="computed"
                symbol="α1"
                value={result.alpha1Anchorage.toFixed(1)}
              />
              ) 길이를 30% 할인받고, 콘크리트 살 두께(<SemanticValue source="computed" symbol="Cd" value={result.cdAnchorage.toFixed(1)} unit="mm" />)가 철근 굵기의 3배보다 두꺼우면(
              <SemanticValue
                source="computed"
                symbol="α2"
                value={result.alpha2AnchorageDisplay.toFixed(1)}
              />
              ) 쉽게 안 갈라져서 추가 할인을 받습니다. 반대로 겹침이음은 두 철근이 한곳에서 힘을 전달하므로{' '}
              <SemanticValue source="input" symbol="α6,lo" value={state.spliceAlpha6.toFixed(1)} />배 할증됩니다.
            </p>

            <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 형상계수 (α₁) / 피복계수 (α₂):</span>
                <span>
                  {isHook ? '갈고리 형성 ' : '직선 철근 '}
                  <SemanticValue source="computed" symbol="α1" value={result.alpha1Anchorage.toFixed(1)} /> · 살 두께 보너스{' '}
                  <SemanticValue
                    source="computed"
                    symbol="α2"
                    value={result.alpha2AnchorageDisplay.toFixed(1)}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 기타 구속계수 (α₃·α₄·α₅):</span>
                <span>
                  보수적 안전 설계를 위해 모두 기본 가정값{' '}
                  <SemanticValue source="constant" value="1.0" /> 적용
                </span>
              </div>
            </div>
          </div>

          {/* Live Color-Coded Formula Box */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 bg-slate-100/70 px-3 py-2 rounded font-mono text-xs flex flex-wrap items-center justify-between gap-1">
            <span className="text-slate-600">
              정착 α = {isTension ? 'α₁×α₂×1.0' : '1.0 (압축측)'} | 이음 α_o = α₁×α₂×α₆,lo
            </span>
            <span>
              정착 <SemanticValue source="computed" value={result.alphaAnchorage.toFixed(1)} /> / 이음{' '}
              <SemanticValue source="computed" value={result.alphaSplice.toFixed(1)} />
            </span>
          </div>
        </article>

        {/* ------------------------------------------------------------------
            STEP 4: 철근사용률(As,req/As,used)과 최소 안전 마지노선 (15db)
           ------------------------------------------------------------------ */}
        <article className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
                  STEP 4
                </span>
                <h3 className="text-xs md:text-sm font-bold text-slate-900">
                  철근사용률(<span className="font-mono text-[#DC2626]">A_s,req/A_s,used</span>) & 최소 마지노선 (
                  <span className="font-mono text-[#111827]">15d_b</span>)
                </h3>
              </div>
              <SemanticValue
                source="computed"
                symbol="15db"
                value={result.lbdMin}
                unit="mm"
                badge
              />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
              <strong>💡 중학생 눈높이 원리:</strong> 실제로 필요한 철근량보다 넉넉하게 철근을 배치하면(예: 겹침이음부 철근사용률{' '}
              <SemanticValue source="input" value={state.rebarUsageRatioSplice.toFixed(2)} />), 철근 한 가닥이 받는 부담이 줄어들어 필요한 길이도 비례해서 줄어듭니다. 하지만{' '}
              <span className="font-semibold text-slate-900">
                아무리 할인을 많이 받아도 현장 시공 오차를 막기 위해 무조건 철근 굵기의{' '}
                <SemanticValue source="constant" value="15" />배 이상
              </span>
              은 묻어야 합니다!
            </p>

            <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 정착 최종 비교 (사용률 {state.rebarUsageRatioAnchorage}):</span>
                <span>
                  Max(계산 <SemanticValue source="computed" value={result.lbdCalc} />, 최소{' '}
                  <SemanticValue source="computed" value={result.lbdMin} />) ={' '}
                  <SemanticValue source="computed" value={result.lbdDesign} unit="mm" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">• 이음 최종 비교 (사용률 {state.rebarUsageRatioSplice}):</span>
                <span>
                  Max(계산 <SemanticValue source="computed" value={result.loCalc} />, 최소{' '}
                  <SemanticValue source="computed" value={result.loMin} />) ={' '}
                  <SemanticValue source="computed" value={result.loDesign} unit="mm" />
                </span>
              </div>
            </div>
          </div>

          {/* Live Color-Coded Formula Box */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 bg-slate-100/70 px-3 py-2 rounded font-mono text-xs flex flex-wrap items-center justify-between gap-1">
            <span className="text-slate-600">l_bd,min = l_o,min = 15 × d_b =</span>
            <span>
              <SemanticValue source="constant" value="15" /> ×{' '}
              <SemanticValue source="input" value={state.db} /> ={' '}
              <SemanticValue source="computed" value={result.lbdMin} unit="mm" /> (절대하한 정착{' '}
              <SemanticValue source="constant" value="100" unit="mm" /> / 이음{' '}
              <SemanticValue source="constant" value="200" unit="mm" />)
            </span>
          </div>
        </article>
      </div>
    </section>
  );
};

export default EasyExplainerCards;
