import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function needsE2E(files) {
  return files.some((file) => {
    if (file.startsWith('astro/src/') || file.startsWith('astro/public/')) return true;
    if (/^(astro|packages)\//.test(file)) return !/\.md$/.test(file);
    return /^(scripts\/e2e-scope(?:\.test)?\.mjs|lefthook\.yml|\.github\/workflows\/astro-e2e\.yml|package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.npmrc|\.node-version|\.nvmrc)$/.test(file);
  });
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
  const required = needsE2E(files);
  console.log(required ? 'E2E: application or test configuration changed' : 'E2E: skipped (no relevant changes)');
  if (mode === '--diff') {
    if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
    appendFileSync(process.env.GITHUB_OUTPUT, `required=${required}\n`);
  } else if (required) {
    const result = spawnSync('pnpm', ['--dir', 'astro', 'run', 'test:e2e'], { stdio: 'inherit' });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
}
