/**
 * KDS 24 14 21:2025 & 참조 계산서(Ch07 철근 정착 및 이음길이) 코어 타입 계약
 * Single Source of Truth (SSOT) 9대 입력 변수 및 3원색 시맨틱 분류 정의
 */

export type SemanticSource = 'input' | 'computed' | 'constant';

export type RebarDiameter = 13 | 16 | 19 | 22 | 25 | 29 | 32 | 35;

export type BondCondition = 'good' | 'poor'; // 양호(η1 = 1.0) | 불량(η1 = 0.7)

export type BarShape = 'straight' | 'hook'; // 직선(갈고리 미형성) | 직선 외(갈고리 형성)

export type StressZone = 'tension' | 'compression'; // 인장측 | 압축측

/**
 * 9대 핵심 사용자 입력 변수 (SSOT Master Inputs — Red Color Coded)
 */
export interface AnchorageInputState {
  /** 1. 철근 설계기준항복강도 fy (MPa) - 기본 400 */
  fy: number;
  /** 2. 콘크리트 설계기준압축강도 fck (MPa) - 기본 35 */
  fck: number;
  /** 3. 순피복두께 c (mm) - 정착부 '해당없음'일 경우 null 또는 hasCover=false로 제어 */
  cover: number;
  /** 정착부 순피복 해당없음 여부 (계산서 7.2.2절 ①, ② 구간 대응) */
  ignoreCoverForAnchorage: boolean;
  /** 4. 철근 중심간격 C.T.C (mm) - 정착 125, 이음 250 */
  ctc: number;
  /** 5. 선택 철근 직경 db (mm) - H13 ~ H29 */
  db: RebarDiameter;
  /** 6. 철근위치 (양호=1.0 / 불량=0.7) */
  bondCondition: BondCondition;
  /** 7. 갈고리 형성/미형성 (직선 vs 직선 외) */
  barShape: BarShape;
  /** 부재력 작용 구역 (인장측 / 압축측) */
  stressZone: StressZone;
  /** 8. 겹침이음계수 α6,lo (기본 1.5, ρ1=100% 기준) */
  spliceAlpha6: number;
  /** 9. 철근사용률 (As,req / As,used) - 정착 기본 1.0, 겹침이음 기본 0.7 */
  rebarUsageRatioAnchorage: number;
  rebarUsageRatioSplice: number;
  /** 참조 계산서 대표 순간격 모드 (a = CTC - 25 고정 vs 직경별 CTC - db) */
  useReferenceFixedClearSpacing: boolean;
}

/**
 * 시스템 고정 상수 및 기본 가정값 (Black Color Coded)
 */
export interface SystemConstants {
  phiS: number;         // 철근 재료계수 0.90
  phiC: number;         // 콘크리트 재료계수 0.65
  bondMultiplier: number; // 부착강도 상수 2.25
  endBearingFactor: number; // 압축측 선단지압 계수 15 (15 * db)
  minFactorDb: number;  // 최소정착/이음 직경 배수 15 (15 * db)
  minAnchorageAbs: number; // 최소정착 절대 하한 100mm
  minSpliceAbs: number;    // 최소이음 절대 하한 200mm
  alpha3: number;       // 횡철근 구속효과 1.0
  alpha4: number;       // 용접 횡철근 1.0
  alpha5: number;       // 횡방향 압력 1.0
  alpha6Anchorage: number; // 정착 표준갈고리 구속 1.0
}

/**
 * 단일 철근 직경에 대한 정밀 계산 결과 (Blue Color Coded)
 */
export interface RebarCalculationResult {
  db: RebarDiameter;
  label: string; // 'H13' ~ 'H35'

  // 1. 재료 및 부착강도 산출값
  fyd: number;   // 설계항복강도 (360 MPa)
  fcm: number;   // 평균압축강도 (39 MPa)
  fctm: number;  // 평균인장강도 (3.450 MPa)
  fctk: number;  // 기준인장강도 (2.415 MPa)
  eta1: number;  // 위치계수 (1.0 또는 0.7)
  eta2: number;  // 지름계수 (1.0 또는 (132-db)/100)
  fbd: number;   // 설계부착강도 (MPa)
  kbFactor: number; // 기본정착 계수 (25.48)

  // 2. 기본정착길이 (10mm 단위 반올림)
  lbtRaw: number;
  lbcRaw: number;
  lbt: number;   // 인장측 기본정착길이 (mm)
  lbc: number;   // 압축측 기본정착길이 (mm)
  lbActive: number; // 현재 선택된 구역(인장/압축)의 기본정착길이 (mm)

  // 3. 간격계수 (Cd)
  clearSpacingA: number; // 순간격 a (mm)
  halfClearSpacing: number; // a / 2 (mm)
  cdAnchorage: number;   // 정착 간격계수 Cd (mm)
  cdSplice: number;      // 이음 간격계수 Cd (mm)

  // 4. 정착 영향계수 및 설계정착길이 (lbd)
  alpha1Anchorage: number;      // 형상계수 (0.7 또는 1.0)
  alpha2AnchorageRaw: number;   // 피복두께계수 원시값
  alpha2AnchorageDisplay: number; // 피복두께계수 표기값 (소수 1자리)
  alphaAnchorage: number;       // 통합 철근영향계수 αt 또는 αc (소수 1자리)
  lbdCalc: number;              // 계산 정착길이 = round10(α * lb * 사용률)
  lbdMin: number;               // 최소 정착길이 = round10(15 * db)
  lbdDesign: number;            // 최종 적용 설계정착길이 = max(lbdCalc, lbdMin)
  isLbdMinGoverning: boolean;   // 최소정착길이(15db) 지배 여부

  // 5. 겹침이음 영향계수 및 설계겹이음길이 (lo)
  alpha1Splice: number;
  alpha2SpliceRaw: number;
  alpha2SpliceDisplay: number;
  alphaSplice: number;          // 통합 이음영향계수 αo,t 또는 αo,c (소수 1자리)
  loCalc: number;               // 계산 이음길이 = round10(사용률 * αo * lb)
  loMin: number;                // 최소 이음길이 = round10(15 * db)
  loDesign: number;             // 최종 적용 설계겹이음길이
  isLoMinGoverning: boolean;    // 최소이음길이(15db) 지배 여부
}

/**
 * 참조 계산서(Ch07) 프리셋 정의
 */
export interface ReferencePreset {
  id: string;
  code: string;
  title: string;
  sectionRef: string;
  mode: 'anchorage' | 'splice';
  description: string;
  statePatch: Partial<AnchorageInputState>;
}
