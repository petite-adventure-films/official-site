import { Miniflare } from 'miniflare';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Each invocation owns an isolated, in-memory D1 database. Never uses cloud bindings.
export async function createWorkerFixture(entry = 'index', bindings: Record<string, string> = {}) {
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
    bindings,
    script: result.outputFiles[0].text,
    compatibilityDate: '2026-07-02',
    compatibilityFlags: ['nodejs_compat'],
    d1Databases: { DB: 'cms-test' },
    r2Buckets: ['MEDIA'],
  });
  return { runtime, db: await runtime.getD1Database('DB'), dispose: () => runtime.dispose() };
}
