#!/usr/bin/env node
/**
 * Stop Hook: Verifies that PROGRESS.md and PLAN.md exist and reminds agent to keep them synced.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const progressExists = fs.existsSync(path.join(root, 'PROGRESS.md'));
const planExists = fs.existsSync(path.join(root, 'PLAN.md'));

if (!progressExists || !planExists) {
  console.error('[Harness Warning] PROGRESS.md 또는 PLAN.md 파일이 누락되었습니다.');
}
process.exit(0);
