import React, { useMemo, useState } from 'react';
import {
  AnchorageInputState,
  RebarDiameter,
  ReferencePreset,
} from './core/types';
import {
  calculateAllStandardDiameters,
  calculateForDiameter,
} from './core/anchorageEngine';
import { DEFAULT_INPUT_STATE } from './core/presets';
import { SemanticValue } from './components/SemanticValue';
import { MasterInputDock } from './components/MasterInputDock';
import { InteractiveBlueprint } from './components/InteractiveBlueprint';
import { EasyExplainerCards } from './components/EasyExplainerCards';
import { ReferenceParityTable } from './components/ReferenceParityTable';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Table,
  X,
} from 'lucide-react';

export const App: React.FC = () => {
  const [state, setState] = useState<AnchorageInputState>(DEFAULT_INPUT_STATE);
  const [activePresetId, setActivePresetId] = useState<string>('anchorage-1-2');

  // 필요할 때만 클릭해서 여는 토글 상태 (기본 닫힘 -> 화면 정보량 50% 이상 감축)
  const [showSteps, setShowSteps] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showDiagramModal, setShowDiagramModal] = useState<boolean>(false);

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
      {/* 심플하고 깔끔한 상단 헤더 (홍보성 문구 제거) */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
              KDS
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              철근 정착 및 겹이음길이 계산기
            </h1>
          </div>

          {/* 3원색 색상 안내 (간결한 범례) */}
          <div className="flex items-center gap-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#DC2626]">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              입력값
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#2563EB]">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              계산결과
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#111827]" />
              고정값
            </span>
          </div>
        </div>
      </header>

      {/* 메인 화면: 좌측 [조건 입력] + 우측 [핵심 결과 & 선택형 펼침 메뉴] */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 (5칸): 단일 입력 패널 (SSOT) */}
          <aside className="lg:col-span-5">
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

          {/* 우측 (7칸): 핵심 결과 + 필요할 때만 열어보는 3개의 깔끔한 버튼/아코디언 */}
          <section className="lg:col-span-7 space-y-4">
            {/* 1. 핵심 계산 결과 카드 (가장 중요) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <h2 className="text-sm font-bold text-slate-900">계산 결과</h2>
                </div>
                <div className="text-xs text-slate-500">
                  선택 철근:{' '}
                  <SemanticValue source="input" value={`H${state.db}`} className="font-bold" /> ·{' '}
                  <SemanticValue
                    source="input"
                    value={state.stressZone === 'tension' ? '인장' : '압축'}
                  />{' '}
                  ·{' '}
                  <SemanticValue
                    source="input"
                    value={state.barShape === 'hook' ? '갈고리' : '직선'}
                  />
                </div>
              </div>

              {/* 두 가지 핵심 결과 크게 표시 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 설계정착길이 */}
                <div className="p-5 rounded-xl bg-blue-50/40 border border-blue-200/80">
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    설계정착길이 (l_bd)
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <SemanticValue
                      source="computed"
                      value={currentResult.lbdDesign}
                      unit="mm"
                      className="text-4xl font-bold tracking-tight"
                    />
                    <span className="text-xs text-slate-500 font-mono">
                      ({(currentResult.lbdDesign / 10).toFixed(0)} cm)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    기본 <SemanticValue source="computed" value={currentResult.lbActive} unit="mm" />{' '}
                    × 계수{' '}
                    <SemanticValue
                      source="computed"
                      value={currentResult.alphaAnchorage.toFixed(1)}
                    />{' '}
                    (최소 <SemanticValue source="computed" value={currentResult.lbdMin} unit="mm" />)
                  </div>
                </div>

                {/* 설계겹이음길이 */}
                <div className="p-5 rounded-xl bg-blue-50/40 border border-blue-200/80">
                  <div className="text-xs font-semibold text-slate-600 mb-1">
                    설계겹이음길이 (l_o)
                  </div>
                  <div className="flex items-baseline gap-2 my-1">
                    <SemanticValue
                      source="computed"
                      value={currentResult.loDesign}
                      unit="mm"
                      className="text-4xl font-bold tracking-tight"
                    />
                    <span className="text-xs text-slate-500 font-mono">
                      ({(currentResult.loDesign / 10).toFixed(0)} cm)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    계산 <SemanticValue source="computed" value={currentResult.loCalc} unit="mm" /> /
                    계수{' '}
                    <SemanticValue
                      source="computed"
                      value={currentResult.alphaSplice.toFixed(1)}
                    />{' '}
                    (최소 <SemanticValue source="computed" value={currentResult.loMin} unit="mm" />)
                  </div>
                </div>
              </div>

              {/* 그림 확대 보기 & 계산과정 토글 버튼 바 */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSteps((v) => !v)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    showSteps
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  간단한 계산 과정 {showSteps ? '닫기' : '보기'}
                  {showSteps ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTable((v) => !v)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    showTable
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  철근 굵기별(H13~H29) 전체 표 {showTable ? '닫기' : '보기'}
                  {showTable ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDiagramModal(true)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50/70 text-[#2563EB] hover:bg-blue-100/70 transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  그림으로 크게 보기
                </button>
              </div>
            </div>

            {/* 2. [선택 펼침] 간단한 계산 과정 */}
            {showSteps && <EasyExplainerCards state={state} result={currentResult} />}

            {/* 3. [선택 펼침] 철근 굵기별(H13~H29) 정착장 및 겹이음 테이블 */}
            {showTable && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    철근 굵기별(H13 ~ H29) 정착 및 겹이음길이 표
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    행을 클릭하면 해당 철근으로 변경됩니다
                  </span>
                </div>
                <ReferenceParityTable
                  state={state}
                  allResults={allResults}
                  onSelectDiameter={handleSelectDiameter}
                />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 4. [필요 시 확대 모달] 철근 단면 및 정착 그림 확대 보기 */}
      {showDiagramModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowDiagramModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  철근 단면 및 정착 길이 그림 (H{state.db})
                </h3>
                <p className="text-xs text-slate-500">
                  현재 입력한 피복두께, 간격, 갈고리 조건이 반영된 그림입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagramModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <InteractiveBlueprint state={state} result={currentResult} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
