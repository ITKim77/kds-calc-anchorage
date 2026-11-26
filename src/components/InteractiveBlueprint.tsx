import React from 'react';
import { AnchorageInputState, RebarCalculationResult } from '../core/types';
import { SemanticValue } from './SemanticValue';

export interface InteractiveBlueprintProps {
  state: AnchorageInputState;
  result: RebarCalculationResult;
}

/**
 * 초보자도 쉽게 이해하는 철근 단면 및 정착·겹이음 그림 (InteractiveBlueprint)
 * - 전문 용어 제목을 제거하고 쉬운 한국어 제목으로 표시
 * - 평소에는 접혀 있고 사용자가 '그림으로 보기(확대)'를 눌렀을 때 깔끔하게 표시됨
 */
export const InteractiveBlueprint: React.FC<InteractiveBlueprintProps> = ({
  state,
  result,
}) => {
  const pxPerMm = 0.72;
  const visualCover = Math.min(Math.max(state.cover, 20), 140) * pxPerMm;
  const visualDb = Math.min(Math.max(state.db, 13), 35) * pxPerMm * 1.15;
  const visualRadius = visualDb / 2;
  const visualCtc = Math.min(Math.max(state.ctc, 70), 280) * pxPerMm;

  const panelAWidth = 500;
  const panelAHeight = 220;
  const slabTopY = 30;
  const slabBottomY = 175;
  const slabLeftX = 50;
  const rebarCenterY = slabBottomY - visualCover - visualRadius;
  const rebar1X = slabLeftX + visualCover + visualRadius;
  const rebar2X = Math.min(rebar1X + visualCtc, panelAWidth - 60);

  const isCoverIgnored = state.ignoreCoverForAnchorage;
  const isHook = state.barShape === 'hook' && state.stressZone === 'tension';
  const isCompression = state.stressZone === 'compression';
  const isPoorBond = state.bondCondition === 'poor';

  const panelBWidth = 500;
  const panelBHeight = 220;
  const barStartX = 70;
  const barEndX = 380;
  const barCenterY = 110;
  const barThickness = Math.max(14, Math.min(24, state.db * 0.72));

  const maxLen = Math.max(result.lbdDesign, result.loDesign, result.lbActive, 500);
  const toPct = (v: number) => Math.min(100, Math.max(8, (v / maxLen) * 100));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 그림 1: 철근 단면도 (피복두께와 철근 간격) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900">
              1. 철근 단면 그림 (피복두께와 간격)
            </h4>
            <SemanticValue
              source="computed"
              symbol="간격계수 Cd"
              value={result.cdAnchorage}
              unit="mm"
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            콘크리트 표면에서 철근까지의 두께(피복)와 철근 사이 간격 중 더 얇은 쪽이 균열 저항력을 결정합니다.
          </p>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <svg viewBox={`0 0 ${panelAWidth} ${panelAHeight}`} className="w-full h-auto block">
              {/* 콘크리트 단면 */}
              <rect
                x={slabLeftX}
                y={slabTopY}
                width={panelAWidth - slabLeftX - 24}
                height={slabBottomY - slabTopY}
                fill="#F8FAFC"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* 철근 2개 (Red) */}
              {[rebar1X, rebar2X].map((cx, i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={rebarCenterY}
                  r={visualRadius}
                  fill="#DC2626"
                  stroke="#7F1D1D"
                  strokeWidth="2"
                />
              ))}

              {/* 철근 간격 CTC 표시 */}
              <line
                x1={rebar1X}
                y1={rebarCenterY - visualRadius - 18}
                x2={rebar2X}
                y2={rebarCenterY - visualRadius - 18}
                stroke="#DC2626"
                strokeWidth="1.5"
              />
              <text
                x={(rebar1X + rebar2X) / 2}
                y={rebarCenterY - visualRadius - 24}
                textAnchor="middle"
                fill="#DC2626"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                간격 CTC = {state.ctc}mm
              </text>

              {/* 피복두께 c 표시 */}
              <line
                x1={rebar1X}
                y1={rebarCenterY + visualRadius}
                x2={rebar1X}
                y2={slabBottomY}
                stroke={isCoverIgnored ? '#94A3B8' : '#DC2626'}
                strokeWidth="1.8"
              />
              <text
                x={rebar1X}
                y={slabBottomY + 18}
                textAnchor="middle"
                fill={isCoverIgnored ? '#64748B' : '#DC2626'}
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {isCoverIgnored ? '피복 c = 제외됨' : `피복 c = ${state.cover}mm`}
              </text>

              {/* 순간격 절반 a/2 표시 */}
              <text
                x={(rebar1X + rebar2X) / 2}
                y={rebarCenterY + 22}
                textAnchor="middle"
                fill="#2563EB"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                순간격 절반(a/2) = {result.halfClearSpacing}mm
              </text>
            </svg>
          </div>
        </div>

        {/* 그림 2: 콘크리트 속 철근 정착 모습 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900">
              2. 콘크리트 속 철근 묻힘 그림 ({isHook ? '갈고리형' : '직선형'})
            </h4>
            <SemanticValue
              source="computed"
              symbol="정착길이"
              value={result.lbdDesign}
              unit="mm"
              badge
            />
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            {isCompression
              ? '압축(누르는 힘)을 받을 때는 철근 끝단도 콘크리트를 함께 밀어주어 필요한 길이가 짧아집니다.'
              : isHook
              ? '철근 끝을 90° 갈고리로 구부려 걸어주면 직선보다 잘 뽑히지 않아 길이가 줄어듭니다.'
              : '직선 철근이 뽑히지 않도록 콘크리트가 철근 표면의 마디를 꽉 잡아줍니다.'}
          </p>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <svg viewBox={`0 0 ${panelBWidth} ${panelBHeight}`} className="w-full h-auto block">
              {/* 콘크리트 블록 */}
              <rect
                x={barStartX}
                y={28}
                width={panelBWidth - barStartX - 24}
                height={155}
                fill="#F8FAFC"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* 불량 위치 물주머니 표시 */}
              {isPoorBond && (
                <g>
                  <rect
                    x={barStartX + 15}
                    y={barCenterY + barThickness / 2 + 2}
                    width={barEndX - barStartX - 25}
                    height="10"
                    rx="4"
                    fill="#BAE6FD"
                    stroke="#0284C7"
                  />
                  <text
                    x={(barStartX + barEndX) / 2}
                    y={barCenterY + barThickness / 2 + 28}
                    textAnchor="middle"
                    fill="#0284C7"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    위쪽 철근(불량 위치): 아래쪽 빈틈으로 인해 묻는 길이 1.43배 증가
                  </text>
                </g>
              )}

              {/* 철근 본체 */}
              {isHook ? (
                <path
                  d={`M 30 ${barCenterY} L ${barEndX - 15} ${barCenterY} Q ${barEndX + 10} ${barCenterY} ${barEndX + 10} ${barCenterY - 25} L ${barEndX + 10} ${barCenterY - 60}`}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth={barThickness}
                />
              ) : (
                <rect
                  x={30}
                  y={barCenterY - barThickness / 2}
                  width={barEndX - 30}
                  height={barThickness}
                  fill="#DC2626"
                  stroke="#7F1D1D"
                  strokeWidth="1.5"
                />
              )}

              {/* 압축 끝단 지압 표시 */}
              {isCompression && (
                <g>
                  <rect
                    x={barEndX + 2}
                    y={barCenterY - barThickness}
                    width="36"
                    height={barThickness * 2}
                    rx="3"
                    fill="#DBEAFE"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                  />
                  <text
                    x={barEndX + 20}
                    y={barCenterY + 4}
                    textAnchor="middle"
                    fill="#1E40AF"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    -15db
                  </text>
                </g>
              )}

              {/* 치수선 */}
              <line
                x1={barStartX}
                y1={198}
                x2={barEndX}
                y2={198}
                stroke="#2563EB"
                strokeWidth="2"
              />
              <text
                x={(barStartX + barEndX) / 2}
                y={213}
                textAnchor="middle"
                fill="#2563EB"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                설계정착길이 = {result.lbdDesign}mm
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* 그림 3: 길이 비교 막대 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
        <h4 className="font-bold text-slate-900">3. 길이 한눈에 비교</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600">최소 기준 길이 (15 × 철근굵기)</span>
              <SemanticValue source="computed" value={result.lbdMin} unit="mm" />
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-500 rounded-full transition-all"
                style={{ width: `${toPct(result.lbdMin)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-800">최종 설계정착길이 (l_bd)</span>
              <SemanticValue source="computed" value={result.lbdDesign} unit="mm" />
            </div>
            <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all"
                style={{ width: `${toPct(result.lbdDesign)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-slate-800">최종 설계겹이음길이 (l_o)</span>
              <SemanticValue source="computed" value={result.loDesign} unit="mm" />
            </div>
            <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1D4ED8] rounded-full transition-all"
                style={{ width: `${toPct(result.loDesign)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBlueprint;
