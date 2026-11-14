import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function e2eTargets(files) {
  const targets = new Set();
  for (const file of files) {
    if (/^astro\/(src|public)\//.test(file)) targets.add('astro');
    if (/^(astro|cms)\//.test(file) && !/\.md$/.test(file)) targets.add(file.split('/')[0]);
    if ((file.startsWith('packages/') && !/\.md$/.test(file)) ||
      /^(scripts\/e2e-scope(?:\.test)?\.mjs|lefthook\.yml|\.github\/workflows\/astro-e2e\.yml|package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.npmrc|\.node-version|\.nvmrc)$/.test(file)) {
      targets.add('astro');
      targets.add('cms');
    }
  }
  return ['astro', 'cms'].filter((target) => targets.has(target));
}

export function needsE2E(files) {
  return e2eTargets(files).length > 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [mode, ...args] = process.argv.slice(2);
  let files;
  if (mode === '--diff' && args.length === 2) {
    files = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', `${args[0]}...${args[1]}`], { encoding: 'utf8' }).split('\0').filter(Boolean);
  } else if (mode === '--files') {
    files = args;
  } else {
    throw new Error('Usage: e2e-scope.mjs --diff BASE HEAD | --files PATH...');
  }
  const targets = e2eTargets(files);
  const required = targets.length > 0;
  console.log(required ? 'E2E: application or test configuration changed' : 'E2E: skipped (no relevant changes)');
  if (mode === '--diff') {
    if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
    appendFileSync(process.env.GITHUB_OUTPUT, `required=${required}\nastro=${targets.includes('astro')}\ncms=${targets.includes('cms')}\n`);
  } else if (required) {
    for (const target of targets) {
      const result = spawnSync('pnpm', ['--dir', target, 'run', 'test:e2e'], { stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) { process.exitCode = result.status ?? 1; break; }
    }
  }
}
