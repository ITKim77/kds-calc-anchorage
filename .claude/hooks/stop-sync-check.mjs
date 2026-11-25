#!/usr/bin/env node
/**
 * Stop Hook: Verifies that PROGRESS.md and PLAN.md exist and reminds agent to keep them synced.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const progressExists = fs.existsSync(path.join(root, 'PROGRESS.md'));
const planExists = fs.existsSync(path.join(root, 'PLAN.md'));
const readmeExists = fs.existsSync(path.join(root, 'README.md'));
const workflowExists = fs.existsSync(path.join(root, '.github', 'workflows', 'deploy.yml'));

if (!progressExists || !planExists || !readmeExists || !workflowExists) {
  console.error('[Harness Warning] PROGRESS.md, PLAN.md, README.md 또는 GitHub Pages 배포 워크플로우(.github/workflows/deploy.yml)가 누락되었습니다.');
}
process.exit(0);
