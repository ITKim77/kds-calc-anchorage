import React, { useEffect, useState } from 'react';
import {
  AnchorageInputState,
  BarShape,
  BondCondition,
  RebarDiameter,
  StressZone,
} from '../core/types';
import { SYSTEM_CONSTANTS } from '../core/anchorageEngine';
import { SemanticValue } from './SemanticValue';
import { RotateCcw } from 'lucide-react';

export interface MasterInputDockProps {
  state: AnchorageInputState;
  onChange: (patch: Partial<AnchorageInputState>) => void;
  onReset?: () => void;
}

const ALL_DIAMETERS: RebarDiameter[] = [13, 16, 19, 22, 25, 29, 32, 35];

type NumericFieldKey =
  | 'fy'
  | 'fck'
  | 'cover'
  | 'ctc'
  | 'spliceAlpha6'
  | 'rebarUsageRatioAnchorage'
  | 'rebarUsageRatioSplice';

/**
 * 단일 입력 패널 (SSOT MasterInputDock)
 * - 숫자 입력창을 직접 지우고 타이핑할 때 앞자리에 강제 기본값(30, 125 등)이 붙지 않도록
 *   로컬 문자열 버퍼(drafts)를 통해 빈 문자열("") 상태를 허용하고, 유효 숫자 입력 시 즉시 반영 및 onBlur 시 보정
 */
export const MasterInputDock: React.FC<MasterInputDockProps> = ({
  state,
  onChange,
  onReset,
}) => {
  const [drafts, setDrafts] = useState<Record<NumericFieldKey, string>>({
    fy: String(state.fy),
    fck: String(state.fck),
    cover: String(state.cover),
    ctc: String(state.ctc),
    spliceAlpha6: String(state.spliceAlpha6),
    rebarUsageRatioAnchorage: String(state.rebarUsageRatioAnchorage),
    rebarUsageRatioSplice: String(state.rebarUsageRatioSplice),
  });

  // 외부 상태(초기화 등)가 변경되면 입력창 표시 문자열 동기화
  useEffect(() => {
    setDrafts({
      fy: String(state.fy),
      fck: String(state.fck),
      cover: String(state.cover),
      ctc: String(state.ctc),
      spliceAlpha6: String(state.spliceAlpha6),
      rebarUsageRatioAnchorage: String(state.rebarUsageRatioAnchorage),
      rebarUsageRatioSplice: String(state.rebarUsageRatioSplice),
    });
  }, [
    state.fy,
    state.fck,
    state.cover,
    state.ctc,
    state.spliceAlpha6,
    state.rebarUsageRatioAnchorage,
    state.rebarUsageRatioSplice,
  ]);

  const handleNumericChange = (
    field: NumericFieldKey,
    rawValue: string,
    extraPatch?: Partial<AnchorageInputState>
  ) => {
    setDrafts((prev) => ({ ...prev, [field]: rawValue }));

    // 사용자가 백스페이스로 모두 지운 동안에는 강제 숫자를 덮어씌우지 않고 그대로 유지
    if (rawValue.trim() === '') {
      return;
    }

    const parsed = Number(rawValue);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onChange({
        [field]: parsed,
        ...extraPatch,
      });
    }
  };

  const handleNumericBlur = (
    field: NumericFieldKey,
    fallback: number,
    min: number,
    max: number,
    extraPatch?: Partial<AnchorageInputState>
  ) => {
    const raw = drafts[field].trim();
    const parsed = Number(raw);
    const validNumber =
      raw === '' || Number.isNaN(parsed)
        ? fallback
        : Math.min(Math.max(parsed, min), max);

    setDrafts((prev) => ({ ...prev, [field]: String(validNumber) }));
    onChange({
      [field]: validNumber,
      ...extraPatch,
    });
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* 상단 헤더 */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626]" />
          <h2 className="text-lg font-bold text-slate-900">조건 입력</h2>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="기본값 초기화"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 bg-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
        )}
      </div>

      {/* 9대 핵심 입력 폼 (SSOT - Red Color Coding) */}
      <div className="p-6 space-y-5">
        {/* 1. 철근 직경 (db: H13 ~ H35) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-800">
              1. 철근 굵기 (직경 d_b)
            </label>
            <SemanticValue
              source="input"
              value={`H${state.db} (${state.db}mm)`}
              className="text-base font-bold"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
            {ALL_DIAMETERS.map((d) => {
              const active = state.db === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange({ db: d })}
                  className={`py-3 rounded-xl font-mono text-base font-bold border-2 transition-all ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm scale-[1.02]'
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="input-fy" className="block text-sm font-bold text-slate-800 mb-1.5">
              2. 철근 강도 (f_y)
            </label>
            <div className="relative">
              <input
                id="input-fy"
                type="number"
                min={200}
                max={800}
                step={10}
                value={drafts.fy}
                onChange={(e) => handleNumericChange('fy', e.target.value)}
                onBlur={() => handleNumericBlur('fy', 400, 100, 1000)}
                className="w-full px-4 py-3 pr-14 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-lg font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono">
                MPa
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="input-fck" className="block text-sm font-bold text-slate-800 mb-1.5">
              3. 콘크리트 강도 (f_ck)
            </label>
            <div className="relative">
              <input
                id="input-fck"
                type="number"
                min={18}
                max={90}
                step={1}
                value={drafts.fck}
                onChange={(e) => handleNumericChange('fck', e.target.value)}
                onBlur={() => handleNumericBlur('fck', 35, 10, 120)}
                className="w-full px-4 py-3 pr-14 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-lg font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono">
                MPa
              </span>
            </div>
          </div>
        </div>

        {/* 4 & 5. 피복두께(c) / 철근간격(CTC) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="input-cover" className="block text-sm font-bold text-slate-800 mb-1.5">
              4. 순피복두께 (c)
            </label>
            <div className="relative">
              <input
                id="input-cover"
                type="number"
                min={5}
                max={500}
                step={5}
                value={drafts.cover}
                onChange={(e) =>
                  handleNumericChange('cover', e.target.value, {
                    ignoreCoverForAnchorage: false,
                  })
                }
                onBlur={() =>
                  handleNumericBlur('cover', 30, 0, 1000, {
                    ignoreCoverForAnchorage: false,
                  })
                }
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-lg font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono">
                mm
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="input-ctc" className="block text-sm font-bold text-slate-800 mb-1.5">
              5. 철근 간격 (CTC)
            </label>
            <div className="relative">
              <input
                id="input-ctc"
                type="number"
                min={20}
                max={1000}
                step={5}
                value={drafts.ctc}
                onChange={(e) =>
                  handleNumericChange('ctc', e.target.value, {
                    useReferenceFixedClearSpacing: false,
                  })
                }
                onBlur={() =>
                  handleNumericBlur('ctc', 125, 20, 2000, {
                    useReferenceFixedClearSpacing: false,
                  })
                }
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-lg font-bold text-[#DC2626] bg-red-50/20"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono">
                mm
              </span>
            </div>
          </div>
        </div>

        {/* 6. 철근 위치 (양호 / 불량) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-slate-800">6. 철근 위치 (타설 조건)</span>
            <SemanticValue
              source="input"
              value={state.bondCondition === 'good' ? '양호 (η₁=1.0)' : '불량 (η₁=0.7)'}
              className="text-sm font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
                  className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-sm font-bold text-slate-800 mb-1.5">
              7-1. 갈고리 여부
            </span>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
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
            <span className="block text-sm font-bold text-slate-800 mb-1.5">
              7-2. 작용하는 힘
            </span>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
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
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div>
            <label
              htmlFor="input-alpha6"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              8. 이음계수 (α_6)
            </label>
            <input
              id="input-alpha6"
              type="number"
              min={1.0}
              max={1.5}
              step={0.05}
              value={drafts.spliceAlpha6}
              onChange={(e) => handleNumericChange('spliceAlpha6', e.target.value)}
              onBlur={() => handleNumericBlur('spliceAlpha6', 1.5, 0.5, 2.0)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-base font-bold text-[#DC2626] bg-red-50/20"
            />
          </div>

          <div>
            <label
              htmlFor="input-usage-anc"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              9-1. 정착 사용률
            </label>
            <input
              id="input-usage-anc"
              type="number"
              min={0.1}
              max={1.0}
              step={0.05}
              value={drafts.rebarUsageRatioAnchorage}
              onChange={(e) =>
                handleNumericChange('rebarUsageRatioAnchorage', e.target.value)
              }
              onBlur={() =>
                handleNumericBlur('rebarUsageRatioAnchorage', 1.0, 0.1, 1.5)
              }
              className="w-full px-3 py-2.5 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-base font-bold text-[#DC2626] bg-red-50/20"
            />
          </div>

          <div>
            <label
              htmlFor="input-usage-spl"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              9-2. 이음 사용률
            </label>
            <input
              id="input-usage-spl"
              type="number"
              min={0.1}
              max={1.0}
              step={0.05}
              value={drafts.rebarUsageRatioSplice}
              onChange={(e) =>
                handleNumericChange('rebarUsageRatioSplice', e.target.value)
              }
              onBlur={() => handleNumericBlur('rebarUsageRatioSplice', 0.7, 0.1, 1.5)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-red-300 focus:border-[#DC2626] focus:outline-none font-mono text-base font-bold text-[#DC2626] bg-red-50/20"
            />
          </div>
        </div>

        {/* 고정 상수 안내 (Black Color Coding) */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span className="font-semibold">적용 고정값:</span>
          <div className="flex flex-wrap items-center gap-3">
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
