import React, { useState } from 'react';
import {
  AnchorageInputState,
  BarShape,
  BondCondition,
  RebarDiameter,
  ReferencePreset,
  StressZone,
} from '../core/types';
import { REFERENCE_PRESETS } from '../core/presets';
import { SYSTEM_CONSTANTS } from '../core/anchorageEngine';
import { SemanticValue } from './SemanticValue';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface MasterInputDockProps {
  state: AnchorageInputState;
  onChange: (patch: Partial<AnchorageInputState>) => void;
  onApplyPreset?: (preset: ReferencePreset) => void;
  onReset?: () => void;
  activePresetId?: string | null;
}

const STANDARD_DIAMETERS: RebarDiameter[] = [13, 16, 19, 22, 25, 29];

/**
 * 단일 입력 패널 (SSOT MasterInputDock)
 * - 불필요한 홍보 문구 및 장황한 설명을 제거하고 9대 입력 변수를 직관적으로 조작
 * - 사용자 입력값은 Red(#DC2626) 규칙 준수
 */
export const MasterInputDock: React.FC<MasterInputDockProps> = ({
  state,
  onChange,
  onApplyPreset,
  onReset,
  activePresetId,
}) => {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* 상단 헤더 */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
          <h2 className="text-sm font-bold text-slate-900">조건 입력</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets((v) => !v)}
            className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 bg-white flex items-center gap-1"
          >
            예제 불러오기
            {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="기본값 초기화"
              className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded border border-slate-200 bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 접이식 예제 프리셋 바 (기본 접힘) */}
      {showPresets && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 space-y-1.5">
          <div className="text-[11px] font-medium text-slate-500 mb-1">
            계산서 위치별 조건 빠르게 불러오기
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {REFERENCE_PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset?.(preset)}
                  className={`text-left px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-red-50/80 border-[#DC2626] text-[#DC2626] font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{preset.title}</span>
                  <span className="font-mono text-[11px] opacity-75">{preset.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 9대 핵심 입력 폼 (SSOT - Red Color Coding) */}
      <div className="p-5 space-y-4">
        {/* 1. 철근 직경 (db) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">1. 철근 굵기 (직경 d_b)</label>
            <SemanticValue source="input" value={`H${state.db} (${state.db}mm)`} className="text-xs" />
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {STANDARD_DIAMETERS.map((d) => {
              const active = state.db === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange({ db: d })}
                  className={`py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
                      : 'bg-white text-[#DC2626] border-red-200 hover:border-[#DC2626]'
                  }`}
                >
                  H{d}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 & 3. 철근 강도(fy) / 콘크리트 강도(fck) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="input-fy" className="block text-xs font-semibold text-slate-700 mb-1">
              2. 철근 강도 (f_y)
            </label>
            <div className="relative">
              <input
                id="input-fy"
                type="number"
                min={200}
                max={800}
                step={10}
                value={state.fy}
                onChange={(e) => onChange({ fy: Number(e.target.value) || 400 })}
                className="w-full px-3 py-2 pr-12 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-sm font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                MPa
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="input-fck" className="block text-xs font-semibold text-slate-700 mb-1">
              3. 콘크리트 강도 (f_ck)
            </label>
            <div className="relative">
              <input
                id="input-fck"
                type="number"
                min={18}
                max={90}
                step={1}
                value={state.fck}
                onChange={(e) => onChange({ fck: Number(e.target.value) || 35 })}
                className="w-full px-3 py-2 pr-12 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-sm font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                MPa
              </span>
            </div>
          </div>
        </div>

        {/* 4 & 5. 피복두께(c) / 철근간격(CTC) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-cover" className="text-xs font-semibold text-slate-700">
                4. 피복두께 (c)
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange({ ignoreCoverForAnchorage: !state.ignoreCoverForAnchorage })
                }
                className={`text-[11px] px-1.5 py-0.5 rounded border ${
                  state.ignoreCoverForAnchorage
                    ? 'bg-red-50 border-[#DC2626] text-[#DC2626] font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {state.ignoreCoverForAnchorage ? '정착시 제외됨' : '정착시 포함'}
              </button>
            </div>
            <div className="relative">
              <input
                id="input-cover"
                type="number"
                min={10}
                max={300}
                step={5}
                value={state.cover}
                onChange={(e) => onChange({ cover: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-sm font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                mm
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="input-ctc" className="block text-xs font-semibold text-slate-700 mb-1">
              5. 철근 간격 (CTC)
            </label>
            <div className="relative">
              <input
                id="input-ctc"
                type="number"
                min={50}
                max={500}
                step={5}
                value={state.ctc}
                onChange={(e) => onChange({ ctc: Math.max(30, Number(e.target.value) || 125) })}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-sm font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                mm
              </span>
            </div>
          </div>
        </div>

        {/* 6. 철근 위치 (양호 / 불량) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">6. 철근 위치 (타설 조건)</span>
            <SemanticValue
              source="input"
              value={state.bondCondition === 'good' ? '양호 (1.0)' : '불량 (0.7)'}
              className="text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: 'good', label: '양호 (일반 위치)' },
                { key: 'poor', label: '불량 (위쪽 철근)' },
              ] as { key: BondCondition; label: string }[]
            ).map((item) => {
              const active = state.bondCondition === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange({ bondCondition: item.key })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-white text-[#DC2626] border-red-200 hover:border-[#DC2626]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. 갈고리 형성 유무 & 힘의 종류(인장/압축) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              7-1. 갈고리 여부
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { key: 'hook', label: '갈고리' },
                  { key: 'straight', label: '직선' },
                ] as { key: BarShape; label: string }[]
              ).map((item) => {
                const active = state.barShape === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onChange({ barShape: item.key })}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-[#DC2626] text-white border-[#DC2626]'
                        : 'bg-white text-[#DC2626] border-red-200 hover:border-[#DC2626]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              7-2. 작용하는 힘
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { key: 'tension', label: '인장(당김)' },
                  { key: 'compression', label: '압축(누름)' },
                ] as { key: StressZone; label: string }[]
              ).map((item) => {
                const active = state.stressZone === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onChange({ stressZone: item.key })}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-[#DC2626] text-white border-[#DC2626]'
                        : 'bg-white text-[#DC2626] border-red-200 hover:border-[#DC2626]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 8 & 9. 겹침이음계수 / 철근사용률 */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div>
            <label
              htmlFor="input-alpha6"
              className="block text-[11px] font-semibold text-slate-700 mb-1"
            >
              8. 이음계수 (α_6)
            </label>
            <input
              id="input-alpha6"
              type="number"
              min={1.0}
              max={1.5}
              step={0.05}
              value={state.spliceAlpha6}
              onChange={(e) => onChange({ spliceAlpha6: Number(e.target.value) || 1.5 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-xs font-bold text-[#DC2626] bg-red-50/20"
            />
          </div>

          <div>
            <label
              htmlFor="input-usage-anc"
              className="block text-[11px] font-semibold text-slate-700 mb-1"
            >
              9-1. 정착 사용률
            </label>
            <input
              id="input-usage-anc"
              type="number"
              min={0.1}
              max={1.0}
              step={0.05}
              value={state.rebarUsageRatioAnchorage}
              onChange={(e) =>
                onChange({ rebarUsageRatioAnchorage: Number(e.target.value) || 1.0 })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-xs font-bold text-[#DC2626] bg-red-50/20"
            />
          </div>

          <div>
            <label
              htmlFor="input-usage-spl"
              className="block text-[11px] font-semibold text-slate-700 mb-1"
            >
              9-2. 이음 사용률
            </label>
            <input
              id="input-usage-spl"
              type="number"
              min={0.1}
              max={1.0}
              step={0.05}
              value={state.rebarUsageRatioSplice}
              onChange={(e) =>
                onChange({ rebarUsageRatioSplice: Number(e.target.value) || 0.7 })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-xs font-bold text-[#DC2626] bg-red-50/20"
            />
          </div>
        </div>

        {/* 고정 상수 안내 (Black Color Coding - 한 줄 요약) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>적용 고정값:</span>
          <div className="flex flex-wrap items-center gap-2">
            <SemanticValue source="constant" symbol="ϕc" value={SYSTEM_CONSTANTS.phiC} />
            <span>·</span>
            <SemanticValue source="constant" symbol="ϕs" value={SYSTEM_CONSTANTS.phiS} />
            <span>·</span>
            <SemanticValue source="constant" symbol="최소" value="15db" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterInputDock;
