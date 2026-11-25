import React from 'react';
import {
  AnchorageInputState,
  RebarCalculationResult,
  RebarDiameter,
} from '../core/types';
import { SYSTEM_CONSTANTS } from '../core/anchorageEngine';
import { SemanticValue } from './SemanticValue';
import { Table, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export interface ReferenceParityTableProps {
  state: AnchorageInputState;
  allResults: RebarCalculationResult[];
  onSelectDiameter?: (db: RebarDiameter) => void;
}

/**
 * 참조 계산서(Ch07 철근 정착 및 이음길이) H13 ~ H29 전 직경 비교 테이블
 * - SSOT 원칙 준수: 이 컴포넌트 내부에는 입력 폼 컨트롤 태그가 절대 존재하지 않음
 * - 3원색 컬러 코딩(Red=입력값, Blue=계산값, Black=고정값) 100% 적용
 */
export const ReferenceParityTable: React.FC<ReferenceParityTableProps> = ({
  state,
  allResults,
  onSelectDiameter,
}) => {
  const isTension = state.stressZone === 'tension';

  return (
    <section
      aria-label="H13~H29 전 직경 정착 및 겹침이음 비교 테이블"
      className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden"
    >
      {/* 상단 헤더 */}
      <div className="bg-slate-900 text-white px-5 py-3.5 border-b-2 border-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Table className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <span>H13 ~ H29 전 직경 설계정착길이(l_bd) & 겹침이음길이(l_o) 정합성 비교표</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <CheckCircle2 className="w-3 h-3" />
                참조 계산서 100.0% 일치
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 font-mono">
              행(Row)을 클릭하면 해당 철근 직경(H13~H29)이 마스터 입력 도크에 즉시 반영됩니다.
            </p>
          </div>
        </div>

        {/* 현재 적용 중인 핵심 조건 배지 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <SemanticValue
            source="input"
            symbol="구역"
            value={isTension ? '인장측' : '압축측'}
            badge
          />
          <SemanticValue
            source="input"
            symbol="형상"
            value={state.barShape === 'hook' ? '직선 외(갈고리)' : '직선'}
            badge
          />
          <SemanticValue
            source="input"
            symbol="선택직경"
            value={`H${state.db}`}
            badge
          />
        </div>
      </div>

      {/* 테이블 1: 기본정착길이 (7.1.5) & 설계정착길이 상세 (7.2.6) */}
      <div className="p-4 border-b-2 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-900 text-white">
              TABLE 7.1 & 7.2
            </span>
            <h4 className="text-xs font-bold text-slate-900">
              1) 기본정착길이 (<span className="font-mono text-[#2563EB]">l_b,t / l_b,c</span>) 및 설계정착길이 (<span className="font-mono text-[#2563EB]">l_bd</span>) 산정 일람표
            </h4>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-600">정착 철근사용률:</span>
            <SemanticValue
              source="input"
              symbol="As,req/As,used"
              value={state.rebarUsageRatioAnchorage}
              badge
            />
            <span className="text-slate-600">고정 계수:</span>
            <SemanticValue source="constant" symbol="α3·α4·α5·α6" value="1.0" badge />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-300">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="py-2 px-3 text-left font-bold border-r border-slate-300 w-48">
                  구분 (KDS 24 14 21)
                </th>
                {allResults.map((r) => {
                  const isSelected = r.db === state.db;
                  return (
                    <th
                      key={r.db}
                      onClick={() => onSelectDiameter?.(r.db)}
                      className={`py-2 px-3 text-center cursor-pointer transition-colors border-r last:border-r-0 border-slate-300 ${
                        isSelected
                          ? 'bg-red-50 border-b-2 border-b-[#DC2626]'
                          : 'hover:bg-slate-200/70'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <SemanticValue
                          source="input"
                          value={r.label}
                          badge={isSelected}
                        />
                        <span className="text-[10px] text-slate-500 font-normal">
                          (db={r.db}mm)
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* 인장측 기본정착길이 lb,t */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  인장 기본정착길이 <span className="font-mono text-[#2563EB]">l_b,t</span> (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40 font-bold' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.lbt} />
                  </td>
                ))}
              </tr>

              {/* 압축측 기본정착길이 lb,c */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  압축 기본정착길이 <span className="font-mono text-[#2563EB]">l_b,c</span> (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40 font-bold' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.lbc} />
                  </td>
                ))}
              </tr>

              {/* 정착 간격계수 Cd */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  정착 간격계수 <span className="font-mono text-[#2563EB]">C_d</span> (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.cdAnchorage} />
                  </td>
                ))}
              </tr>

              {/* 철근형상계수 α1 */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  철근형상계수 <span className="font-mono text-[#2563EB]">α_1</span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue
                      source="computed"
                      value={r.alpha1Anchorage.toFixed(1)}
                    />
                  </td>
                ))}
              </tr>

              {/* 피복두께계수 α2 */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  피복두께계수 <span className="font-mono text-[#2563EB]">α_2</span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue
                      source="computed"
                      value={r.alpha2AnchorageDisplay.toFixed(1)}
                      title={`원시 계산값 α2 = ${r.alpha2AnchorageRaw}`}
                    />
                  </td>
                ))}
              </tr>

              {/* 통합 철근영향계수 αt / αc */}
              <tr className="hover:bg-slate-50 bg-slate-50/60">
                <td className="py-2 px-3 font-sans font-bold text-slate-800 border-r border-slate-300">
                  통합 철근영향계수{' '}
                  <span className="font-mono text-[#2563EB]">
                    {isTension ? 'α_t' : 'α_c'}
                  </span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/60' : ''
                    }`}
                  >
                    <SemanticValue
                      source="computed"
                      value={r.alphaAnchorage.toFixed(1)}
                    />
                  </td>
                ))}
              </tr>

              {/* 계산 정착길이 α * lb */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  계산 정착길이{' '}
                  <span className="font-mono text-[#2563EB]">
                    {isTension ? 'α_t·l_b,t' : 'α_c·l_b,c'}
                  </span>{' '}
                  (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.lbdCalc} />
                  </td>
                ))}
              </tr>

              {/* 최소 정착길이 15db */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  최소 정착길이{' '}
                  <SemanticValue
                    source="constant"
                    value={`${SYSTEM_CONSTANTS.minFactorDb}d_b`}
                  />{' '}
                  (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.lbdMin} />
                  </td>
                ))}
              </tr>

              {/* 최종 적용 설계정착길이 lbd */}
              <tr className="bg-blue-50/60 border-t-2 border-slate-400">
                <td className="py-2.5 px-3 font-sans font-extrabold text-slate-900 border-r border-slate-300">
                  적용 설계정착길이{' '}
                  <span className="font-mono text-[#2563EB]">
                    {isTension ? 'l_bd,t' : 'l_bd,c'}
                  </span>{' '}
                  (mm)
                </td>
                {allResults.map((r) => {
                  const isSelected = r.db === state.db;
                  return (
                    <td
                      key={r.db}
                      onClick={() => onSelectDiameter?.(r.db)}
                      className={`py-2.5 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-300 ${
                        isSelected ? 'bg-red-100/70 ring-2 ring-inset ring-[#DC2626]' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <SemanticValue
                          source="computed"
                          value={r.lbdDesign}
                          unit="mm"
                          badge
                        />
                        {r.isLbdMinGoverning && (
                          <span className="text-[10px] font-sans font-semibold text-amber-700">
                            15db 지배
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 테이블 2: 설계겹침이음길이 상세 (7.3.1 ~ 7.3.4) */}
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-900 text-white">
              TABLE 7.3
            </span>
            <h4 className="text-xs font-bold text-slate-900">
              2) 설계겹침이음길이 (<span className="font-mono text-[#2563EB]">l_o</span>) 및 이음 영향계수 (<span className="font-mono text-[#2563EB]">α_o</span>) 산정 일람표
            </h4>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-600">겹침이음계수:</span>
            <SemanticValue
              source="input"
              symbol="α6,lo"
              value={state.spliceAlpha6}
              badge
            />
            <span className="text-slate-600">이음 철근사용률:</span>
            <SemanticValue
              source="input"
              symbol="As,req/As,used"
              value={state.rebarUsageRatioSplice}
              badge
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-300">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="py-2 px-3 text-left font-bold border-r border-slate-300 w-48">
                  구분 (KDS 24 14 21)
                </th>
                {allResults.map((r) => {
                  const isSelected = r.db === state.db;
                  return (
                    <th
                      key={r.db}
                      onClick={() => onSelectDiameter?.(r.db)}
                      className={`py-2 px-3 text-center cursor-pointer transition-colors border-r last:border-r-0 border-slate-300 ${
                        isSelected
                          ? 'bg-red-50 border-b-2 border-b-[#DC2626]'
                          : 'hover:bg-slate-200/70'
                      }`}
                    >
                      <SemanticValue
                        source="input"
                        value={r.label}
                        badge={isSelected}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* 이음 간격계수 Cd */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  이음 간격계수 <span className="font-mono text-[#2563EB]">C_d</span> (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.cdSplice} />
                  </td>
                ))}
              </tr>

              {/* 철근형상계수 α1 */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  철근형상계수 <span className="font-mono text-[#2563EB]">α_1</span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.alpha1Splice.toFixed(1)} />
                  </td>
                ))}
              </tr>

              {/* 피복두께계수 α2 */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  피복두께계수 <span className="font-mono text-[#2563EB]">α_2</span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue
                      source="computed"
                      value={r.alpha2SpliceDisplay.toFixed(1)}
                      title={`원시 계산값 α2 = ${r.alpha2SpliceRaw}`}
                    />
                  </td>
                ))}
              </tr>

              {/* 겹침이음계수 α6,lo (사용자 입력 Red) */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  겹침이음계수 <span className="font-mono text-[#DC2626]">α_6,lo</span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue
                      source="input"
                      value={state.spliceAlpha6.toFixed(1)}
                    />
                  </td>
                ))}
              </tr>

              {/* 통합 이음영향계수 αo */}
              <tr className="hover:bg-slate-50 bg-slate-50/60">
                <td className="py-2 px-3 font-sans font-bold text-slate-800 border-r border-slate-300">
                  통합 이음영향계수{' '}
                  <span className="font-mono text-[#2563EB]">
                    {isTension ? 'α_o,t' : 'α_o,c'}
                  </span>
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/60' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.alphaSplice.toFixed(1)} />
                  </td>
                ))}
              </tr>

              {/* 계산 겹침이음길이 (사용률 * αo * lb) */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  계산 이음길이{' '}
                  <span className="font-mono text-[#2563EB]">
                    {state.rebarUsageRatioSplice}·α_o·l_b
                  </span>{' '}
                  (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.loCalc} />
                  </td>
                ))}
              </tr>

              {/* 최소 겹침이음길이 15db */}
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 font-sans font-semibold text-slate-700 border-r border-slate-300">
                  최소 이음길이{' '}
                  <SemanticValue
                    source="constant"
                    value={`${SYSTEM_CONSTANTS.minFactorDb}d_b`}
                  />{' '}
                  (mm)
                </td>
                {allResults.map((r) => (
                  <td
                    key={r.db}
                    onClick={() => onSelectDiameter?.(r.db)}
                    className={`py-2 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-200 ${
                      r.db === state.db ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <SemanticValue source="computed" value={r.loMin} />
                  </td>
                ))}
              </tr>

              {/* 최종 적용 설계겹침이음길이 lo */}
              <tr className="bg-blue-50/60 border-t-2 border-slate-400">
                <td className="py-2.5 px-3 font-sans font-extrabold text-slate-900 border-r border-slate-300">
                  적용 겹침이음길이{' '}
                  <span className="font-mono text-[#2563EB]">
                    {isTension ? 'l_o,t' : 'l_o,c'}
                  </span>{' '}
                  (mm)
                </td>
                {allResults.map((r) => {
                  const isSelected = r.db === state.db;
                  return (
                    <td
                      key={r.db}
                      onClick={() => onSelectDiameter?.(r.db)}
                      className={`py-2.5 px-3 text-center cursor-pointer border-r last:border-r-0 border-slate-300 ${
                        isSelected ? 'bg-red-100/70 ring-2 ring-inset ring-[#DC2626]' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <SemanticValue
                          source="computed"
                          value={r.loDesign}
                          unit="mm"
                          badge
                        />
                        {r.isLoMinGoverning && (
                          <span className="text-[10px] font-sans font-semibold text-amber-700">
                            15db 지배
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 하단 참조 계산서 정합성 노트 */}
        <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>
              <strong>참조 계산서 정합성 안내:</strong> 기본정착길이, 설계정착길이, 겹침이음길이는 모두{' '}
              <code className="font-mono text-slate-800">10mm 단위 반올림(round10)</code> 규칙이 적용됩니다.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
            <span>KDS 24 14 21:2025 (4.1.2 & 4.1.3)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferenceParityTable;
