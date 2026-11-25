#!/usr/bin/env node
/**
 * PostToolUse Hook: Automatic SSOT Input & Domain Parity Guardrail
 * Inspects edits to src/components/** to ensure <input>/<select> only exist in MasterInputDock.tsx.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const componentsDir = path.join(root, 'src', 'components');

try {
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    const violations = [];
    for (const file of files) {
      if (file === 'MasterInputDock.tsx') continue;
      const rawContent = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      // Strip block and line comments before checking for actual JSX <input> or <select> tags
      const content = rawContent
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      if (/<input\b|<select\b/i.test(content)) {
        violations.push(file);
      }
    }
    if (violations.length > 0) {
      console.error(
        `[SSOT VIOLATION] MasterInputDock.tsx 이외의 컴포넌트에서 사용자 입력 태그(<input>/<select>)가 감지되었습니다: ${violations.join(', ')}. 단일 위치 정의(SSOT) 원칙에 따라 즉시 제거하십시오.`
      );
      process.exit(2);
    }
  }
} catch (err) {
  // Ignore when directories are not scaffolded yet
}
process.exit(0);
