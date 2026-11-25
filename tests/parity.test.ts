import { describe, expect, it } from 'vitest';
import {
  calculateAllStandardDiameters,
  calculateForDiameter,
  computeConcreteTensileStrength,
  STANDARD_DIAMETERS,
} from '../src/core/anchorageEngine';
import { DEFAULT_INPUT_STATE, REFERENCE_PRESETS } from '../src/core/presets';
import { AnchorageInputState } from '../src/core/types';

function getPresetState(presetId: string): AnchorageInputState {
  const preset = REFERENCE_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    throw new Error(`Preset ${presetId} not found`);
  }
  return {
    ...DEFAULT_INPUT_STATE,
    ...preset.statePatch,
  };
}

describe('Reference Calculation PDF Parity Suite (Ch07 철근 정착 및 이음길이)', () => {
  it('1. Concrete material properties and Kb factor match 100.0% (fck = 35, fy = 400)', () => {
    const { fcm, fctm, fctk } = computeConcreteTensileStrength(35);
    expect(fcm).toBe(39);
    expect(fctm).toBe(3.45);
    expect(fctk).toBe(2.415);

    const res = calculateForDiameter(DEFAULT_INPUT_STATE, 19);
    expect(res.fcm).toBe(39);
    expect(res.fctk).toBe(2.415);
    expect(res.fyd).toBe(360);
    expect(res.kbFactor).toBe(25.48);
    expect(res.eta1).toBe(1.0);
    expect(res.eta2).toBe(1.0);
  });

  it('2. Table 7.1.5 Basic development length (lbt & lbc for H13~H29 with eta1 = 1.0)', () => {
    expect(STANDARD_DIAMETERS).toEqual([13, 16, 19, 22, 25, 29]);

    const results = calculateAllStandardDiameters(DEFAULT_INPUT_STATE);
    expect(results.map((r) => r.lbt)).toEqual([330, 410, 480, 560, 640, 740]);
    expect(results.map((r) => r.lbc)).toEqual([140, 170, 200, 230, 260, 300]);
  });

  it('3. Table 7.2.3 & 7.2.6 Anchorage Section ① & ② (Tension, Hook/Non-straight, CTC=125, Cd=50)', () => {
    const state = getPresetState('anchorage-1-2');
    const results = calculateAllStandardDiameters(state);

    expect(results.every((r) => r.cdAnchorage === 50)).toBe(true);
    expect(results.map((r) => r.alpha1Anchorage)).toEqual([0.7, 0.7, 1.0, 1.0, 1.0, 1.0]);
    expect(results.map((r) => r.alpha2AnchorageDisplay)).toEqual([0.9, 1.0, 1.0, 1.0, 1.0, 1.0]);
    expect(results.map((r) => r.alphaAnchorage)).toEqual([0.6, 0.7, 1.0, 1.0, 1.0, 1.0]);
    expect(results.map((r) => r.lbdCalc)).toEqual([200, 280, 480, 560, 640, 740]);
    expect(results.map((r) => r.lbdMin)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.map((r) => r.lbdDesign)).toEqual([200, 280, 480, 560, 640, 740]);
  });

  it('4. Table 7.2.3 & 7.2.6 Anchorage Section ③ & ④ (Compression)', () => {
    const state = getPresetState('anchorage-3-4');
    const results = calculateAllStandardDiameters(state);

    expect(results.map((r) => r.alphaAnchorage)).toEqual([1.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    expect(results.map((r) => r.lbdCalc)).toEqual([140, 170, 200, 230, 260, 300]);
    expect(results.map((r) => r.lbdMin)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.map((r) => r.lbdDesign)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.every((r) => r.isLbdMinGoverning)).toBe(true);
  });

  it('5. Table 7.3.2 & 7.3.4 Lap Splice Section ⓐ & ⓑ (Tension, Straight, CTC=250, cover=30 -> Cd=30, alpha6=1.5, usage=0.7)', () => {
    const state = getPresetState('splice-a-b');
    const results = calculateAllStandardDiameters(state);

    expect(results.every((r) => r.cdSplice === 30)).toBe(true);
    expect(results.map((r) => r.alpha2SpliceDisplay)).toEqual([0.8, 0.9, 0.9, 0.9, 1.0, 1.0]);
    expect(results.map((r) => r.alphaSplice)).toEqual([1.2, 1.3, 1.4, 1.4, 1.5, 1.5]);
    expect(results.map((r) => r.loCalc)).toEqual([280, 370, 460, 560, 650, 770]);
    expect(results.map((r) => r.loMin)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.map((r) => r.loDesign)).toEqual([200, 280, 480, 560, 640, 740]);
  });

  it('6. Table 7.3.2 & 7.3.4 Lap Splice Section ⓒ (Tension, Straight, CTC=250, cover=45 -> Cd=45, alpha6=1.5, usage=0.7)', () => {
    const state = getPresetState('splice-c');
    const results = calculateAllStandardDiameters(state);

    expect(results.every((r) => r.cdSplice === 45)).toBe(true);
    expect(results.map((r) => r.alpha2SpliceDisplay)).toEqual([0.7, 0.7, 0.8, 0.8, 0.9, 0.9]);
    expect(results.map((r) => r.alphaSplice)).toEqual([1.1, 1.1, 1.2, 1.3, 1.3, 1.4]);
    expect(results.map((r) => r.loCalc)).toEqual([240, 310, 400, 500, 590, 710]);
    expect(results.map((r) => r.loMin)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.map((r) => r.loDesign)).toEqual([240, 310, 400, 500, 590, 710]);
  });

  it('7. Table 7.3.2 & 7.3.4 Lap Splice Section ⓓ & ⓔ (Compression, alpha6=1.5, usage=0.7)', () => {
    const state = getPresetState('splice-d-e');
    const results = calculateAllStandardDiameters(state);

    expect(results.map((r) => r.alphaSplice)).toEqual([1.5, 1.5, 1.5, 1.5, 1.5, 1.5]);
    expect(results.map((r) => r.loCalc)).toEqual([150, 180, 210, 240, 270, 320]);
    expect(results.map((r) => r.loMin)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.map((r) => r.loDesign)).toEqual([200, 240, 290, 330, 380, 440]);
    expect(results.every((r) => r.isLoMinGoverning)).toBe(true);
  });

  it('8. Poor bond condition (bondCondition: "poor", eta1 = 0.7)', () => {
    const poorBondState: AnchorageInputState = {
      ...DEFAULT_INPUT_STATE,
      bondCondition: 'poor',
    };
    const results = calculateAllStandardDiameters(poorBondState);

    expect(results.every((r) => r.eta1 === 0.7)).toBe(true);
    // Kb = 25.48, lbt = round10(25.48 * db / 0.7), lbc = round10(25.48 * db / 0.7 - 15 * db)
    expect(results.map((r) => r.lbt)).toEqual([470, 580, 690, 800, 910, 1060]);
    expect(results.map((r) => r.lbc)).toEqual([280, 340, 410, 470, 540, 620]);
  });

  it('9. Large rebar diameter (db = 35, eta2 = 0.97)', () => {
    const res32 = calculateForDiameter(DEFAULT_INPUT_STATE, 32);
    expect(res32.eta2).toBe(1.0);

    const res35 = calculateForDiameter(DEFAULT_INPUT_STATE, 35);
    expect(res35.db).toBe(35);
    expect(res35.label).toBe('H35');
    expect(res35.eta2).toBe(0.97);
    // kbRaw = 360 / (4 * 2.25 * 2.415 * 0.65 * 0.97) = 26.26908... -> 26.27
    expect(res35.kbFactor).toBe(26.27);
    // lbt = round10(26.27 * 35 / 1.0) = round10(919.45) = 920
    expect(res35.lbt).toBe(920);
    // lbc = round10(919.45 - 15 * 35) = round10(394.45) = 390
    expect(res35.lbc).toBe(390);
  });
});
