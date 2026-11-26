import React from 'react';
import { AnchorageInputState, RebarCalculationResult } from '../core/types';
import { roundTo } from '../core/anchorageEngine';
import { SemanticValue } from './SemanticValue';

export interface InteractiveBlueprintProps {
  state: AnchorageInputState;
  result: RebarCalculationResult;
}

/**
 * 철근 단면 및 중심선 정착길이 그림 (InteractiveBlueprint)
 * - 순간격 a = CTC - db 및 단일 간격계수 Cd = Min[a / 2, c] 반영 (이음 Cd 구분 삭제)
 * - 정착길이는 콘크리트 시작면부터 철근의 중심선을 따라 끝까지로 표현
 */
export const InteractiveBlueprint: React.FC<InteractiveBlueprintProps> = ({
  state,
  result,
}) => {
  const pxPerMm = 0.78;
  const visualCover = Math.min(Math.max(state.cover, 20), 140) * pxPerMm;
  const visualDb = Math.min(Math.max(state.db, 13), 35) * pxPerMm * 1.15;
  const visualRadius = visualDb / 2;
  const visualCtc = Math.min(Math.max(state.ctc, 70), 280) * pxPerMm;

  const panelAWidth = 540;
  const panelAHeight = 250;
  const slabTopY = 34;
  const slabBottomY = 195;
  const slabLeftX = 56;
  const rebarCenterY = slabBottomY - visualCover - visualRadius;
  const rebar1X = slabLeftX + visualCover + visualRadius;
  const rebar2X = Math.min(rebar1X + visualCtc, panelAWidth - 65);

  // 순간격 a = CTC - db 및 단일 간격계수 Cd = Min[a/2, c]
  const exactClearA = Math.max(0, state.ctc - state.db);
  const exactHalfA = roundTo(exactClearA / 2, 1);
  const unifiedCd = roundTo(Math.min(exactHalfA, state.cover), 1);

  const isHook = state.barShape === 'hook' && state.stressZone === 'tension';
  const isCompression = state.stressZone === 'compression';
  const isPoorBond = state.bondCondition === 'poor';

  const panelBWidth = 540;
  const panelBHeight = 250;
  const barStartX = 80; // 콘크리트 매립 시작면
  const barEndX = 390;  // 직선부 끝 또는 갈고리 곡선 중심
  const barCenterY = 135;
  const barThickness = Math.max(16, Math.min(28, state.db * 0.75));
  const hookTipY = barCenterY - 82; // 갈고리 끝단 Y좌표
  const hookCenterX = barEndX + 12; // 갈고리 수직부 중심선 X좌표

  const maxLen = Math.max(result.lbdDesign, result.loDesign, result.lbActive, 500);
  const toPct = (v: number) => Math.min(100, Math.max(8, (v / maxLen) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 그림 1: 철근 단면도 (피복두께와 철근 간격 -> 단일 간격계수 Cd = Min[a/2, c]) */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-bold text-slate-900">
              1. 철근 단면 그림 (순간격 a = CTC - d_b)
            </h4>
            <SemanticValue
              source="computed"
              symbol="간격계수 Cd"
              value={unifiedCd}
              unit="mm"
              badge
            />
          </div>
          <p className="text-xs text-slate-600 mb-3">
            순간격 <span className="font-mono font-semibold">a = {state.ctc} - {state.db} = {exactClearA}mm</span>의 절반(
            <span className="font-mono font-semibold">a/2 = {exactHalfA}mm</span>)과 순피복두께(
            <span className="font-mono font-semibold">c = {state.cover}mm</span>) 중 작은 값이 간격계수(
            <span className="font-mono font-bold text-[#2563EB]">C_d = {unifiedCd}mm</span>)가 됩니다.
          </p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <svg viewBox={`0 0 ${panelAWidth} ${panelAHeight}`} className="w-full h-auto block">
              {/* 콘크리트 단면 */}
              <rect
                x={slabLeftX}
                y={slabTopY}
                width={panelAWidth - slabLeftX - 24}
                height={slabBottomY - slabTopY}
                fill="#F8FAFC"
                stroke="#334155"
                strokeWidth="2.5"
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
                y1={rebarCenterY - visualRadius - 20}
                x2={rebar2X}
                y2={rebarCenterY - visualRadius - 20}
                stroke="#DC2626"
                strokeWidth="2"
              />
              <text
                x={(rebar1X + rebar2X) / 2}
                y={rebarCenterY - visualRadius - 28}
                textAnchor="middle"
                fill="#DC2626"
                fontSize="13"
                fontWeight="bold"
                fontFamily="monospace"
              >
                철근간격 CTC = {state.ctc}mm (d_b = {state.db}mm)
              </text>

              {/* 피복두께 c 표시 */}
              <line
                x1={rebar1X}
                y1={rebarCenterY + visualRadius}
                x2={rebar1X}
                y2={slabBottomY}
                stroke="#DC2626"
                strokeWidth="2"
              />
              <text
                x={rebar1X}
                y={slabBottomY + 24}
                textAnchor="middle"
                fill="#DC2626"
                fontSize="13"
                fontWeight="bold"
                fontFamily="monospace"
              >
                순피복 c = {state.cover}mm
              </text>

              {/* 순간격 a 및 a/2 표시 */}
              <line
                x1={rebar1X + visualRadius}
                y1={rebarCenterY}
                x2={rebar2X - visualRadius}
                y2={rebarCenterY}
                stroke="#2563EB"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <text
                x={(rebar1X + rebar2X) / 2}
                y={rebarCenterY + 26}
                textAnchor="middle"
                fill="#2563EB"
                fontSize="12.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                a = {exactClearA}mm (a/2 = {exactHalfA}mm) → C_d = {unifiedCd}mm
              </text>
            </svg>
          </div>
        </div>

        {/* 그림 2: 콘크리트 속 철근 정착 모습 (중심선을 따라 끝까지 정착길이 표현) */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-bold text-slate-900">
              2. 철근 중심선 정착길이 그림 ({isHook ? '갈고리형' : '직선형'})
            </h4>
            <SemanticValue
              source="computed"
              symbol="정착길이 l_bd"
              value={result.lbdDesign}
              unit="mm"
              badge
            />
          </div>
          <p className="text-xs text-slate-600 mb-3">
            정착길이(<span className="font-mono font-bold text-[#2563EB]">파란색 점선</span>)는 콘크리트 시작면부터{' '}
            <strong>철근의 중심선을 따라 끝단까지</strong> 측정한 전체 길이입니다.
          </p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <svg viewBox={`0 0 ${panelBWidth} ${panelBHeight}`} className="w-full h-auto block">
              {/* 콘크리트 블록 */}
              <rect
                x={barStartX}
                y={22}
                width={panelBWidth - barStartX - 24}
                height={180}
                fill="#F8FAFC"
                stroke="#334155"
                strokeWidth="2.5"
              />

              {/* 콘크리트 정착 시작면 기준선 */}
              <line
                x1={barStartX}
                y1={14}
                x2={barStartX}
                y2={212}
                stroke="#0F172A"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <text
                x={barStartX + 6}
                y={38}
                fill="#334155"
                fontSize="11"
                fontWeight="bold"
              >
                정착 시작면
              </text>

              {/* 불량 위치 물주머니 표시 */}
              {isPoorBond && (
                <g>
                  <rect
                    x={barStartX + 12}
                    y={barCenterY + barThickness / 2 + 2}
                    width={barEndX - barStartX - 20}
                    height="10"
                    rx="4"
                    fill="#BAE6FD"
                    stroke="#0284C7"
                  />
                  <text
                    x={(barStartX + barEndX) / 2}
                    y={barCenterY + barThickness / 2 + 26}
                    textAnchor="middle"
                    fill="#0284C7"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    위쪽 철근(불량 위치): 아래쪽 빈틈으로 인해 묻는 길이 1.43배 증가
                  </text>
                </g>
              )}

              {/* 1) 철근 본체 (Red) */}
              {isHook ? (
                <path
                  d={`M 26 ${barCenterY} L ${barEndX - 14} ${barCenterY} Q ${hookCenterX} ${barCenterY} ${hookCenterX} ${barCenterY - 26} L ${hookCenterX} ${hookTipY}`}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth={barThickness}
                  strokeLinecap="butt"
                />
              ) : (
                <rect
                  x={26}
                  y={barCenterY - barThickness / 2}
                  width={barEndX - 26}
                  height={barThickness}
                  fill="#DC2626"
                  stroke="#7F1D1D"
                  strokeWidth="1.5"
                />
              )}

              {/* 2) 철근 중심선을 따라 끝까지 이어지는 정착길이(l_bd) 표시선 (Blue + White Halo) */}
              {isHook ? (
                <g>
                  <path
                    d={`M ${barStartX} ${barCenterY} L ${barEndX - 14} ${barCenterY} Q ${hookCenterX} ${barCenterY} ${hookCenterX} ${barCenterY - 26} L ${hookCenterX} ${hookTipY}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                  />
                  <path
                    d={`M ${barStartX} ${barCenterY} L ${barEndX - 14} ${barCenterY} Q ${hookCenterX} ${barCenterY} ${hookCenterX} ${barCenterY - 26} L ${hookCenterX} ${hookTipY}`}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <circle cx={barStartX} cy={barCenterY} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx={hookCenterX} cy={hookTipY} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text
                    x={hookCenterX + 12}
                    y={hookTipY + 6}
                    fill="#2563EB"
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    갈고리 끝단 (중심선 끝)
                  </text>
                </g>
              ) : (
                <g>
                  <line
                    x1={barStartX}
                    y1={barCenterY}
                    x2={barEndX}
                    y2={barCenterY}
                    stroke="#FFFFFF"
                    strokeWidth="6"
                  />
                  <line
                    x1={barStartX}
                    y1={barCenterY}
                    x2={barEndX}
                    y2={barCenterY}
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <circle cx={barStartX} cy={barCenterY} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx={barEndX} cy={barCenterY} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text
                    x={barEndX}
                    y={barCenterY - barThickness / 2 - 10}
                    textAnchor="middle"
                    fill="#2563EB"
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    철근 끝단 (중심선 끝)
                  </text>
                </g>
              )}

              {/* 압축 끝단 지압 표시 */}
              {isCompression && (
                <g>
                  <rect
                    x={barEndX + 4}
                    y={barCenterY - barThickness}
                    width="42"
                    height={barThickness * 2}
                    rx="4"
                    fill="#DBEAFE"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                  />
                  <text
                    x={barEndX + 25}
                    y={barCenterY + 4}
                    textAnchor="middle"
                    fill="#1E40AF"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    -15db
                  </text>
                </g>
              )}

              {/* 중심선 정착길이 안내 라벨 */}
              <rect
                x={barStartX + 18}
                y={212}
                width={panelBWidth - barStartX - 50}
                height="28"
                rx="6"
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="1.2"
              />
              <text
                x={(barStartX + panelBWidth - 32) / 2}
                y={230}
                textAnchor="middle"
                fill="#1D4ED8"
                fontSize="12.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                철근 중심선 전체 정착길이 (l_bd) = {result.lbdDesign} mm
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* 그림 3: 길이 비교 막대 */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-3 text-sm">
        <h4 className="font-bold text-slate-900 text-base">3. 길이 한눈에 비교</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600 font-medium">최소 기준 길이 (15 × 철근굵기)</span>
              <SemanticValue source="computed" value={result.lbdMin} unit="mm" />
            </div>
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-500 rounded-full transition-all"
                style={{ width: `${toPct(result.lbdMin)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-slate-900">최종 설계정착길이 (l_bd · 중심선 끝까지)</span>
              <SemanticValue source="computed" value={result.lbdDesign} unit="mm" />
            </div>
            <div className="w-full h-4 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all"
                style={{ width: `${toPct(result.lbdDesign)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-slate-900">최종 설계겹이음길이 (l_o)</span>
              <SemanticValue source="computed" value={result.loDesign} unit="mm" />
            </div>
            <div className="w-full h-4 bg-blue-100 rounded-full overflow-hidden">
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
