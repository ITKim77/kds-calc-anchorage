import React, { useMemo, useState } from 'react';
import {
  AnchorageInputState,
  RebarDiameter,
} from './core/types';
import {
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

const ALL_TABLE_DIAMETERS: RebarDiameter[] = [13, 16, 19, 22, 25, 29, 32, 35];

export const App: React.FC = () => {
  const [state, setState] = useState<AnchorageInputState>(DEFAULT_INPUT_STATE);

  // 상호 배타적 보기 상태: 'none' | 'steps' | 'table' (하나가 열리면 다른 하나는 자동으로 닫힘)
  const [activeView, setActiveView] = useState<'none' | 'steps' | 'table'>('none');
  const [showDiagramModal, setShowDiagramModal] = useState<boolean>(false);

  const showSteps = activeView === 'steps';
  const showTable = activeView === 'table';

  const currentResult = useMemo(() => calculateForDiameter(state, state.db), [state]);
  const allResults = useMemo(
    () => ALL_TABLE_DIAMETERS.map((d) => calculateForDiameter(state, d)),
    [state]
  );

  const handleUpdateState = (patch: Partial<AnchorageInputState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectDiameter = (db: RebarDiameter) => {
    setState((prev) => ({ ...prev, db }));
  };

  const toggleView = (target: 'steps' | 'table') => {
    setActiveView((prev) => (prev === target ? 'none' : target));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col">
      {/* 상단 헤더: 아이콘 "HM" + 제목 "KDS기반 철근 정착 및 겹이음길이 계산기" */}
      <header className="bg-white border-b-2 border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-base flex items-center justify-center tracking-tight">
              HM
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              KDS기반 철근 정착 및 겹이음길이 계산기
            </h1>
          </div>

          {/* 3원색 색상 안내 */}
          <div className="flex items-center gap-4 text-sm bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
            <span className="inline-flex items-center gap-2 font-bold text-[#DC2626]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              입력값
            </span>
            <span className="inline-flex items-center gap-2 font-bold text-[#2563EB]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              계산결과
            </span>
            <span className="inline-flex items-center gap-2 font-bold text-[#111827]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111827]" />
              고정값
            </span>
          </div>
        </div>
      </header>

      {/* 메인 화면: items-start를 적용하여 우측 계산과정이 펼쳐져도 좌측 입력패널은 절대 늘어나지 않음 */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 (5칸): 단일 입력 패널 (SSOT - 고정 높이 유지) */}
          <aside className="lg:col-span-5">
            <MasterInputDock
              state={state}
              onChange={handleUpdateState}
              onReset={() => setState(DEFAULT_INPUT_STATE)}
            />
          </aside>

          {/* 우측 (7칸): 대형 계산 결과 카드 + 상호 배타적 선택형 펼침 영역 */}
          <section className="lg:col-span-7 flex flex-col space-y-5">
            {/* 1. 핵심 계산 결과 카드 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm p-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB]" />
                    <h2 className="text-lg font-bold text-slate-900">계산 결과</h2>
                  </div>
                  <div className="text-base text-slate-600 font-medium">
                    선택 철근:{' '}
                    <SemanticValue
                      source="input"
                      value={`H${state.db} (${state.db}mm)`}
                      className="font-bold text-lg"
                    />{' '}
                    ·{' '}
                    <SemanticValue
                      source="input"
                      value={state.stressZone === 'tension' ? '인장(당김)' : '압축(누름)'}
                      className="font-bold"
                    />{' '}
                    ·{' '}
                    <SemanticValue
                      source="input"
                      value={state.barShape === 'hook' ? '갈고리' : '직선'}
                      className="font-bold"
                    />
                  </div>
                </div>

                {/* 두 가지 핵심 결과 초대형 카드로 표시 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4">
                  {/* 설계정착길이 */}
                  <div className="p-8 rounded-2xl bg-blue-50/50 border-2 border-blue-200 flex flex-col justify-between min-h-[260px]">
                    <div className="text-base font-bold text-slate-700">
                      설계정착길이 (l_bd)
                    </div>
                    <div className="my-5">
                      <div className="flex items-baseline gap-2.5">
                        <SemanticValue
                          source="computed"
                          value={currentResult.lbdDesign}
                          unit="mm"
                          className="text-5xl sm:text-6xl font-extrabold tracking-tight"
                        />
                      </div>
                      <div className="text-base text-slate-500 font-mono mt-2">
                        약 {(currentResult.lbdDesign / 10).toFixed(0)} cm (철근 중심선 끝까지)
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 pt-3 border-t border-blue-200/60">
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
                  <div className="p-8 rounded-2xl bg-blue-50/50 border-2 border-blue-200 flex flex-col justify-between min-h-[260px]">
                    <div className="text-base font-bold text-slate-700">
                      설계겹이음길이 (l_o)
                    </div>
                    <div className="my-5">
                      <div className="flex items-baseline gap-2.5">
                        <SemanticValue
                          source="computed"
                          value={currentResult.loDesign}
                          unit="mm"
                          className="text-5xl sm:text-6xl font-extrabold tracking-tight"
                        />
                      </div>
                      <div className="text-base text-slate-500 font-mono mt-2">
                        약 {(currentResult.loDesign / 10).toFixed(0)} cm (두 철근 겹침 구간)
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 pt-3 border-t border-blue-200/60">
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
              </div>

              {/* 하단 큼직한 액션 버튼 바 (계산과정 보기와 표 보기는 상호 배타적 작동) */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => toggleView('steps')}
                  className={`py-4 px-4 rounded-xl text-sm font-bold border-2 transition-colors flex items-center justify-center gap-2 ${
                    showSteps
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  간단한 계산 과정 {showSteps ? '닫기' : '보기'}
                  {showSteps ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleView('table')}
                  className={`py-4 px-4 rounded-xl text-sm font-bold border-2 transition-colors flex items-center justify-center gap-2 ${
                    showTable
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  철근 굵기별(H13~H35) 표 {showTable ? '닫기' : '보기'}
                  {showTable ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDiagramModal(true)}
                  className="py-4 px-4 rounded-xl text-sm font-bold border-2 border-blue-300 bg-blue-50 text-[#2563EB] hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  그림으로 크게 보기
                </button>
              </div>
            </div>

            {/* 2. [선택 펼침 1] 간단한 계산 과정 (표 보기가 열리면 자동 닫힘) */}
            {showSteps && <EasyExplainerCards state={state} result={currentResult} />}

            {/* 3. [선택 펼침 2] 철근 굵기별(H13~H35) 정착장 및 겹이음 테이블 (계산 과정이 열리면 자동 닫힘) */}
            {showTable && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    철근 굵기별(H13 ~ H35) 정착 및 겹이음길이 표
                  </h3>
                  <span className="text-xs text-slate-500">
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

      {/* 4. [필요 시 확대 모달] 철근 단면 및 중심선 정착 그림 확대 보기 */}
      {showDiagramModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowDiagramModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  철근 단면 및 중심선 정착길이 그림 (H{state.db})
                </h3>
                <p className="text-xs text-slate-500">
                  순간격 a = CTC - d_b 및 철근 중심선을 따라 끝단까지 측정한 정착길이 그림입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagramModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
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
