import { test } from 'node:test';
import assert from 'node:assert/strict';
import { needsE2E, e2eTargets } from './e2e-scope.mjs';

test('CMS and public applications run only their relevant suites', () => {
  assert.deepEqual(e2eTargets(['cms/src/main.tsx']), ['cms']);
  assert.deepEqual(e2eTargets(['cms/worker/auth.ts']), ['cms']);
  assert.deepEqual(e2eTargets(['cms/migrations/0001.sql']), ['cms']);
  assert.deepEqual(e2eTargets(['cms/pnpm-lock.yaml']), ['cms']);
  assert.deepEqual(e2eTargets(['astro/src/pages/index.astro']), ['astro']);
  assert.deepEqual(e2eTargets(['packages/event-presentation/src/EventBody.tsx']), ['astro', 'cms']);
  assert.deepEqual(e2eTargets(['scripts/e2e-scope.mjs']), ['astro', 'cms']);
  assert.deepEqual(e2eTargets(['cms/README.md']), []);
});

test('documentation-only changes skip browser tests', () => {
  assert.equal(needsE2E(['docs/development-rules.md', 'specs/001/spec.md', 'AGENTS.md', '.gitignore', 'astro/e2e/README.md', 'packages/content-schema/README.md']), false);
  assert.equal(needsE2E([]), false);
});

test('application inputs and test infrastructure trigger browser tests', () => {
  for (const file of ['astro/src/pages/index.astro', 'astro/src/content/article.md', 'astro/public/readme.md', 'astro/data/wordpress-export.json', 'astro/api/checkout.ts', 'astro/package.json', 'astro/pnpm-lock.yaml', 'astro/astro.config.mjs', 'astro/playwright.config.ts', 'astro/e2e/events.spec.ts', 'packages/content-schema/schemas/content.schema.json', 'lefthook.yml', '.github/workflows/astro-e2e.yml', 'scripts/e2e-scope.mjs']) {
    assert.equal(needsE2E(['docs/README.md', file]), true, file);
  }
});
