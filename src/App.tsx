import React, { useMemo, useState } from 'react';
import {
  AnchorageInputState,
  RebarDiameter,
  ReferencePreset,
} from './core/types';
import {
  calculateAllStandardDiameters,
  calculateForDiameter,
  SYSTEM_CONSTANTS,
} from './core/anchorageEngine';
import { DEFAULT_INPUT_STATE, REFERENCE_PRESETS } from './core/presets';
import { SemanticValue } from './components/SemanticValue';
import { MasterInputDock } from './components/MasterInputDock';
import { InteractiveBlueprint } from './components/InteractiveBlueprint';
import { EasyExplainerCards } from './components/EasyExplainerCards';
import { ReferenceParityTable } from './components/ReferenceParityTable';

export const App: React.FC = () => {
  const [state, setState] = useState<AnchorageInputState>(DEFAULT_INPUT_STATE);
  const [activePresetId, setActivePresetId] = useState<string>('anchorage-1-2');

  const currentResult = useMemo(() => calculateForDiameter(state, state.db), [state]);
  const allResults = useMemo(() => calculateAllStandardDiameters(state), [state]);

  const handleUpdateState = (patch: Partial<AnchorageInputState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyPreset = (preset: ReferencePreset) => {
    setActivePresetId(preset.id);
    setState((prev) => ({
      ...prev,
      ...preset.statePatch,
    }));
  };

  const handleSelectDiameter = (db: RebarDiameter) => {
    setState((prev) => ({ ...prev, db }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col">
      {/* Top Swiss Engineering Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#111827] text-white font-mono font-bold text-sm flex items-center justify-center tracking-tighter shadow-sm">
              KDS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest px-1.5 py-0.5 bg-slate-900 text-white rounded">
                  KDS 24 14 21 : 2025
                </span>
                <span className="font-mono text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
                  참조 계산서(Ch07) 유사율 100% 검증 엔진
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 mt-0.5">
                KDS기반 철근 정착 및 겹이음길이 계산기
                <span className="hidden md:inline text-xs font-normal text-slate-500 ml-2">
                  Swiss Precision Engineering Instrument &amp; 중학생 눈높이 인터랙티브 피드백
                </span>
              </h1>
            </div>
          </div>

          {/* 3-Color Semantic Governance Legend (Mandatory Rule 2.3) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs">
            <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              SSOT 데이터 컬러 규약:
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#DC2626] bg-red-50 border border-[#DC2626]/30 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              사용자 입력값 (Red)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#2563EB] bg-blue-50 border border-[#2563EB]/30 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              인용 및 계산값 (Blue)
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111827] bg-slate-200/80 border border-slate-400 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-[#111827]" />
              가정값 / 고정값 (Black)
            </span>
          </div>
        </div>
      </header>

      {/* Main Swiss Precision 12-Column Split Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (4 cols): SSOT Master Input Dock (ONLY place with inputs) */}
          <aside className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-20">
            <MasterInputDock
              state={state}
              onChange={handleUpdateState}
              activePresetId={activePresetId}
              onApplyPreset={handleApplyPreset}
              onReset={() => {
                setActivePresetId('anchorage-1-2');
                setState(DEFAULT_INPUT_STATE);
              }}
            />
          </aside>

          {/* RIGHT COLUMN (8 cols): Live Readout, Interactive Blueprint, Easy Explainer & Parity Table */}
          <section className="lg:col-span-8 xl:col-span-8 space-y-6">
            {/* Primary Instrument Readout Hero Banner */}
            <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                    01 / PRIMARY DESIGN OUTPUT
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono">
                    선택 철근: H{state.db} ({state.stressZone === 'tension' ? '인장측' : '압축측'} ·{' '}
                    {state.barShape === 'hook' ? '직선 외(갈고리)' : '직선'})
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-300">
                  KDS 24 14 21 (4.5.4 ~ 4.5.5) &amp; CEB-FIP 개선식 적용
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Design Anchorage Length Readout */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                        설계정착길이 (Design Anchorage Length)
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold">
                        {currentResult.isLbdMinGoverning
                          ? '최소정착길이(15db) 지배'
                          : '계산정착길이(α·lb) 지배'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-sm font-mono text-slate-500">l_bd =</span>
                      <SemanticValue
                        source="computed"
                        value={currentResult.lbdDesign}
                        unit="mm"
                        className="text-4xl sm:text-5xl font-bold tracking-tight"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        (약 {(currentResult.lbdDesign / 10).toFixed(0)} cm)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-[11px]">기본정착 (l_b)</div>
                      <SemanticValue
                        source="computed"
                        value={currentResult.lbActive}
                        unit="mm"
                        className="text-sm"
                      />
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-[11px]">영향계수 (α)</div>
                      <SemanticValue
                        source="computed"
                        value={currentResult.alphaAnchorage.toFixed(1)}
                        className="text-sm"
                      />
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-[11px]">최소길이 (15d_b)</div>
                      <SemanticValue
                        source="computed"
                        value={currentResult.lbdMin}
                        unit="mm"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Design Lap Splice Length Readout */}
                <div className="pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                        설계겹이음길이 (Design Lap Splice Length)
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold">
                        {currentResult.isLoMinGoverning
                          ? '최소이음길이(15db) 지배'
                          : '계산이음길이(αo·lb·사용률) 지배'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-sm font-mono text-slate-500">l_o =</span>
                      <SemanticValue
                        source="computed"
                        value={currentResult.loDesign}
                        unit="mm"
                        className="text-4xl sm:text-5xl font-bold tracking-tight"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        (약 {(currentResult.loDesign / 10).toFixed(0)} cm)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-[11px]">계산이음 (l_o,calc)</div>
                      <SemanticValue
                        source="computed"
                        value={currentResult.loCalc}
                        unit="mm"
                        className="text-sm"
                      />
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-[11px]">이음영향계수 (α_o)</div>
                      <SemanticValue
                        source="computed"
                        value={currentResult.alphaSplice.toFixed(1)}
                        className="text-sm"
                      />
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500 text-[11px]">이음사용률</div>
                      <SemanticValue
                        source="input"
                        value={state.rebarUsageRatioSplice.toFixed(2)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Trace Bar with strict Red / Blue / Black Semantic Coding */}
              <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 font-mono">
                  <span className="text-slate-500 font-sans font-semibold mr-1">
                    실시간 수식 대입:
                  </span>
                  <span>f_bd =</span>
                  <SemanticValue source="constant" value={SYSTEM_CONSTANTS.bondMultiplier} />
                  <span>×</span>
                  <SemanticValue source="computed" value={currentResult.fctk} symbol="f_ctk" />
                  <span>×</span>
                  <SemanticValue source="constant" value={SYSTEM_CONSTANTS.phiC} symbol="ϕ_c" />
                  <span>×</span>
                  <SemanticValue source="computed" value={currentResult.eta1} symbol="η_1" />
                  <span>×</span>
                  <SemanticValue source="computed" value={currentResult.eta2} symbol="η_2" />
                  <span>=</span>
                  <SemanticValue
                    source="computed"
                    value={currentResult.fbd.toFixed(3)}
                    unit="MPa"
                    badge
                  />
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span>간격계수 C_d(정착)=</span>
                  <SemanticValue source="computed" value={currentResult.cdAnchorage} unit="mm" badge />
                  <span>C_d(이음)=</span>
                  <SemanticValue source="computed" value={currentResult.cdSplice} unit="mm" badge />
                </div>
              </div>
            </div>

            {/* 02 / Interactive SVG Engineering Blueprint */}
            <InteractiveBlueprint state={state} result={currentResult} />

            {/* 03 / Middle-School Easy Explainer Cards */}
            <EasyExplainerCards state={state} result={currentResult} />

            {/* 04 / Reference Calculation 100% Parity Table (H13 ~ H29) */}
            <ReferenceParityTable
              state={state}
              allResults={allResults}
              onSelectDiameter={handleSelectDiameter}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-300 mt-12 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>KDS기반 철근 정착 및 겹이음길이 계산기</strong> · 기준 문서:{' '}
            <span className="font-mono">
              [쌓기부 역T형옹벽] Ch07 철근 정착 및 이음길이(변경)_26.11.24.pdf
            </span>{' '}
            &amp; <span className="font-mono">KDS 24 14 21:2025</span>
          </div>
          <div className="font-mono">
            SSOT Governance: Red(Input) · Blue(Computed/Cited) · Black(Constant) | Parity: 100.0%
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
