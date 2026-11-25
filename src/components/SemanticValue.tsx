import React from 'react';
import { SemanticSource } from '../core/types';

export interface SemanticValueProps {
  /** 데이터 출처: 'input'(Red) | 'computed'(Blue) | 'constant'(Black) */
  source: SemanticSource;
  /** 표시할 값 */
  value: React.ReactNode;
  /** 단위 (예: 'mm', 'MPa') */
  unit?: string;
  /** 변수 기호 라벨 (예: 'fy', 'lbd') */
  symbol?: string;
  /** 배지 형태 렌더링 여부 */
  badge?: boolean;
  /** 폰트 크기 및 추가 클래스 */
  className?: string;
  /** 툴팁 설명 */
  title?: string;
}

const SOURCE_STYLE_MAP: Record<
  SemanticSource,
  {
    text: string;
    badgeBg: string;
    badgeBorder: string;
    dot: string;
    label: string;
  }
> = {
  input: {
    text: 'text-[#DC2626]',
    badgeBg: 'bg-red-50/90',
    badgeBorder: 'border-[#DC2626]/40',
    dot: 'bg-[#DC2626]',
    label: '사용자 입력값 (Red)',
  },
  computed: {
    text: 'text-[#2563EB]',
    badgeBg: 'bg-blue-50/90',
    badgeBorder: 'border-[#2563EB]/40',
    dot: 'bg-[#2563EB]',
    label: '인용 및 계산값 (Blue)',
  },
  constant: {
    text: 'text-[#111827]',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-400',
    dot: 'bg-[#111827]',
    label: '가정값 또는 고정값 (Black)',
  },
};

/**
 * 작업지시서 2.3절 UI/UX 데이터 표현 3원색 강제 원자 컴포넌트
 * - 사용자 입력값: Red (#DC2626)
 * - 인용 및 계산값: Blue (#2563EB)
 * - 가정값 또는 고정값: Black (#111827)
 */
export const SemanticValue: React.FC<SemanticValueProps> = ({
  source,
  value,
  unit,
  symbol,
  badge = false,
  className = '',
  title,
}) => {
  const style = SOURCE_STYLE_MAP[source];

  if (badge) {
    return (
      <span
        title={title || style.label}
        data-semantic-source={source}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono text-xs font-semibold tabular-nums ${style.badgeBg} ${style.badgeBorder} ${style.text} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {symbol && <span className="opacity-75 font-normal">{symbol}=</span>}
        <span>{value}</span>
        {unit && <span className="text-[10px] opacity-80 font-sans">{unit}</span>}
      </span>
    );
  }

  return (
    <span
      title={title || style.label}
      data-semantic-source={source}
      className={`font-mono font-semibold tabular-nums ${style.text} ${className}`}
    >
      {symbol && <span className="opacity-80 font-normal mr-0.5">{symbol}=</span>}
      <span>{value}</span>
      {unit && <span className="text-[0.85em] ml-0.5 font-sans font-normal opacity-85">{unit}</span>}
    </span>
  );
};

export default SemanticValue;
