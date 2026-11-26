import React from 'react';
import { AnchorageInputState, RebarCalculationResult } from '../core/types';
import { SYSTEM_CONSTANTS } from '../core/anchorageEngine';
import { SemanticValue } from './SemanticValue';

export interface EasyExplainerCardsProps {
  state: AnchorageInputState;
  result: RebarCalculationResult;
}

/**
 * 간단한 계산과정 요약 컴포넌트 (EasyExplainerCards)
 * - 불필요한 30초 판정 배너나 장황한 글자를 제거하고
 *   결과가 도출된 3단계 계산식과 쉬운 한 줄 설명만 간결하게 표시
 */
export const EasyExplainerCards: React.FC<EasyExplainerCardsProps> = ({
  state,
  result,
}) => {
  const isTension = state.stressZone === 'tension';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">
        간단한 계산 과정
      </h3>

      <div className="space-y-3 text-xs">
        {/* 1단계: 기본정착길이 (lb) */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-800">
              1. 기본 길이 구하기 ({isTension ? '인장' : '압축'})
            </div>
            <p className="text-slate-500 mt-0.5">
              콘크리트가 철근을 잡는 힘(부착강도{' '}
              <SemanticValue source="computed" value={result.fbd.toFixed(2)} unit="MPa" />)으로
              계산한 기본 매립 길이입니다.
              {!isTension && ' (압축은 끝단이 받쳐주어 15×굵기만큼 줄어듦)'}
            </p>
          </div>
          <div className="font-mono bg-white px-3 py-1.5 rounded border border-slate-200 shrink-0">
            {isTension ? (
              <>
                <SemanticValue source="computed" value={result.kbFactor} /> ×{' '}
                <SemanticValue source="input" value={state.db} /> ÷{' '}
                <SemanticValue source="computed" value={result.eta1} /> ={' '}
                <SemanticValue source="computed" value={result.lbt} unit="mm" />
              </>
            ) : (
              <>
                <SemanticValue source="computed" value={result.lbtRaw.toFixed(0)} /> -{' '}
                <SemanticValue source="constant" value={15} />×
                <SemanticValue source="input" value={state.db} /> ={' '}
                <SemanticValue source="computed" value={result.lbc} unit="mm" />
              </>
            )}
          </div>
        </div>

        {/* 2단계: 설계정착길이 (lbd) */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-800">
              2. 설계정착길이 결정
            </div>
            <p className="text-slate-500 mt-0.5">
              갈고리·피복 영향계수(
              <SemanticValue source="computed" value={result.alphaAnchorage.toFixed(1)} />)와
              사용률(<SemanticValue source="input" value={state.rebarUsageRatioAnchorage} />)을
              곱한 값과 최소 기준(<SemanticValue source="constant" value="15" />×
              <SemanticValue source="input" value={state.db} /> ={' '}
              <SemanticValue source="computed" value={result.lbdMin} unit="mm" />) 중 큰 값을
              적용합니다.
            </p>
          </div>
          <div className="font-mono bg-white px-3 py-1.5 rounded border border-slate-200 shrink-0">
            Max(계산 <SemanticValue source="computed" value={result.lbdCalc} />, 최소{' '}
            <SemanticValue source="computed" value={result.lbdMin} />) ={' '}
            <SemanticValue source="computed" value={result.lbdDesign} unit="mm" />
          </div>
        </div>

        {/* 3단계: 설계겹이음길이 (lo) */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-800">
              3. 설계겹이음길이 결정
            </div>
            <p className="text-slate-500 mt-0.5">
              두 철근을 겹쳐 이을 때의 영향계수(
              <SemanticValue source="computed" value={result.alphaSplice.toFixed(1)} />)와
              이음 사용률(<SemanticValue source="input" value={state.rebarUsageRatioSplice} />)을
              곱한 값과 최소 기준(<SemanticValue source="computed" value={result.loMin} unit="mm" />)
              중 큰 값을 적용합니다.
            </p>
          </div>
          <div className="font-mono bg-white px-3 py-1.5 rounded border border-slate-200 shrink-0">
            Max(계산 <SemanticValue source="computed" value={result.loCalc} />, 최소{' '}
            <SemanticValue source="computed" value={result.loMin} />) ={' '}
            <SemanticValue source="computed" value={result.loDesign} unit="mm" />
          </div>
        </div>
      </div>

      {/* 하단 참고 수치 한 줄 */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
        <span>
          철근 설계강도 <SemanticValue source="computed" symbol="fyd" value={result.fyd} unit="MPa" />
        </span>
        <span>
          콘크리트 인장강도 <SemanticValue source="computed" symbol="fctk" value={result.fctk} unit="MPa" />
        </span>
        <span>
          간격계수(정착) <SemanticValue source="computed" symbol="Cd" value={result.cdAnchorage} unit="mm" />
        </span>
        <span>
          간격계수(이음) <SemanticValue source="computed" symbol="Cd" value={result.cdSplice} unit="mm" />
        </span>
        <span>
          고정 재료계수 <SemanticValue source="constant" symbol="ϕc" value={SYSTEM_CONSTANTS.phiC} />
        </span>
      </div>
    </div>
  );
};

export default EasyExplainerCards;
