import React from 'react';
import {
  AnchorageInputState,
  RebarCalculationResult,
  RebarDiameter,
} from '../core/types';
import { SemanticValue } from './SemanticValue';

export interface ReferenceParityTableProps {
  state: AnchorageInputState;
  allResults: RebarCalculationResult[];
  onSelectDiameter?: (db: RebarDiameter) => void;
}

/**
 * 철근 굵기별(H13 ~ H29) 정착장 및 겹이음길이 요약 표
 * - 복잡한 설명을 덜어내고 직경별 핵심 값만 한눈에 비교
 */
export const ReferenceParityTable: React.FC<ReferenceParityTableProps> = ({
  state,
  allResults,
  onSelectDiameter,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <th className="py-2.5 px-3 font-semibold">철근 굵기</th>
            <th className="py-2.5 px-3 font-semibold text-right">기본길이 (l_b)</th>
            <th className="py-2.5 px-3 font-semibold text-right">최소길이 (15d_b)</th>
            <th className="py-2.5 px-3 font-semibold text-right">정착 계수 (α)</th>
            <th className="py-2.5 px-3 font-bold text-right text-[#2563EB] bg-blue-50/50">
              설계정착길이 (l_bd)
            </th>
            <th className="py-2.5 px-3 font-semibold text-right">이음 계수 (α_o)</th>
            <th className="py-2.5 px-3 font-bold text-right text-[#2563EB] bg-blue-50/50">
              설계겹이음길이 (l_o)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {allResults.map((row) => {
            const isSelected = row.db === state.db;
            return (
              <tr
                key={row.db}
                onClick={() => onSelectDiameter?.(row.db)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-red-50/60 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <td className="py-2.5 px-3 font-mono">
                  <SemanticValue
                    source="input"
                    value={`H${row.db}`}
                    className={isSelected ? 'underline font-bold' : ''}
                  />
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <SemanticValue source="computed" value={row.lbActive} unit="mm" />
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <SemanticValue source="computed" value={row.lbdMin} unit="mm" />
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <SemanticValue source="computed" value={row.alphaAnchorage.toFixed(1)} />
                </td>
                <td className="py-2.5 px-3 text-right font-mono bg-blue-50/30">
                  <SemanticValue
                    source="computed"
                    value={row.lbdDesign}
                    unit="mm"
                    className="text-sm font-bold"
                  />
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <SemanticValue source="computed" value={row.alphaSplice.toFixed(1)} />
                </td>
                <td className="py-2.5 px-3 text-right font-mono bg-blue-50/30">
                  <SemanticValue
                    source="computed"
                    value={row.loDesign}
                    unit="mm"
                    className="text-sm font-bold"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReferenceParityTable;
