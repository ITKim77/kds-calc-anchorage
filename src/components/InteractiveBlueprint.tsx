import React from 'react';
import { AnchorageInputState, RebarCalculationResult } from '../core/types';
import { SemanticValue } from './SemanticValue';

export interface InteractiveBlueprintProps {
  state: AnchorageInputState;
  result: RebarCalculationResult;
}

/**
 * InteractiveBlueprint.tsx
 * Swiss Architectural Blueprint Interactive SVG Visualizer (3-Panel Engineering & Middle-School Visual Pedagogy)
 * - Panel A: 단면 및 간격계수 (Cd) 실시간 비례 단면도 + 45° 쐐기 균열 압력 링 (Cross-Section SVG)
 * - Panel B: 정착 상세 및 힘의 전달 메커니즘 SVG (갈고리 90° 굴곡 / 압축 -15db 선단지압력 / 불량 위치 블리딩 물주머니)
 * - Panel C: 설계정착길이(lbd) & 설계겹이음길이(lo) 실물 비례 스케일 바 & 2철근 겹침이음 다이어그램
 *
 * CRITICAL RULE: NEVER include <input> or <select> tags here!
 */
export const InteractiveBlueprint: React.FC<InteractiveBlueprintProps> = ({
  state,
  result,
}) => {
  // ============================================================================
  // Panel A: Cross-Section & Cd Scaling Geometry
  // ============================================================================
  // Clamp visual parameters for crisp rendering while preserving authentic visual proportions
  const pxPerMm = 0.72; // Base scale factor for Panel A
  const visualCover = Math.min(Math.max(state.cover, 20), 140) * pxPerMm;
  const visualDb = Math.min(Math.max(state.db, 13), 35) * pxPerMm * 1.15;
  const visualRadius = visualDb / 2;
  const visualCtc = Math.min(Math.max(state.ctc, 70), 280) * pxPerMm;

  const panelAWidth = 520;
  const panelAHeight = 250;
  const slabTopY = 38;
  const slabBottomY = 200;
  const slabLeftX = 56;
  const rebarCenterY = slabBottomY - visualCover - visualRadius;
  const rebar1X = slabLeftX + visualCover + visualRadius;
  const rebar2X = Math.min(rebar1X + visualCtc, panelAWidth - 65);

  const actualClearHalf = result.halfClearSpacing;
  const isCoverIgnored = state.ignoreCoverForAnchorage;
  const activeCd = result.cdAnchorage;
  const isCoverGoverning = !isCoverIgnored && state.cover < actualClearHalf;

  // Wedge pressure ring radius (proportional to splitting pressure / inverse to Cd)
  const splittingRingRadius = Math.max(
    visualRadius + 14,
    Math.min(visualCover + visualRadius, (rebar2X - rebar1X) / 2)
  );

  // ============================================================================
  // Panel B: Anchorage Force, Hook, Compression End-Bearing & Bleeding Pocket
  // ============================================================================
  const panelBWidth = 520;
  const panelBHeight = 250;
  const isHook = state.barShape === 'hook' && state.stressZone === 'tension';
  const isCompression = state.stressZone === 'compression';
  const isPoorBond = state.bondCondition === 'poor';

  const barStartX = 78;
  const barEndX = 395;
  const barCenterY = 122;
  const barThickness = Math.max(14, Math.min(26, state.db * 0.75));
  const ribPositions = [115, 150, 185, 220, 255, 290, 325, 360];

  // ============================================================================
  // Panel C: Proportional Length Comparison Scale Bar
  // ============================================================================
  const maxBarLength = Math.max(
    result.lbActive,
    result.lbdCalc,
    result.lbdMin,
    result.lbdDesign,
    result.loCalc,
    result.loMin,
    result.loDesign,
    600
  );

  const toPct = (val: number) => Math.min(100, Math.max(6, (val / maxBarLength) * 100));

  return (
    <section
      aria-label="실시간 반응형 구조 엔지니어링 SVG 블루프린트"
      className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden"
    >
      {/* Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600 font-mono text-xs font-bold">
            SVG
          </span>
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              실시간 비례 엔지니어링 블루프린트 & 힘의 전달 메커니즘 도면
            </h2>
            <p className="text-[11px] text-slate-300">
              Swiss Architectural Blueprint · 입력변수(Red) · 산출/인용값(Blue) · 고정상수(Black) 실시간 연동
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <SemanticValue source="input" symbol="직경" value={`H${state.db}`} badge />
          <SemanticValue
            source="input"
            symbol="구역"
            value={state.stressZone === 'tension' ? '인장측' : '압축측'}
            badge
          />
          <SemanticValue
            source="computed"
            symbol="lbd"
            value={result.lbdDesign}
            unit="mm"
            badge
          />
          <SemanticValue
            source="computed"
            symbol="lo"
            value={result.loDesign}
            unit="mm"
            badge
          />
        </div>
      </div>

      {/* Top 2 Panels Grid: Panel A (Cross-Section) & Panel B (Longitudinal Force Profile) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-slate-200">
        {/* ====================================================================
            PANEL A: 단면 및 간격계수 (Cd) 실시간 비례 단면도
           ==================================================================== */}
        <div className="p-4 flex flex-col justify-between bg-slate-50/40">
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-white rounded">
                  PANEL A
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  단면 및 간격계수 (<span className="font-mono text-[#2563EB]">C_d</span>) 실시간 비례 단면도
                </h3>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                철근 마디가 밀어내는 45° 쐐기 압력 링이 가장 얇은 콘크리트 살 두께(
                <SemanticValue source="computed" symbol="Cd" value={activeCd.toFixed(1)} unit="mm" />
                ) 쪽으로 먼저 균열을 일으킵니다.
              </p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
              {isCoverIgnored
                ? '순피복 제외 (a/2 지배)'
                : isCoverGoverning
                ? '하부 순피복(c) 지배'
                : '철근 순간격(a/2) 지배'}
            </span>
          </div>

          {/* SVG Cross-Section Blueprint */}
          <div className="relative w-full bg-white border border-slate-200 rounded overflow-hidden">
            <svg
              viewBox={`0 0 ${panelAWidth} ${panelAHeight}`}
              className="w-full h-auto block select-none"
              role="img"
              aria-label="단면 및 간격계수 Cd 비례 단면도"
            >
              <defs>
                {/* Architectural Grid Pattern */}
                <pattern
                  id="swiss-grid-a"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="1"
                  />
                </pattern>
                <marker
                  id="arrow-red"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626" />
                </marker>
                <marker
                  id="arrow-blue"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB" />
                </marker>
              </defs>

              {/* Background Grid */}
              <rect width={panelAWidth} height={panelAHeight} fill="url(#swiss-grid-a)" />

              {/* Concrete Member Cross-Section Block */}
              <rect
                x={slabLeftX}
                y={slabTopY}
                width={panelAWidth - slabLeftX - 24}
                height={slabBottomY - slabTopY}
                fill="#F8FAFC"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Concrete Hatching Texture Marks */}
              <g stroke="#CBD5E1" strokeWidth="1">
                <line x1={slabLeftX + 15} y1={slabTopY + 12} x2={slabLeftX + 25} y2={slabTopY + 20} />
                <line x1={slabLeftX + 85} y1={slabTopY + 18} x2={slabLeftX + 95} y2={slabTopY + 10} />
                <line x1={slabLeftX + 180} y1={slabTopY + 15} x2={slabLeftX + 190} y2={slabTopY + 23} />
                <line x1={slabLeftX + 290} y1={slabTopY + 14} x2={slabLeftX + 300} y2={slabTopY + 22} />
                <polygon points={`${slabLeftX + 140},${slabTopY + 18} ${slabLeftX + 146},${slabTopY + 12} ${slabLeftX + 150},${slabTopY + 20}`} fill="#E2E8F0" />
                <polygon points={`${slabLeftX + 240},${slabTopY + 22} ${slabLeftX + 247},${slabTopY + 15} ${slabLeftX + 251},${slabTopY + 24}`} fill="#E2E8F0" />
              </g>

              {/* 45° Wedge Splitting Pressure Rings around Rebar 1 & Rebar 2 */}
              {[rebar1X, rebar2X].map((cx, idx) => (
                <g key={idx}>
                  {/* Outer Splitting Pressure Halo */}
                  <circle
                    cx={cx}
                    cy={rebarCenterY}
                    r={splittingRingRadius}
                    fill="#DBEAFE"
                    fillOpacity="0.28"
                    stroke="#2563EB"
                    strokeWidth="1.25"
                    strokeDasharray="4 3"
                  />
                  {/* Inner High-Stress Ring */}
                  <circle
                    cx={cx}
                    cy={rebarCenterY}
                    r={visualRadius + 7}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />
                  {/* 45-degree radial splitting force rays */}
                  {[45, 135, 225, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = cx + (visualRadius + 2) * Math.cos(rad);
                    const y1 = rebarCenterY + (visualRadius + 2) * Math.sin(rad);
                    const x2 = cx + (splittingRingRadius - 2) * Math.cos(rad);
                    const y2 = rebarCenterY + (splittingRingRadius - 2) * Math.sin(rad);
                    return (
                      <line
                        key={deg}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#2563EB"
                        strokeWidth="1.2"
                        markerEnd="url(#arrow-blue)"
                      />
                    );
                  })}
                </g>
              ))}

              {/* Potential Splitting Crack Lines (Highlighted along governing Cd path) */}
              {isCoverGoverning ? (
                /* Vertical bottom cover splitting crack path */
                <path
                  d={`M ${rebar1X} ${rebarCenterY + visualRadius} L ${rebar1X - 4} ${
                    rebarCenterY + visualRadius + visualCover * 0.5
                  } L ${rebar1X + 3} ${slabBottomY}`}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.2"
                  strokeDasharray="3 2"
                />
              ) : (
                /* Horizontal side-to-side splitting crack path between rebars */
                <path
                  d={`M ${rebar1X + visualRadius} ${rebarCenterY} L ${
                    (rebar1X + rebar2X) / 2
                  } ${rebarCenterY - 4} L ${rebar2X - visualRadius} ${rebarCenterY}`}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.2"
                  strokeDasharray="3 2"
                />
              )}

              {/* Mid-plane dividing line for half clear spacing (a/2) */}
              <line
                x1={(rebar1X + rebar2X) / 2}
                y1={rebarCenterY - 38}
                x2={(rebar1X + rebar2X) / 2}
                y2={slabBottomY - 6}
                stroke="#2563EB"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Rebar 1 & Rebar 2 Cross-Section Circles (Red #DC2626 User Input db) */}
              {[rebar1X, rebar2X].map((cx, idx) => (
                <g key={idx}>
                  <circle
                    cx={cx}
                    cy={rebarCenterY}
                    r={visualRadius}
                    fill="#DC2626"
                    stroke="#7F1D1D"
                    strokeWidth="2"
                  />
                  {/* Rebar crosshair */}
                  <line
                    x1={cx - visualRadius - 3}
                    y1={rebarCenterY}
                    x2={cx + visualRadius + 3}
                    y2={rebarCenterY}
                    stroke="#FFFFFF"
                    strokeWidth="0.9"
                    opacity="0.7"
                  />
                  <line
                    x1={cx}
                    y1={rebarCenterY - visualRadius - 3}
                    x2={cx}
                    y2={rebarCenterY + visualRadius + 3}
                    stroke="#FFFFFF"
                    strokeWidth="0.9"
                    opacity="0.7"
                  />
                </g>
              ))}

              {/* Rebar Diameter (db) Label on Rebar 2 */}
              <text
                x={rebar2X + visualRadius + 8}
                y={rebarCenterY + 4}
                fill="#DC2626"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                db={state.db}mm (H{state.db})
              </text>

              {/* Dimension 1: CTC (Center-to-Center Spacing - Red Input) */}
              <line
                x1={rebar1X}
                y1={rebarCenterY - visualRadius - 36}
                x2={rebar1X}
                y2={rebarCenterY - visualRadius - 6}
                stroke="#DC2626"
                strokeWidth="1"
              />
              <line
                x1={rebar2X}
                y1={rebarCenterY - visualRadius - 36}
                x2={rebar2X}
                y2={rebarCenterY - visualRadius - 6}
                stroke="#DC2626"
                strokeWidth="1"
              />
              <line
                x1={rebar1X + 3}
                y1={rebarCenterY - visualRadius - 26}
                x2={rebar2X - 3}
                y2={rebarCenterY - visualRadius - 26}
                stroke="#DC2626"
                strokeWidth="1.5"
                markerStart="url(#arrow-red)"
                markerEnd="url(#arrow-red)"
              />
              <rect
                x={(rebar1X + rebar2X) / 2 - 48}
                y={rebarCenterY - visualRadius - 37}
                width="96"
                height="16"
                rx="3"
                fill="#FEF2F2"
                stroke="#DC2626"
                strokeWidth="0.8"
              />
              <text
                x={(rebar1X + rebar2X) / 2}
                y={rebarCenterY - visualRadius - 26}
                textAnchor="middle"
                fill="#DC2626"
                fontSize="10.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                CTC = {state.ctc}mm
              </text>

              {/* Dimension 2: Half Clear Spacing a/2 (Blue Computed) */}
              <line
                x1={rebar1X + visualRadius + 2}
                y1={rebarCenterY + 2}
                x2={(rebar1X + rebar2X) / 2 - 2}
                y2={rebarCenterY + 2}
                stroke="#2563EB"
                strokeWidth="1.8"
                markerStart="url(#arrow-blue)"
                markerEnd="url(#arrow-blue)"
              />
              <rect
                x={(rebar1X + visualRadius + (rebar1X + rebar2X) / 2) / 2 - 38}
                y={rebarCenterY + 8}
                width="76"
                height="16"
                rx="3"
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="0.9"
              />
              <text
                x={(rebar1X + visualRadius + (rebar1X + rebar2X) / 2) / 2}
                y={rebarCenterY + 19}
                textAnchor="middle"
                fill="#2563EB"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                a/2={actualClearHalf.toFixed(1)}
              </text>

              {/* Dimension 3: Concrete Clear Cover c (Red Input) */}
              <line
                x1={rebar1X - visualRadius - 22}
                y1={rebarCenterY + visualRadius}
                x2={rebar1X - 2}
                y2={rebarCenterY + visualRadius}
                stroke="#DC2626"
                strokeWidth="1"
              />
              <line
                x1={rebar1X - visualRadius - 14}
                y1={rebarCenterY + visualRadius + 2}
                x2={rebar1X - visualRadius - 14}
                y2={slabBottomY - 2}
                stroke={isCoverIgnored ? '#94A3B8' : '#DC2626'}
                strokeWidth="1.6"
                markerStart={isCoverIgnored ? undefined : 'url(#arrow-red)'}
                markerEnd={isCoverIgnored ? undefined : 'url(#arrow-red)'}
              />
              <rect
                x={8}
                y={(rebarCenterY + visualRadius + slabBottomY) / 2 - 9}
                width="76"
                height="17"
                rx="3"
                fill={isCoverIgnored ? '#F1F5F9' : '#FEF2F2'}
                stroke={isCoverIgnored ? '#94A3B8' : '#DC2626'}
                strokeWidth="0.9"
              />
              <text
                x={46}
                y={(rebarCenterY + visualRadius + slabBottomY) / 2 + 3}
                textAnchor="middle"
                fill={isCoverIgnored ? '#64748B' : '#DC2626'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {isCoverIgnored ? 'c=해당없음' : `c=${state.cover}mm`}
              </text>

              {/* Governing Cd Callout Box in Bottom Margin */}
              <rect
                x={slabLeftX}
                y={slabBottomY + 10}
                width={panelAWidth - slabLeftX - 24}
                height="28"
                rx="4"
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="1.2"
              />
              <text
                x={slabLeftX + 12}
                y={slabBottomY + 28}
                fill="#1E3A8A"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ★ 지배 간격계수 Cd = Min(a/2={actualClearHalf.toFixed(1)},{' '}
                {isCoverIgnored ? 'c=∞' : `c=${state.cover}`}) = {activeCd.toFixed(1)}mm → α2 ={' '}
                {result.alpha2AnchorageDisplay.toFixed(1)}
              </text>
            </svg>
          </div>

          {/* Caption Footer for Panel A */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <span>
              순간격 <SemanticValue source="computed" symbol="a" value={result.clearSpacingA} unit="mm" /> (
              {state.useReferenceFixedClearSpacing ? '참조계산서 CTC-25 기준' : `실제직경 CTC-${state.db} 기준`})
            </span>
            <span>
              이음부 간격계수:{' '}
              <SemanticValue source="computed" symbol="Cd,lo" value={result.cdSplice.toFixed(1)} unit="mm" /> (
              <SemanticValue
                source="computed"
                symbol="α2,lo"
                value={result.alpha2SpliceDisplay.toFixed(1)}
              />
              )
            </span>
          </div>
        </div>

        {/* ====================================================================
            PANEL B: 정착 상세 및 힘의 전달 메커니즘 SVG
           ==================================================================== */}
        <div className="p-4 flex flex-col justify-between bg-slate-50/40">
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-white rounded">
                  PANEL B
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  정착 상세 및 힘의 전달 메커니즘 (부착응력 <span className="font-mono text-[#2563EB]">f_bd</span> · 갈고리 · 선단지압)
                </h3>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isCompression
                  ? '압축측 철근은 끝단 단면이 콘크리트를 직접 밀어주는 선단지압력(-15db)이 작동해 정착길이가 단축됩니다.'
                  : isHook
                  ? '인장측 90° 표준갈고리 형성으로 끝단 기계적 정착이 추가되어 형상계수 α1 = 0.7 (30% 할인)이 적용됩니다.'
                  : '인장측 직선 철근으로 마디(Rib)와 콘크리트 사이의 부착강도(fbd)만으로 뽑히려는 힘을 버텨냅니다.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <SemanticValue
                source="computed"
                symbol="fbd"
                value={result.fbd.toFixed(3)}
                unit="MPa"
                badge
              />
            </div>
          </div>

          {/* SVG Force & Profile Mechanism Blueprint */}
          <div className="relative w-full bg-white border border-slate-200 rounded overflow-hidden">
            <svg
              viewBox={`0 0 ${panelBWidth} ${panelBHeight}`}
              className="w-full h-auto block select-none"
              role="img"
              aria-label="정착 상세 및 힘의 전달 메커니즘 SVG"
            >
              <defs>
                <pattern
                  id="swiss-grid-b"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width={panelBWidth} height={panelBHeight} fill="url(#swiss-grid-b)" />

              {/* Concrete Anchorage Embedment Zone Block */}
              <rect
                x={barStartX}
                y={30}
                width={panelBWidth - barStartX - 22}
                height={168}
                fill="#F8FAFC"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Embedment Boundary Line (Left Face of Concrete) */}
              <line
                x1={barStartX}
                y1={22}
                x2={barStartX}
                y2={206}
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />
              <text
                x={barStartX + 6}
                y={44}
                fill="#475569"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                정착 시작면 (콘크리트 매립 구간)
              </text>

              {/* If Bond Condition is POOR (η1 = 0.7): Bleeding Water Pocket & Rising Bubbles under Rebar */}
              {isPoorBond && (
                <g>
                  {/* Bleeding water gap pocket directly underneath the rebar */}
                  <path
                    d={`M ${barStartX + 12} ${barCenterY + barThickness / 2 + 1} 
                        Q ${(barStartX + barEndX) / 2} ${barCenterY + barThickness / 2 + 18} 
                        ${barEndX - 10} ${barCenterY + barThickness / 2 + 1} Z`}
                    fill="#38BDF8"
                    fillOpacity="0.35"
                    stroke="#0284C7"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                  />
                  {/* Rising bleeding water bubbles */}
                  {[125, 165, 205, 245, 285, 325, 365].map((bx, i) => (
                    <g key={bx}>
                      <circle
                        cx={bx}
                        cy={barCenterY + barThickness / 2 + 22 + (i % 2) * 8}
                        r={3.5 + (i % 2)}
                        fill="#BAE6FD"
                        stroke="#0284C7"
                        strokeWidth="1"
                      />
                      <line
                        x1={bx}
                        y1={barCenterY + barThickness / 2 + 36}
                        x2={bx}
                        y2={barCenterY + barThickness / 2 + 14}
                        stroke="#0284C7"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    </g>
                  ))}
                  {/* Warning Callout Banner for Bleeding Water Pocket */}
                  <rect
                    x={barStartX + 18}
                    y={166}
                    width="320"
                    height="24"
                    rx="4"
                    fill="#FEF2F2"
                    stroke="#DC2626"
                    strokeWidth="1"
                  />
                  <text
                    x={barStartX + 26}
                    y={182}
                    fill="#DC2626"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    💧 블리딩 물주머니 발생 (위치 불량 η1=0.7) → 하부 부착력 상실 (+43% 연장)
                  </text>
                </g>
              )}

              {/* 45° Bond Stress Resistance Arrows (fbd) along Rebar Ribs */}
              {ribPositions.map((rx) => (
                <g key={rx}>
                  {/* Top 45° wedge arrow */}
                  <line
                    x1={rx}
                    y1={barCenterY - barThickness / 2 - 2}
                    x2={isCompression ? rx - 18 : rx + 18}
                    y2={barCenterY - barThickness / 2 - 20}
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow-blue)"
                  />
                  {/* Bottom 45° wedge arrow (weakened/faded if poor bond condition) */}
                  <line
                    x1={rx}
                    y1={barCenterY + barThickness / 2 + 2}
                    x2={isCompression ? rx - 18 : rx + 18}
                    y2={barCenterY + barThickness / 2 + 20}
                    stroke="#2563EB"
                    strokeWidth={isPoorBond ? '1' : '1.5'}
                    strokeDasharray={isPoorBond ? '2 2' : undefined}
                    opacity={isPoorBond ? 0.35 : 1}
                    markerEnd="url(#arrow-blue)"
                  />
                </g>
              ))}

              {/* Main Deformed Rebar Body (Straight or 90° Standard Hook) */}
              {isHook ? (
                <path
                  d={`M 36 ${barCenterY} 
                      L ${barEndX - 16} ${barCenterY} 
                      Q ${barEndX + 12} ${barCenterY} ${barEndX + 12} ${barCenterY - 28}
                      L ${barEndX + 12} ${barCenterY - 72}`}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth={barThickness}
                  strokeLinecap="butt"
                />
              ) : (
                <rect
                  x={36}
                  y={barCenterY - barThickness / 2}
                  width={barEndX - 36}
                  height={barThickness}
                  fill="#DC2626"
                  stroke="#7F1D1D"
                  strokeWidth="1.5"
                />
              )}

              {/* Deformed Rebar Ribs (돌기/마디) */}
              {ribPositions.map((rx) => (
                <line
                  key={rx}
                  x1={rx - 2}
                  y1={barCenterY - barThickness / 2 - 2}
                  x2={rx + 2}
                  y2={barCenterY + barThickness / 2 + 2}
                  stroke="#7F1D1D"
                  strokeWidth="2.4"
                />
              ))}

              {/* Hook 90° Mechanical Anchorage Callout */}
              {isHook && (
                <g>
                  <rect
                    x={barEndX + 24}
                    y={46}
                    width="90"
                    height="46"
                    rx="4"
                    fill="#EFF6FF"
                    stroke="#2563EB"
                    strokeWidth="1.2"
                  />
                  <text
                    x={barEndX + 69}
                    y={64}
                    textAnchor="middle"
                    fill="#2563EB"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    90° 표준갈고리
                  </text>
                  <text
                    x={barEndX + 69}
                    y={80}
                    textAnchor="middle"
                    fill="#1E40AF"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    α1 = 0.7 (-30%)
                  </text>
                </g>
              )}

              {/* Compression End-Bearing Resistance Block (-15db 선단지압력) */}
              {isCompression && (
                <g>
                  {/* Bearing Pressure Block at Tip of Rebar */}
                  <rect
                    x={barEndX + 2}
                    y={barCenterY - barThickness - 8}
                    width="44"
                    height={barThickness * 2 + 16}
                    rx="3"
                    fill="#DBEAFE"
                    stroke="#111827"
                    strokeWidth="1.8"
                  />
                  {/* End-bearing reaction arrows pushing back against rebar tip */}
                  {[-10, 0, 10].map((dy) => (
                    <line
                      key={dy}
                      x1={barEndX + 40}
                      y1={barCenterY + dy}
                      x2={barEndX + 6}
                      y2={barCenterY + dy}
                      stroke="#2563EB"
                      strokeWidth="1.8"
                      markerEnd="url(#arrow-blue)"
                    />
                  ))}
                  {/* End-Bearing Text Badge */}
                  <rect
                    x={barEndX - 10}
                    y={46}
                    width="118"
                    height="42"
                    rx="4"
                    fill="#111827"
                    stroke="#2563EB"
                    strokeWidth="1.2"
                  />
                  <text
                    x={barEndX + 49}
                    y={63}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    선단지압력 -15db
                  </text>
                  <text
                    x={barEndX + 49}
                    y={79}
                    textAnchor="middle"
                    fill="#93C5FD"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    (-{15 * state.db}mm 직접 지지)
                  </text>
                </g>
              )}

              {/* External Force Vector Arrow at Left End of Rebar (Tension Pull vs Compression Push) */}
              {isCompression ? (
                <g>
                  <line
                    x1={10}
                    y1={barCenterY}
                    x2={68}
                    y2={barCenterY}
                    stroke="#DC2626"
                    strokeWidth="3.5"
                    markerEnd="url(#arrow-red)"
                  />
                  <text
                    x={12}
                    y={barCenterY - 16}
                    fill="#DC2626"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    압축력 밀기 (Push)
                  </text>
                </g>
              ) : (
                <g>
                  <line
                    x1={70}
                    y1={barCenterY}
                    x2={12}
                    y2={barCenterY}
                    stroke="#DC2626"
                    strokeWidth="3.5"
                    markerEnd="url(#arrow-red)"
                  />
                  <text
                    x={12}
                    y={barCenterY - 16}
                    fill="#DC2626"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    인장력 당김 (Pull)
                  </text>
                </g>
              )}

              {/* Bottom Mechanism Formula Bar */}
              <rect
                x={barStartX}
                y={208}
                width={panelBWidth - barStartX - 22}
                height="28"
                rx="4"
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth="1.2"
              />
              <text
                x={barStartX + 12}
                y={226}
                fill="#0F172A"
                fontSize="10.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {isCompression
                  ? `압축 기본정착 lbc = 25.48×db/η1 - 15×db = ${result.lbcRaw.toFixed(1)} → ${result.lbc}mm`
                  : `인장 기본정착 lbt = 25.48×db/η1 = 25.48×${state.db}/${result.eta1} = ${result.lbtRaw.toFixed(
                      1
                    )} → ${result.lbt}mm`}
              </text>
            </svg>
          </div>

          {/* Caption Footer for Panel B */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 bg-white px-2.5 py-1.5 rounded border border-slate-200">
            <span>
              위치계수 <SemanticValue source="computed" symbol="η1" value={result.eta1.toFixed(1)} /> (
              {isPoorBond ? '불량: 블리딩 수막 발생' : '양호: 건전 부착'})
            </span>
            <span>
              지름계수 <SemanticValue source="computed" symbol="η2" value={result.eta2.toFixed(2)} /> · 기본정착{' '}
              <SemanticValue source="computed" symbol="lb" value={result.lbActive} unit="mm" />
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          PANEL C: 설계정착길이(lbd) & 설계겹이음길이(lo) 실물 비례 스케일 바
         ==================================================================== */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-white rounded">
                PANEL C
              </span>
              <h3 className="text-xs font-bold text-slate-900">
                설계정착길이(<span className="font-mono text-[#2563EB]">l_bd</span>) & 설계겹이음길이(
                <span className="font-mono text-[#2563EB]">l_o</span>) 실물 비례 스케일 바
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              기본정착길이(<SemanticValue source="computed" symbol="lb" value={result.lbActive} unit="mm" />)에서 영향계수와 철근사용률을 곱한 계산 길이와 최소 안전 마지노선(
              <SemanticValue source="constant" value="15" />×
              <SemanticValue source="input" symbol="db" value={state.db} unit="mm" /> ={' '}
              <SemanticValue source="computed" value={result.lbdMin} unit="mm" />)을 실시간 비교합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
              스케일 기준 최대폭: {maxBarLength} mm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left 7 Cols: Proportional Horizontal Scale Bars */}
          <div className="lg:col-span-7 space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {/* Bar 1: Basic Anchorage Length (lbActive) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  ① 기본정착길이 ({state.stressZone === 'tension' ? 'l_b,t' : 'l_b,c'})
                </span>
                <SemanticValue source="computed" value={result.lbActive} unit="mm" />
              </div>
              <div className="w-full h-4 bg-slate-200 rounded overflow-hidden">
                <div
                  className="h-full bg-slate-500 transition-all duration-300"
                  style={{ width: `${toPct(result.lbActive)}%` }}
                />
              </div>
            </div>

            {/* Bar 2: Anchorage Calc vs Min -> Final lbdDesign */}
            <div className="pt-1 border-t border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between text-xs mb-1 gap-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  ② 설계정착길이 (<span className="font-mono text-[#2563EB]">l_bd</span>)
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      result.isLbdMinGoverning
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-[#2563EB] border border-blue-300'
                    }`}
                  >
                    {result.isLbdMinGoverning ? '최소 마지노선(15db) 지배' : '계산 정착길이 지배'}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    Max(계산 <SemanticValue source="computed" value={result.lbdCalc} />, 최소{' '}
                    <SemanticValue source="computed" value={result.lbdMin} />) =
                  </span>
                  <SemanticValue source="computed" symbol="최종" value={result.lbdDesign} unit="mm" badge />
                </div>
              </div>
              <div className="relative w-full h-5 bg-slate-200 rounded overflow-hidden">
                {/* Final Design Bar */}
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${toPct(result.lbdDesign)}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
                    {result.lbdDesign}mm
                  </span>
                </div>
                {/* 15db Minimum Safety Line Marker */}
                <div
                  className="absolute top-0 bottom-0 border-r-2 border-dashed border-[#111827]"
                  style={{ left: `${toPct(result.lbdMin)}%` }}
                  title={`최소정착길이 15db = ${result.lbdMin}mm`}
                />
              </div>
            </div>

            {/* Bar 3: Lap Splice Calc vs Min -> Final loDesign */}
            <div className="pt-1 border-t border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between text-xs mb-1 gap-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  ③ 설계겹이음길이 (<span className="font-mono text-[#2563EB]">l_o</span>)
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      result.isLoMinGoverning
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-[#2563EB] border border-blue-300'
                    }`}
                  >
                    {result.isLoMinGoverning ? '최소 마지노선(15db) 지배' : '계산 이음길이 지배'}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    Max(계산 <SemanticValue source="computed" value={result.loCalc} />, 최소{' '}
                    <SemanticValue source="computed" value={result.loMin} />) =
                  </span>
                  <SemanticValue source="computed" symbol="최종" value={result.loDesign} unit="mm" badge />
                </div>
              </div>
              <div className="relative w-full h-5 bg-slate-200 rounded overflow-hidden">
                {/* Final Lap Splice Bar */}
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${toPct(result.loDesign)}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-white">
                    {result.loDesign}mm
                  </span>
                </div>
                {/* 15db Minimum Safety Line Marker */}
                <div
                  className="absolute top-0 bottom-0 border-r-2 border-dashed border-[#111827]"
                  style={{ left: `${toPct(result.loMin)}%` }}
                  title={`최소이음길이 15db = ${result.loMin}mm`}
                />
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Overlapping Two-Rebar Lap Splice (loDesign) SVG Visual Diagram */}
          <div className="lg:col-span-5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">
                철근 2가닥 겹침이음 (<span className="font-mono text-[#2563EB]">l_o</span>) 상세도
              </span>
              <span className="text-[11px] font-mono text-slate-600">
                α6,lo = <SemanticValue source="input" value={state.spliceAlpha6.toFixed(1)} /> · 사용률 ={' '}
                <SemanticValue source="input" value={state.rebarUsageRatioSplice.toFixed(2)} />
              </span>
            </div>

            <svg
              viewBox="0 0 380 110"
              className="w-full h-auto bg-white border border-slate-200 rounded block"
              role="img"
              aria-label="겹침이음 상세 다이어그램"
            >
              {/* Concrete background */}
              <rect x="10" y="10" width="360" height="90" fill="#F8FAFC" stroke="#CBD5E1" />

              {/* Overlap Zone Highlight Box */}
              <rect
                x="95"
                y="18"
                width="190"
                height="56"
                fill="#EFF6FF"
                stroke="#2563EB"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />

              {/* Top Overlapping Rebar (Left to Center-Right) */}
              <rect x="22" y="28" width="263" height="10" fill="#DC2626" rx="1" />
              {/* Bottom Overlapping Rebar (Center-Left to Right) */}
              <rect x="95" y="48" width="263" height="10" fill="#DC2626" rx="1" />

              {/* Force transfer arrows between overlapping rebars */}
              {[120, 155, 190, 225, 260].map((tx) => (
                <line
                  key={tx}
                  x1={tx}
                  y1="39"
                  x2={tx + 8}
                  y2="47"
                  stroke="#2563EB"
                  strokeWidth="1.4"
                />
              ))}

              {/* Dimension arrow for loDesign */}
              <line
                x1="98"
                y1="86"
                x2="282"
                y2="86"
                stroke="#2563EB"
                strokeWidth="1.8"
                markerStart="url(#arrow-blue)"
                markerEnd="url(#arrow-blue)"
              />
              <rect
                x="130"
                y="77"
                width="120"
                height="16"
                rx="3"
                fill="#EFF6FF"
                stroke="#2563EB"
              />
              <text
                x="190"
                y="88"
                textAnchor="middle"
                fill="#2563EB"
                fontSize="10.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                lo = {result.loDesign} mm
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveBlueprint;
