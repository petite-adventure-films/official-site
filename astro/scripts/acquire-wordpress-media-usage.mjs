// Acquire only missing URLs explicitly referenced by the combined local usage report.
import { createHash } from 'node:crypto';
import { readFile, realpath, mkdir } from 'node:fs/promises';
import { resolve, dirname, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { acquire, allowedURL } from './acquire-wordpress-media.mjs';
export function makeUsagePlan(bytes) {
  const report = JSON.parse(bytes);
  if (
    report.schemaVersion !== 'wordpress-combined-media-usage/v1' ||
    report.summary.unparsed !== 0
  )
    throw Error('usage_not_ready');
  const seen = new Set();
  const jobs = report.urls
    .filter((u) => u.acquisition === 'not-in-existing-transfer')
    .map((u) => {
      const url = allowedURL(u.url);
      if (url.href !== u.url || seen.has(u.url) || !u.references?.length)
        throw Error('invalid_usage_url');
      seen.add(u.url);
      return {
        url: u.url,
        previouslyMissing: false,
        sources: [
          {
            role: 'referenced',
            storageKey: `wordpress/${url.pathname.slice('/wp/wp-content/uploads/'.length)}`,
            references: u.references,
          },
        ],
      };
    });
  return {
    schemaVersion: 1,
    inventoryHash: createHash('sha256').update(bytes).digest('hex'),
    snapshotHash: report.inputHashes.public,
    jobs,
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (
      process.argv.length !== 4 &&
      !(process.argv.length === 6 && process.argv[4] === '--retry-unresolved')
    )
      throw Error('usage');
    const local = await realpath(
      fileURLToPath(new URL('../../.local', import.meta.url)),
    );
    const input = await realpath(resolve(process.argv[2])),
      cache = resolve(process.argv[3]);
    const parent = await realpath(dirname(cache));
    if (![input, parent].every((p) => p === local || p.startsWith(local + sep)))
      throw Error('local_paths_required');
    await mkdir(cache, { recursive: true, mode: 0o700 });
    if (!(await realpath(cache)).startsWith(local + sep))
      throw Error('local_cache_required');
    let plan = makeUsagePlan(await readFile(input));
    if (process.argv[4]) {
      const prior = await realpath(resolve(process.argv[5]));
      if (!prior.startsWith(local + sep) || prior === (await realpath(cache)))
        throw Error('invalid_retry_cache');
      const previousPlan = JSON.parse(await readFile(join(prior, 'plan.json')));
      const previousResult = JSON.parse(
        await readFile(join(prior, 'result.json')),
      );
      if (
        JSON.stringify(previousPlan) !== JSON.stringify(plan) ||
        previousResult.inputHash !==
          createHash('sha256').update(JSON.stringify(plan)).digest('hex')
      )
        throw Error('invalid_retry_source');
      const unresolved = new Set(
        previousResult.jobs
          .filter((j) => !['verified-local', 'missing'].includes(j.state))
          .map((j) => j.url),
      );
      plan = { ...plan, jobs: plan.jobs.filter((j) => unresolved.has(j.url)) };
    }
    const result = await acquire({ plan, cache, budget: 1024 ** 3 });
    console.log(
      JSON.stringify({
        counts: result.counts,
        stopReason: result.stopReason,
        chargedBytes: result.chargedBytes,
      }),
    );
    if (
      result.stopReason ||
      result.jobs.some((j) => !['verified-local', 'missing'].includes(j.state))
    )
      process.exitCode = 1;
  } catch {
    console.error(
      'Media acquisition failed; inspect the private local report.',
    );
    process.exitCode = 1;
  }
}
