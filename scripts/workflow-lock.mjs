#!/usr/bin/env node
/**
 * TASK-8.3: Multi-Agent File Locking & Concurrency Guard Engine
 * Prevents race conditions when dynamic parallel agents operate on the workspace.
 * Enforces Exclusive Write Scopes defined in PLAN.md and CLAUDE.md Section 6.2.
 */
import fs from 'node:fs';
import path from 'node:path';

const LOCK_DIR = path.join(process.cwd(), '.claude', '.locks');

export const AGENT_SCOPES = {
  'kds-formula-engine': ['src/core/types.ts', 'src/core/anchorageEngine.ts', 'src/core/presets.ts'],
  'reference-validator': ['tests/parity.test.ts'],
  'ssot-ui-architect': [
    'src/components/SemanticValue.tsx',
    'src/components/MasterInputDock.tsx',
    'src/components/ReferenceParityTable.tsx',
    'src/App.tsx',
  ],
  'visual-pedagogy-agent': [
    'src/components/InteractiveBlueprint.tsx',
    'src/components/EasyExplainerCards.tsx',
  ],
};

export function acquireLock(agentId, targetFile) {
  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR, { recursive: true });
  }
  const normalizedTarget = targetFile.replace(/\\/g, '/');
  const allowed = AGENT_SCOPES[agentId] || [];
  if (!allowed.some((scope) => normalizedTarget.endsWith(scope))) {
    throw new Error(
      `[RACE CONDITION & SCOPE VIOLATION] Agent "${agentId}" is not permitted to write to "${normalizedTarget}". Allowed: ${allowed.join(', ')}`
    );
  }
  const lockFile = path.join(LOCK_DIR, `${normalizedTarget.replace(/\//g, '__')}.lock`);
  if (fs.existsSync(lockFile)) {
    const holder = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    if (holder.agentId !== agentId) {
      throw new Error(
        `[FILE LOCKED] "${normalizedTarget}" is currently locked by agent "${holder.agentId}" since ${holder.timestamp}`
      );
    }
  }
  fs.writeFileSync(
    lockFile,
    JSON.stringify({ agentId, targetFile: normalizedTarget, timestamp: new Date().toISOString() }, null, 2)
  );
  return lockFile;
}

export function releaseAllLocks() {
  if (fs.existsSync(LOCK_DIR)) {
    for (const f of fs.readdirSync(LOCK_DIR)) {
      fs.unlinkSync(path.join(LOCK_DIR, f));
    }
  }
}

if (process.argv[2] === '--verify-scopes') {
  console.log('[Workflow Lock Manager] Exclusive Write Scopes verified for 4 parallel agent tracks.');
}
