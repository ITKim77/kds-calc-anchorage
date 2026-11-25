import React from 'react';
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
import {
  Sliders,
  BookmarkCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface MasterInputDockProps {
  state: AnchorageInputState;
  onChange: (patch: Partial<AnchorageInputState>) => void;
  onApplyPreset?: (preset: ReferencePreset) => void;
  onReset?: () => void;
  activePresetId?: string | null;
}

const ALL_DIAMETERS: RebarDiameter[] = [13, 16, 19, 22, 25, 29, 32, 35];
const FY_QUICK_OPTIONS = [300, 400, 500];
const FCK_QUICK_OPTIONS = [24, 30, 35, 40, 50];

/**
 * SSOT 단일 마스터 입력 도크 (MasterInputDock)
 * - 애플리케이션 전체에서 유일하게 <input> / <select> 컨트롤을 보유하는 단일 진실 공급원(SSOT)
 * - 9대 핵심 사용자 입력 변수를 100% Red (#DC2626) 시맨틱 컬러로 강제 시각화
 * - 하단에는 시스템 고정 상수를 Black (#111827) 시맨틱 컬러로 명시
 */
export const MasterInputDock: React.FC<MasterInputDockProps> = ({
  state,
  onChange,
  onApplyPreset,
  onReset,
  activePresetId,
}) => {
  const handleApplyPreset = (preset: ReferencePreset) => {
    if (onApplyPreset) {
      onApplyPreset(preset);
    } else {
      onChange(preset.statePatch);
    }
  };

  // 현재 상태가 어떤 프리셋과 일치하는지 판별
  const isPresetMatched = (preset: ReferencePreset): boolean => {
    if (activePresetId) return activePresetId === preset.id;
    const p = preset.statePatch;
    return (
      (p.fy === undefined || p.fy === state.fy) &&
      (p.fck === undefined || p.fck === state.fck) &&
      (p.ctc === undefined || p.ctc === state.ctc) &&
      (p.cover === undefined || p.cover === state.cover) &&
      (p.ignoreCoverForAnchorage === undefined ||
        p.ignoreCoverForAnchorage === state.ignoreCoverForAnchorage) &&
      (p.bondCondition === undefined || p.bondCondition === state.bondCondition) &&
      (p.barShape === undefined || p.barShape === state.barShape) &&
      (p.stressZone === undefined || p.stressZone === state.stressZone)
    );
  };

  return (
    <aside
      aria-label="SSOT 마스터 입력 도크"
      className="bg-white border-2 border-slate-900 rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col overflow-hidden"
    >
      {/* 상단 헤더: SSOT 선언 및 3원색 범례 */}
      <div className="bg-slate-900 text-white px-4 py-3 border-b-2 border-slate-900">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#DC2626] text-white font-mono text-xs font-bold">
              IN
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#DC2626]" />
                <span>SSOT 마스터 입력 도크 (9대 변수)</span>
              </h2>
              <p className="text-[11px] text-slate-300 font-mono">
                Single Source of Truth · 사용자 입력 단일 통제소
              </p>
            </div>
          </div>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="기본값으로 초기화"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>

        {/* 3원색 컬러 코딩 규칙 요약 바 */}
        <div className="mt-2.5 pt-2 border-t border-slate-700/80 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 bg-red-950/70 border border-[#DC2626] px-2 py-1 text-red-200">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
            <span className="truncate font-semibold">입력값: Red</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/50 px-2 py-1 text-blue-200">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
            <span className="truncate">계산값: Blue</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-500 px-2 py-1 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            <span className="truncate">고정값: Black</span>
          </div>
        </div>
      </div>

      {/* 참조 계산서(Ch07) 5대 검증 구간 원클릭 로더 */}
      <div className="bg-slate-50 px-4 py-3 border-b-2 border-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#DC2626]" />
            참조 계산서(Ch07) 5대 검증 구간 원클릭 로더
          </span>
          <span className="text-[10px] font-mono text-slate-500">100% 정합 프리셋</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {REFERENCE_PRESETS.map((preset) => {
            const matched = isPresetMatched(preset);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                title={`${preset.title}\n(${preset.description})`}
                className={`px-1.5 py-1.5 text-center border font-mono text-[11px] font-bold transition-all ${
                  matched
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-[#DC2626] hover:text-[#DC2626]'
                }`}
              >
                <div className="flex items-center justify-center gap-0.5">
                  {matched && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                  <span className="truncate">{preset.code}</span>
                </div>
              </button>
            );
          })}
        </div>
        {/* 현재 선택된 프리셋 설명 표시 */}
        {REFERENCE_PRESETS.map((preset) =>
          isPresetMatched(preset) ? (
            <div
              key={`${preset.id}-desc`}
              className="mt-2 px-2.5 py-1.5 bg-red-50/80 border border-[#DC2626]/30 text-[11px] text-slate-700 flex items-start gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#DC2626]">{preset.title}</div>
                <div className="text-slate-600 text-[10px]">{preset.description}</div>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* 9대 SSOT 사용자 입력 컨트롤 리스트 (01 ~ 09) */}
      <div className="divide-y divide-slate-200">
        {/* 01. 철근 항복강도 fy */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                01
              </span>
              <label
                htmlFor="ssot-input-fy"
                className="text-xs font-bold text-slate-900 cursor-pointer"
              >
                철근 항복강도 (<span className="font-mono text-[#DC2626]">f_y</span>)
              </label>
            </div>
            <SemanticValue source="input" symbol="fy" value={state.fy} unit="MPa" badge />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            철근이 영구적으로 늘어나기 시작하는 한계 힘 (SD400 = 400MPa)
          </p>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                id="ssot-input-fy"
                type="number"
                min={200}
                max={800}
                step={10}
                value={state.fy}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0) onChange({ fy: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#DC2626]/70">
                MPa
              </span>
            </div>
            <div className="flex gap-1">
              {FY_QUICK_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ fy: v })}
                  className={`px-2 py-1.5 text-xs font-mono font-bold border transition-colors ${
                    state.fy === v
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-white text-[#DC2626] border-[#DC2626]/40 hover:bg-red-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 02. 콘크리트 압축강도 fck */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                02
              </span>
              <label
                htmlFor="ssot-input-fck"
                className="text-xs font-bold text-slate-900 cursor-pointer"
              >
                콘크리트 압축강도 (<span className="font-mono text-[#DC2626]">f_ck</span>)
              </label>
            </div>
            <SemanticValue source="input" symbol="fck" value={state.fck} unit="MPa" badge />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            콘크리트가 단단하게 버티는 힘 — 클수록 철근을 꽉 잡아줍니다
          </p>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                id="ssot-input-fck"
                type="number"
                min={18}
                max={90}
                step={1}
                value={state.fck}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0) onChange({ fck: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#DC2626]/70">
                MPa
              </span>
            </div>
            <div className="flex gap-1">
              {FCK_QUICK_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ fck: v })}
                  className={`px-1.5 py-1.5 text-xs font-mono font-bold border transition-colors ${
                    state.fck === v
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-white text-[#DC2626] border-[#DC2626]/40 hover:bg-red-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 03. 순피복두께 cover (c) */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                03
              </span>
              <label
                htmlFor="ssot-input-cover"
                className="text-xs font-bold text-slate-900 cursor-pointer"
              >
                순피복두께 (<span className="font-mono text-[#DC2626]">c</span>)
              </label>
            </div>
            <SemanticValue
              source="input"
              symbol="c"
              value={state.ignoreCoverForAnchorage ? `${state.cover} (정착무시)` : state.cover}
              unit="mm"
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            콘크리트 바깥 표면에서 철근 표면까지의 가장 짧은 덮개 두께
          </p>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="relative flex-1">
              <input
                id="ssot-input-cover"
                type="number"
                min={10}
                max={300}
                step={5}
                value={state.cover}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val >= 0) onChange({ cover: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#DC2626]/70">
                mm
              </span>
            </div>
            {[30, 45, 50, 80].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ cover: v })}
                className={`px-2 py-1.5 text-xs font-mono font-bold border transition-colors ${
                  state.cover === v
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-white text-[#DC2626] border-[#DC2626]/40 hover:bg-red-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {/* 정착 시 순피복 해당없음 토글 */}
          <button
            type="button"
            onClick={() =>
              onChange({ ignoreCoverForAnchorage: !state.ignoreCoverForAnchorage })
            }
            className={`w-full px-2.5 py-1.5 text-left text-[11px] font-mono border flex items-center justify-between transition-colors ${
              state.ignoreCoverForAnchorage
                ? 'bg-red-50 border-[#DC2626] text-[#DC2626] font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-[#DC2626]/50'
            }`}
          >
            <span>정착 시 순피복 해당없음 (계산서 ①·② 구간, Cd = a/2)</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-white border border-current">
              {state.ignoreCoverForAnchorage ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* 04. 철근 중심간격 C.T.C */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                04
              </span>
              <label
                htmlFor="ssot-input-ctc"
                className="text-xs font-bold text-slate-900 cursor-pointer"
              >
                철근 중심간격 (<span className="font-mono text-[#DC2626]">C.T.C</span>)
              </label>
            </div>
            <SemanticValue source="input" symbol="CTC" value={state.ctc} unit="mm" badge />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            이웃한 두 철근 중심 사이의 거리 (정착 125mm / 이음 250mm 기준)
          </p>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="relative flex-1">
              <input
                id="ssot-input-ctc"
                type="number"
                min={50}
                max={500}
                step={5}
                value={state.ctc}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0) onChange({ ctc: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#DC2626]/70">
                mm
              </span>
            </div>
            {[100, 125, 150, 200, 250].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ctc: v })}
                className={`px-1.5 py-1.5 text-xs font-mono font-bold border transition-colors ${
                  state.ctc === v
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-white text-[#DC2626] border-[#DC2626]/40 hover:bg-red-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {/* 참조 계산서 대표 순간격(a = CTC - 25) 모드 토글 */}
          <button
            type="button"
            onClick={() =>
              onChange({
                useReferenceFixedClearSpacing: !state.useReferenceFixedClearSpacing,
              })
            }
            className={`w-full px-2.5 py-1.5 text-left text-[11px] font-mono border flex items-center justify-between transition-colors ${
              state.useReferenceFixedClearSpacing
                ? 'bg-red-50 border-[#DC2626] text-[#DC2626] font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-[#DC2626]/50'
            }`}
          >
            <span>참조 계산서 대표 순간격(a = CTC - 25) 적용</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-white border border-current">
              {state.useReferenceFixedClearSpacing ? '계산서 모드' : '개별직경 모드'}
            </span>
          </button>
        </div>

        {/* 05. 선택 철근 직경 db */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                05
              </span>
              <span className="text-xs font-bold text-slate-900">
                철근 직경 (<span className="font-mono text-[#DC2626]">d_b</span>)
              </span>
            </div>
            <SemanticValue
              source="input"
              symbol="db"
              value={`H${state.db} (${state.db})`}
              unit="mm"
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            철근의 굵기(지름) — 굵을수록 뽑히지 않게 더 깊이 묻어야 합니다
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_DIAMETERS.map((d) => {
              const selected = state.db === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange({ db: d })}
                  className={`py-1.5 px-2 font-mono text-xs font-bold border-2 transition-all ${
                    selected
                      ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
                      : 'bg-red-50/30 text-[#DC2626] border-[#DC2626]/50 hover:border-[#DC2626] hover:bg-red-50'
                  }`}
                >
                  H{d}
                </button>
              );
            })}
          </div>
        </div>

        {/* 06. 철근 위치 조건 bondCondition (η1) */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                06
              </span>
              <span className="text-xs font-bold text-slate-900">
                철근 위치 및 부착 조건 (<span className="font-mono text-[#DC2626]">η_1</span>)
              </span>
            </div>
            <SemanticValue
              source="input"
              symbol="η1"
              value={state.bondCondition === 'good' ? '1.0 (양호)' : '0.7 (불량)'}
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            콘크리트 타설 시 철근 아래에 물이나 공기가 고이지 않는 좋은 위치인지 선택
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { key: 'good', label: '양호 (η₁ = 1.0)', sub: '일반 구간 / 하부근' },
                { key: 'poor', label: '불량 (η₁ = 0.7)', sub: '300mm 초과 상부근' },
              ] as { key: BondCondition; label: string; sub: string }[]
            ).map((item) => {
              const active = state.bondCondition === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange({ bondCondition: item.key })}
                  className={`p-2 text-left border-2 transition-all ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-red-50/30 text-[#DC2626] border-[#DC2626]/50 hover:border-[#DC2626]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      active ? 'text-red-100' : 'text-slate-500'
                    }`}
                  >
                    {item.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 07. 갈고리 형상 (barShape) 및 부재력 구역 (stressZone) */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                07
              </span>
              <span className="text-xs font-bold text-slate-900">
                갈고리 형성 & 부재력 구역 (<span className="font-mono text-[#DC2626]">α_1, 구역</span>)
              </span>
            </div>
            <SemanticValue
              source="input"
              value={`${state.stressZone === 'tension' ? '인장' : '압축'}·${
                state.barShape === 'hook' ? '직선외' : '직선'
              }`}
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            철근이 당겨지는지(인장)/눌리는지(압축)와 끝을 구부렸는지(갈고리) 선택
          </p>
          {/* 부재력 작용 구역: 인장측 vs 압축측 */}
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            {(
              [
                { key: 'tension', label: '인장측 (Tension)', sub: '당기는 힘 작용' },
                { key: 'compression', label: '압축측 (Compression)', sub: '선단지압 15db 차감' },
              ] as { key: StressZone; label: string; sub: string }[]
            ).map((item) => {
              const active = state.stressZone === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange({ stressZone: item.key })}
                  className={`p-2 text-left border-2 transition-all ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-red-50/30 text-[#DC2626] border-[#DC2626]/50 hover:border-[#DC2626]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      active ? 'text-red-100' : 'text-slate-500'
                    }`}
                  >
                    {item.sub}
                  </div>
                </button>
              );
            })}
          </div>
          {/* 철근 끝단 형상: 직선 외(갈고리) vs 직선 */}
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { key: 'hook', label: '직선 외 (갈고리 형성)', sub: '표준갈고리 정착' },
                { key: 'straight', label: '직선 (갈고리 미형성)', sub: '직선 정착·겹침이음' },
              ] as { key: BarShape; label: string; sub: string }[]
            ).map((item) => {
              const active = state.barShape === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange({ barShape: item.key })}
                  className={`p-2 text-left border-2 transition-all ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-red-50/30 text-[#DC2626] border-[#DC2626]/50 hover:border-[#DC2626]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      active ? 'text-red-100' : 'text-slate-500'
                    }`}
                  >
                    {item.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 08. 겹침이음계수 spliceAlpha6 (α6,lo) */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                08
              </span>
              <label
                htmlFor="ssot-input-alpha6"
                className="text-xs font-bold text-slate-900 cursor-pointer"
              >
                겹침이음계수 (<span className="font-mono text-[#DC2626]">α_6,lo</span>)
              </label>
            </div>
            <SemanticValue source="input" symbol="α6,lo" value={state.spliceAlpha6} badge />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            같은 위치에서 한꺼번에 이어지는 철근 비율(ρ₁)에 따른 할증 계수 (전수이음 = 1.5)
          </p>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                id="ssot-input-alpha6"
                type="number"
                min={1.0}
                max={2.0}
                step={0.05}
                value={state.spliceAlpha6}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val >= 1.0) onChange({ spliceAlpha6: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
            </div>
            {[
              { val: 1.0, label: '1.0 (<25%)' },
              { val: 1.4, label: '1.4 (50%)' },
              { val: 1.5, label: '1.5 (100%)' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => onChange({ spliceAlpha6: opt.val })}
                className={`px-2 py-1.5 text-[11px] font-mono font-bold border transition-colors ${
                  state.spliceAlpha6 === opt.val
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-white text-[#DC2626] border-[#DC2626]/40 hover:bg-red-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 09. 철근사용률 (As,req / As,used) */}
        <div className="p-3.5 hover:bg-red-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#DC2626] text-white">
                09
              </span>
              <span className="text-xs font-bold text-slate-900">
                철근사용률 (<span className="font-mono text-[#DC2626]">A_s,req / A_s,used</span>)
              </span>
            </div>
            <SemanticValue
              source="input"
              value={`정착 ${state.rebarUsageRatioAnchorage} / 이음 ${state.rebarUsageRatioSplice}`}
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            필요한 철근량 대비 실제 배근한 철근량 비율 (여유가 많을수록 이음길이 감소)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="ssot-input-usage-anchorage"
                className="block text-[10px] font-mono font-bold text-slate-700 mb-1"
              >
                정착 사용률 (계산서 1.0)
              </label>
              <input
                id="ssot-input-usage-anchorage"
                type="number"
                min={0.1}
                max={1.5}
                step={0.05}
                value={state.rebarUsageRatioAnchorage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0)
                    onChange({ rebarUsageRatioAnchorage: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
            </div>
            <div>
              <label
                htmlFor="ssot-input-usage-splice"
                className="block text-[10px] font-mono font-bold text-slate-700 mb-1"
              >
                겹침이음 사용률 (계산서 0.7)
              </label>
              <input
                id="ssot-input-usage-splice"
                type="number"
                min={0.1}
                max={1.5}
                step={0.05}
                value={state.rebarUsageRatioSplice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0)
                    onChange({ rebarUsageRatioSplice: val });
                }}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold text-[#DC2626] bg-red-50/40 border-2 border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 tabular-nums"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 상수 및 가정값 요약 박스 (Black #111827) */}
      <div className="bg-slate-100 px-4 py-3 border-t-2 border-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#111827]" />
            KDS 24 14 21 시스템 고정 상수 및 가정값 (Black)
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <SemanticValue
            source="constant"
            symbol="ϕc"
            value={SYSTEM_CONSTANTS.phiC.toFixed(2)}
            badge
            title="콘크리트 재료계수 (고정값)"
          />
          <SemanticValue
            source="constant"
            symbol="ϕs"
            value={SYSTEM_CONSTANTS.phiS.toFixed(2)}
            badge
            title="철근 재료계수 (고정값)"
          />
          <SemanticValue
            source="constant"
            symbol="α3·α4·α5"
            value="1.0"
            badge
            title="횡철근·용접·횡압력 보수적 가정값 = 1.0"
          />
          <SemanticValue
            source="constant"
            symbol="최소길이"
            value={`${SYSTEM_CONSTANTS.minFactorDb}db`}
            badge
            title="최소 정착 및 겹침이음길이 계수 (15db)"
          />
          <SemanticValue
            source="constant"
            symbol="선단지압"
            value={`${SYSTEM_CONSTANTS.endBearingFactor}db`}
            badge
            title="압축측 선단지압 차감 계수 (15db)"
          />
        </div>
      </div>
    </aside>
  );
};

export default MasterInputDock;
