#!/usr/bin/env node
/**
 * SessionStart Hook: Anthropic Long-Running App Harness Bootstrapper
 * Ensures every agent session reads PROGRESS.md and PLAN.md status first.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const progressPath = path.join(root, 'PROGRESS.md');
const planPath = path.join(root, 'PLAN.md');

try {
  const hasProgress = fs.existsSync(progressPath);
  const hasPlan = fs.existsSync(planPath);
  console.log(
    JSON.stringify({
      systemMessage: `[Anthropic Harness Bootstrap] PROGRESS.md (${hasProgress ? 'FOUND' : 'MISSING'}), PLAN.md (${hasPlan ? 'FOUND' : 'MISSING'}). 모든 에이전트는 CLAUDE.md 0절에 따라 작업 전 PROGRESS.md와 PLAN.md를 확인하고, UI 3원색 규칙(Red=입력, Blue=계산/인용, Black=고정/가정) 및 참조 계산서 유사율 100% 기준을 준수하십시오.`
    })
  );
} catch (err) {
  process.exit(0);
}
