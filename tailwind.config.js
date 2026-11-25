/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ssot: {
          input: '#DC2626',    // Red: 사용자 입력값
          computed: '#2563EB', // Blue: 인용 및 계산값
          constant: '#111827', // Black: 가정값 또는 고정값
        },
      },
    },
  },
  plugins: [],
};
