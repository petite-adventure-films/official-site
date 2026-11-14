import { Miniflare } from 'miniflare';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Each invocation owns an isolated, in-memory D1 database. Never uses cloud bindings.
export async function createWorkerFixture(entry = 'index') {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(`../../worker/${entry}.ts`, import.meta.url))],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
  });
  const runtime = new Miniflare({
    modules: true,
    script: result.outputFiles[0].text,
    compatibilityDate: '2026-07-02',
    d1Databases: { DB: 'cms-test' },
  });
  return { runtime, db: await runtime.getD1Database('DB'), dispose: () => runtime.dispose() };
}
