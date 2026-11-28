// Read-only D1 reconciliation and anonymous HTTP verification of every registered attachment.
import { createHash } from 'node:crypto';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediaTypes } from '../../packages/content-schema/media-policy.ts';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const check = (condition, code) => {
  if (!condition) throw Error(code);
};
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  let proxy;
  try {
    check(
      process.argv.length === 4 ||
        (process.argv.length === 6 && process.argv[4] === '--retry'),
      'usage',
    );
    const local = await realpath(
      fileURLToPath(new URL('../../.local', import.meta.url)),
    );
    const input = await realpath(resolve(process.argv[2])),
      output = resolve(process.argv[3]);
    check(
      [input, await realpath(dirname(output))].every(
        (p) => p === local || p.startsWith(local + sep),
      ),
      'local_paths_required',
    );
    const { open } = await import('node:fs/promises');
    const handle = await open(output, 'wx', 0o600);
    await handle.close();
    const bytes = await readFile(input),
      report = JSON.parse(bytes);
    check(
      report.schemaVersion === 'wordpress-registered-media/v1' &&
        report.complete &&
        report.target?.database === 'paf-cms-migration-db' &&
        report.target.bucket === 'paf-cms-migration-media',
      'invalid_registration',
    );
    let prior, priorAuditHash;
    if (process.argv[5]) {
      const priorPath = await realpath(resolve(process.argv[5]));
      check(priorPath.startsWith(local + sep), 'local_retry_required');
      const priorBytes = await readFile(priorPath);
      prior = JSON.parse(priorBytes);
      priorAuditHash = hash(priorBytes);
      check(
        prior.schemaVersion === 'wordpress-media-remote-audit/v1' &&
          prior.registrationHash === hash(bytes) &&
          prior.results.length === report.assets.length,
        'invalid_retry',
      );
      const seen = new Set();
      for (const [index, result] of prior.results.entries()) {
        const asset = report.assets[index];
        check(
          result.id === asset.id &&
            !seen.has(result.id) &&
            typeof result.ok === 'boolean',
          'invalid_retry_result',
        );
        seen.add(result.id);
        if (result.ok)
          check(
            result.sha256 === asset.original.sha256 &&
              result.sizeBytes === asset.original.sizeBytes,
            'invalid_retry_success',
          );
      }
    }
    const { getPlatformProxy } = await import('wrangler');
    proxy = await getPlatformProxy({
      configPath: fileURLToPath(
        new URL('../wrangler.migration-import.jsonc', import.meta.url),
      ),
      envFiles: [],
      persist: false,
      remoteBindings: true,
    });
    const db = proxy.env.DB;
    const assets = (
      await db
        .prepare(
          'SELECT u.id,u.asset_json,m.sha256,m.state FROM media_uploads u LEFT JOIN wordpress_media_objects m ON m.asset_id=u.id',
        )
        .all()
    ).results;
    const sources = (
      await db
        .prepare(
          'SELECT source_url,sha256,disposition FROM wordpress_media_sources',
        )
        .all()
    ).results;
    const counts = await db
      .prepare(
        "SELECT (SELECT count(*) FROM content_drafts) articles,(SELECT count(*) FROM publication_state) publications,(SELECT count(*) FROM wordpress_media_objects WHERE state<>'confirmed') unconfirmed",
      )
      .first();
    check(
      counts.articles === 0 &&
        counts.publications === 0 &&
        counts.unconfirmed === 0,
      'unexpected_article_or_reservation_state',
    );
    check(
      assets.length === report.assets.length &&
        sources.length === report.urls.length,
      'remote_counts_mismatch',
    );
    const byId = new Map(assets.map((a) => [a.id, a])),
      sourceMap = new Map(sources.map((s) => [s.source_url, s]));
    for (const asset of report.assets) {
      const stored = byId.get(asset.id);
      check(
        stored?.state === 'confirmed' &&
          stored.sha256 === asset.original.sha256 &&
          stored.asset_json === JSON.stringify(asset),
        'remote_asset_mismatch',
      );
    }
    for (const row of report.urls) {
      const stored = sourceMap.get(row.url);
      check(
        stored &&
          stored.disposition === row.disposition &&
          stored.sha256 ===
            (row.assetId ? byId.get(row.assetId)?.sha256 : null),
        'remote_source_mismatch',
      );
    }
    await proxy.dispose();
    proxy = undefined;
    const origin =
      'https://paf-cms-migration-media.petiteadventurefilms2.workers.dev';
    const results = prior
      ? prior.results.slice()
      : new Array(report.assets.length);
    let next = 0,
      finished = 0;
    async function worker() {
      while (next < report.assets.length) {
        const index = next++,
          asset = report.assets[index],
          url = `${origin}/media/${asset.id}.${mediaTypes[asset.original.mimeType]}`;
        if (results[index]?.ok) continue;
        let outcome = { id: asset.id, ok: false };
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await fetch(url, {
              redirect: 'error',
              signal: AbortSignal.timeout(60_000),
            });
            const body = Buffer.from(await response.arrayBuffer());
            check(
              response.status === 200 &&
                body.length === asset.original.sizeBytes &&
                hash(body) === asset.original.sha256 &&
                response.headers.get('content-type') ===
                  asset.original.mimeType &&
                response.headers.get('x-content-type-options') === 'nosniff',
              'delivery_mismatch',
            );
            if (asset.kind === 'document')
              check(
                response.headers
                  .get('content-disposition')
                  ?.startsWith('attachment;'),
                'pdf_disposition',
              );
            outcome = {
              id: asset.id,
              ok: true,
              sha256: asset.original.sha256,
              sizeBytes: body.length,
            };
            break;
          } catch {
            if (attempt < 2) await new Promise((r) => setTimeout(r, 1000));
          }
        }
        results[index] = outcome;
        finished++;
        if (finished % 250 === 0)
          console.log(
            JSON.stringify({ checked: finished, total: report.assets.length }),
          );
      }
    }
    await Promise.all(Array.from({ length: 16 }, worker));
    for (const path of ['/', '/api/contents', '/api/media'])
      check(
        (await fetch(origin + path, { redirect: 'error' })).status === 404,
        'unexpected_route',
      );
    const summary = {
      assets: assets.length,
      sources: sources.length,
      articles: counts.articles,
      publications: counts.publications,
      unconfirmed: counts.unconfirmed,
      httpVerified: results.filter((r) => r.ok).length,
      httpFailed: results.filter((r) => !r.ok).length,
      bytes: report.assets.reduce((n, a) => n + a.original.sizeBytes, 0),
      blockedRoutes: 3,
    };
    await writeFile(
      output,
      JSON.stringify(
        {
          schemaVersion: 'wordpress-media-remote-audit/v1',
          registrationHash: hash(bytes),
          ...(priorAuditHash ? { priorAuditHash } : {}),
          summary,
          results,
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    );
    console.log(JSON.stringify(summary));
    if (summary.httpFailed) process.exitCode = 1;
  } catch {
    console.error(
      'Remote media audit failed; inspect local evidence without exposing private URLs.',
    );
    process.exitCode = 1;
  } finally {
    await proxy?.dispose();
  }
}
