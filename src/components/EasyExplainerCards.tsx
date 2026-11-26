import React from 'react';
import { AnchorageInputState, RebarCalculationResult } from '../core/types';
import { SYSTEM_CONSTANTS, roundTo } from '../core/anchorageEngine';
import { SemanticValue } from './SemanticValue';

export interface EasyExplainerCardsProps {
  state: AnchorageInputState;
  result: RebarCalculationResult;
}

/**
 * 참조 계산서(Ch07 철근 정착 및 이음길이)의 흐름과 100% 동일한 5단계 계산 과정 컴포넌트
 * 1. 기본정착길이 (l_b) 산정 (7.1.1 부착강도 f_bd -> 7.1.2/7.1.3 l_b = (d_b · f_yd)/(4 · f_bd) [- 15d_b])
 * 2. 철근영향계수 (α) 산정 (7.2.1/7.3.2 간격계수 C_d -> α_1, α_2, α_3~6 -> α = α_1·α_2·α_3·α_4·α_5·α_6)
 * 3. 철근사용률 (A_s,req / A_s,used) 산정 (7.2.4 정착 1.0 / 7.3.3 겹침이음 0.7)
 * 4. 최소정착길이 (l_bd,min) 및 최소겹침이음길이 (l_o,min) 산정 (7.2.5 / 7.3.4 -> 15d_b)
 * 5. 설계정착길이 (l_bd) 및 설계겹이음길이 (l_o) 최종 결정 (7.2.6 / 7.3.4)
 */
export const EasyExplainerCards: React.FC<EasyExplainerCardsProps> = ({
  state,
  result,
}) => {
  const isTension = state.stressZone === 'tension';
  const isHook = state.barShape === 'hook';

  // 최소정착길이 비교 항목 (계산서 7.2.5절 및 7.3.4절)
  const minAnchorageFactorLb = isTension
    ? roundTo(0.3 * result.lbt, 1)
    : roundTo(0.6 * result.lbc, 1);
  const minSpliceFactorLb = roundTo(0.3 * state.spliceAlpha6 * result.lbActive, 1);
  const rawFifteenDb = 15 * state.db;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">
          단계별 계산 과정 (참조 계산서 제7장 수식 흐름)
        </h3>
        <span className="text-xs font-mono text-slate-500">
          l_bd = α₁·α₂·α₃·α₄·α₅·α₆ · l_b · (A_s,req / A_s,used) ≥ l_bd,min
        </span>
      </div>

      <div className="space-y-4 text-sm">
        {/* ==================================================================
            STEP 1. 기본정착길이 (l_b) 산정 (계산서 7.1절)
           ================================================================== */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900">
              1. 기본정착길이 (<span className="font-mono text-[#2563EB]">l_b</span>) 산정
            </div>
            <SemanticValue
              source="computed"
              symbol={isTension ? 'l_b,t' : 'l_b,c'}
              value={result.lbActive}
              unit="mm (10mm 단위 반올림)"
              badge
            />
          </div>

          <div className="space-y-1.5 font-mono text-xs sm:text-sm bg-white p-3.5 rounded-lg border border-slate-200">
            {/* ① 부착강도 f_bd */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="text-slate-600 font-sans font-medium">
                ① 부착강도 <span className="font-mono">f_bd = 2.25 · f_ctk · ϕ_c · η₁ · η₂</span>
              </span>
              <span>
                <SemanticValue source="constant" value={SYSTEM_CONSTANTS.bondMultiplier} /> ×{' '}
                <SemanticValue source="computed" symbol="f_ctk" value={result.fctk} /> ×{' '}
                <SemanticValue source="constant" symbol="ϕ_c" value={SYSTEM_CONSTANTS.phiC} /> ×{' '}
                <SemanticValue source="computed" symbol="η₁" value={result.eta1} /> ×{' '}
                <SemanticValue source="computed" symbol="η₂" value={result.eta2} /> ={' '}
                <SemanticValue source="computed" value={result.fbd.toFixed(3)} unit="MPa" />
              </span>
            </div>

            {/* ② 기본정착길이 식: l_b = (d_b · f_yd) / (4 · f_bd) */}
            {isTension ? (
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-600 font-sans font-medium">
                  ② 인장측{' '}
                  <span className="font-mono">
                    l_b,t = (d_b · f_yd) / (4 · f_bd) = {result.kbFactor} · (d_b / η₁)
                  </span>
                </span>
                <span>
                  (<SemanticValue source="input" symbol="d_b" value={state.db} /> ×{' '}
                  <SemanticValue source="computed" symbol="f_yd" value={result.fyd} />) / (
                  <SemanticValue source="constant" value={4} /> ×{' '}
                  <SemanticValue source="computed" value={result.fbd.toFixed(3)} />) ={' '}
                  <SemanticValue source="computed" value={result.lbtRaw} /> →{' '}
                  <SemanticValue source="computed" value={result.lbt} unit="mm" />
                </span>
              </div>
            ) : (
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-600 font-sans font-medium">
                  ② 압축측{' '}
                  <span className="font-mono">
                    l_b,c = (d_b · f_yd) / (4 · f_bd) - 15d_b = {result.kbFactor} · (d_b / η₁) - 15d_b
                  </span>
                </span>
                <span>
                  <SemanticValue source="computed" value={result.lbtRaw} /> -{' '}
                  <SemanticValue source="constant" value={15} /> ×{' '}
                  <SemanticValue source="input" symbol="d_b" value={state.db} /> ={' '}
                  <SemanticValue source="computed" value={result.lbcRaw} /> →{' '}
                  <SemanticValue source="computed" value={result.lbc} unit="mm" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            STEP 2. 철근영향계수 (α) 산정 (계산서 7.2.1 ~ 7.2.3 & 7.3.2절)
           ================================================================== */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900">
              2. 철근영향계수 (<span className="font-mono text-[#2563EB]">α</span>) 산정
            </div>
            <div className="flex items-center gap-2">
              <SemanticValue
                source="computed"
                symbol="정착 α"
                value={result.alphaAnchorage.toFixed(1)}
                badge
              />
              <SemanticValue
                source="computed"
                symbol="이음 α_o"
                value={result.alphaSplice.toFixed(1)}
                badge
              />
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs sm:text-sm bg-white p-3.5 rounded-lg border border-slate-200">
            {/* ① 간격계수 Cd */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans font-medium">
                ① 간격계수 <span className="font-mono">C_d = Min[a / 2, c]</span> (순간격{' '}
                <span className="font-mono">a = {result.clearSpacingA}mm</span>)
              </span>
              <span>
                정착{' '}
                <SemanticValue
                  source="computed"
                  symbol="C_d"
                  value={result.cdAnchorage}
                  unit="mm"
                />{' '}
                / 이음{' '}
                <SemanticValue source="computed" symbol="C_d" value={result.cdSplice} unit="mm" />
              </span>
            </div>

            {/* ② 세부 영향계수 α1, α2, α3~6 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans font-medium">
                ② 형상계수(<span className="font-mono">α₁</span>) · 피복두께계수(
                <span className="font-mono">
                  α₂ = {isTension ? (isHook ? '1.45' : '1.15') + ' - 0.15·C_d/d_b' : '1.0'}
                </span>
                ) · 기타(<span className="font-mono">α₃~₅</span>)
              </span>
              <span>
                <SemanticValue
                  source="computed"
                  symbol="α₁"
                  value={result.alpha1Anchorage.toFixed(1)}
                />{' '}
                · 정착{' '}
                <SemanticValue
                  source="computed"
                  symbol="α₂"
                  value={result.alpha2AnchorageDisplay.toFixed(1)}
                />
                (이음{' '}
                <SemanticValue
                  source="computed"
                  symbol="α₂"
                  value={result.alpha2SpliceDisplay.toFixed(1)}
                />
                ) · <SemanticValue source="constant" symbol="α₃~₅" value="1.0" />
              </span>
            </div>

            {/* ③ 통합 철근영향계수 α 및 α_o */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-600 font-sans font-medium">
                ③ 통합 계수 <span className="font-mono">α = α₁·α₂·α₃·α₄·α₅·α₆</span>
              </span>
              <span>
                정착 <SemanticValue source="computed" symbol="α" value={result.alphaAnchorage.toFixed(1)} />{' '}
                (α₆=<SemanticValue source="constant" value="1.0" />) / 이음{' '}
                <SemanticValue source="computed" symbol="α_o" value={result.alphaSplice.toFixed(1)} />{' '}
                (α₆,lo=<SemanticValue source="input" value={state.spliceAlpha6.toFixed(1)} />)
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            STEP 3. 철근사용률 (A_s,req / A_s,used) 산정 (계산서 7.2.4 & 7.3.3절)
           ================================================================== */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900">
              3. 철근사용률 (<span className="font-mono text-[#DC2626]">A_s,req / A_s,used</span>) 적용
            </div>
            <div className="flex items-center gap-2">
              <SemanticValue
                source="input"
                symbol="정착 사용률"
                value={state.rebarUsageRatioAnchorage.toFixed(2)}
                badge
              />
              <SemanticValue
                source="input"
                symbol="이음 사용률"
                value={state.rebarUsageRatioSplice.toFixed(2)}
                badge
              />
            </div>
          </div>

          <div className="font-mono text-xs sm:text-sm bg-white p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-600 font-sans font-medium">
              정착부는 연결부 중요성을 고려하여 기본 1.0, 겹침이음부는 이음부 응력을 고려하여 기본 0.7 적용
            </span>
            <span>
              정착 <SemanticValue source="input" value={state.rebarUsageRatioAnchorage.toFixed(2)} /> /
              겹침이음 <SemanticValue source="input" value={state.rebarUsageRatioSplice.toFixed(2)} />
            </span>
          </div>
        </div>

        {/* ==================================================================
            STEP 4. 최소정착길이 (l_bd,min) 및 최소겹침이음길이 (l_o,min) 산정 (계산서 7.2.5 & 7.3.4절)
           ================================================================== */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900">
              4. 최소정착길이 (<span className="font-mono text-[#2563EB]">l_bd,min</span>) 및 최소겹침이음길이 (
              <span className="font-mono text-[#2563EB]">l_o,min</span>) 산정
            </div>
            <SemanticValue
              source="computed"
              symbol="15d_b (10mm 반올림)"
              value={result.lbdMin}
              unit="mm"
              badge
            />
          </div>

          <div className="space-y-1.5 font-mono text-xs sm:text-sm bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-sans font-medium">
                ① 정착 최소길이{' '}
                <span className="font-mono">
                  l_bd,min = Max[{isTension ? '0.3·l_b,t' : '0.6·l_b,c'}, 15d_b, 100mm]
                </span>
              </span>
              <span>
                Max({minAnchorageFactorLb},{' '}
                <SemanticValue source="constant" value={15} />×
                <SemanticValue source="input" value={state.db} />={rawFifteenDb},{' '}
                <SemanticValue source="constant" value={100} />) →{' '}
                <SemanticValue source="computed" value={result.lbdMin} unit="mm" />
              </span>
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-600 font-sans font-medium">
                ② 이음 최소길이{' '}
                <span className="font-mono">l_o,min = Max[0.3·α₆,lo·l_b, 15d_b, 200mm]</span>
              </span>
              <span>
                Max({minSpliceFactorLb},{' '}
                <SemanticValue source="constant" value={15} />×
                <SemanticValue source="input" value={state.db} />={rawFifteenDb},{' '}
                <SemanticValue source="constant" value={200} />) →{' '}
                <SemanticValue source="computed" value={result.loMin} unit="mm" />
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            STEP 5. 설계정착길이 (l_bd) 및 설계겹이음길이 (l_o) 결정 (계산서 7.2.6 & 7.3.4절)
           ================================================================== */}
        <div className="p-4 rounded-xl bg-blue-50/50 border-2 border-blue-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-slate-900">
              5. 설계정착길이 (<span className="font-mono text-[#2563EB]">l_bd</span>) 및 설계겹이음길이 (
              <span className="font-mono text-[#2563EB]">l_o</span>) 최종 결정
            </div>
            <div className="flex items-center gap-2">
              <SemanticValue
                source="computed"
                symbol="최종 l_bd"
                value={result.lbdDesign}
                unit="mm"
                badge
              />
              <SemanticValue
                source="computed"
                symbol="최종 l_o"
                value={result.loDesign}
                unit="mm"
                badge
              />
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs sm:text-sm bg-white p-3.5 rounded-lg border border-blue-200">
            {/* ① 설계정착길이 결정 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <span className="text-slate-700 font-sans font-semibold">
                ① 설계정착길이{' '}
                <span className="font-mono">
                  l_bd = α · l_b · (A_s,req/A_s,used) ≥ l_bd,min (15d_b)
                </span>
              </span>
              <span>
                계산{' '}
                <SemanticValue source="computed" value={result.alphaAnchorage.toFixed(1)} /> ×{' '}
                <SemanticValue source="computed" value={result.lbActive} /> ×{' '}
                <SemanticValue source="input" value={state.rebarUsageRatioAnchorage} /> ={' '}
                <SemanticValue source="computed" value={result.lbdCalc} unit="mm" /> vs 최소{' '}
                <SemanticValue source="computed" value={result.lbdMin} unit="mm" /> ⇒{' '}
                <SemanticValue
                  source="computed"
                  value={result.lbdDesign}
                  unit="mm"
                  className="text-base font-extrabold underline"
                />
              </span>
            </div>

            {/* ② 설계겹이음길이 결정 */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-700 font-sans font-semibold">
                ② 설계겹이음길이{' '}
                <span className="font-mono">
                  l_o = α_o · l_b · (A_s,req/A_s,used) ≥ l_o,min (15d_b)
                </span>
              </span>
              <span>
                계산{' '}
                <SemanticValue source="computed" value={result.alphaSplice.toFixed(1)} /> ×{' '}
                <SemanticValue source="computed" value={result.lbActive} /> ×{' '}
                <SemanticValue source="input" value={state.rebarUsageRatioSplice} /> ={' '}
                <SemanticValue source="computed" value={result.loCalc} unit="mm" /> vs 최소{' '}
                <SemanticValue source="computed" value={result.loMin} unit="mm" /> ⇒{' '}
                <SemanticValue
                  source="computed"
                  value={result.loDesign}
                  unit="mm"
                  className="text-base font-extrabold underline"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EasyExplainerCards;
