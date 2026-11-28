// Re-read local blobs; link scheme aliases only when both URL jobs have equal verified bytes.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, realpath, lstat, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeUsagePlan } from './acquire-wordpress-media-usage.mjs';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const check = (condition, code) => {
  if (!condition) throw Error(code);
};
export async function verifyMediaUsage({
  usageBytes,
  transferBytes,
  originalCache,
  acquisitions,
  decisionsBytes = Buffer.from(
    '{"schemaVersion":"wordpress-media-recovery-decisions/v1","decisions":[]}',
  ),
}) {
  const usage = JSON.parse(usageBytes),
    transfer = JSON.parse(transferBytes),
    expected = makeUsagePlan(usageBytes);
  check(
    hash(transferBytes) === usage.inputHashes.transfer,
    'transfer_hash_mismatch',
  );
  const expectedJobs = new Map(expected.jobs.map((j) => [j.url, j])),
    acquired = new Map(),
    checked = new Map();
  async function verify(cache, file) {
    check(
      file &&
        /^[a-f0-9]{64}$/.test(file.sha256) &&
        Number.isSafeInteger(file.bytes) &&
        file.bytes > 0,
      'invalid_file_record',
    );
    check(
      new RegExp(`^blobs/${file.sha256}\\.(jpg|png|gif|webp|pdf)$`).test(
        file.path,
      ),
      'invalid_blob_path',
    );
    const root = await realpath(cache),
      target = join(root, file.path),
      info = await lstat(target);
    check(
      info.isFile() &&
        !info.isSymbolicLink() &&
        info.size === file.bytes &&
        (await realpath(target)).startsWith(root + sep),
      'invalid_blob',
    );
    const identity = `${root}\0${file.path}`;
    if (!checked.has(identity)) {
      const digest = createHash('sha256');
      let bytes = 0;
      for await (const part of createReadStream(target)) {
        bytes += part.length;
        digest.update(part);
      }
      checked.set(identity, { sha256: digest.digest('hex'), bytes });
    }
    const actual = checked.get(identity);
    check(
      actual.sha256 === file.sha256 && actual.bytes === file.bytes,
      'blob_mismatch',
    );
    return { sha256: file.sha256, sizeBytes: file.bytes, localPath: file.path };
  }
  for (const acquisition of acquisitions) {
    const plan = JSON.parse(acquisition.planBytes),
      result = JSON.parse(acquisition.resultBytes);
    check(
      result.inputHash === hash(JSON.stringify(plan)),
      'acquisition_plan_mismatch',
    );
    // A retry cache may contain an explicit subset; it cannot add URLs or alter source references.
    check(
      plan.inventoryHash === expected.inventoryHash &&
        plan.snapshotHash === expected.snapshotHash &&
        plan.schemaVersion === 1,
      'acquisition_source_mismatch',
    );
    const jobs = new Map();
    for (const job of plan.jobs) {
      check(
        !jobs.has(job.url) &&
          JSON.stringify(job) === JSON.stringify(expectedJobs.get(job.url)),
        'unexpected_acquisition_job',
      );
      jobs.set(job.url, job);
    }
    check(
      Array.isArray(result.jobs) && result.jobs.length === jobs.size,
      'acquisition_job_count',
    );
    const seen = new Set();
    for (const job of result.jobs) {
      check(
        jobs.has(job.url) &&
          !seen.has(job.url) &&
          JSON.stringify(job.source) ===
            JSON.stringify(jobs.get(job.url).sources),
        'acquisition_job_mismatch',
      );
      seen.add(job.url);
      const entry = {
        state: job.state,
        reportHash: hash(acquisition.resultBytes),
      };
      if (job.state === 'verified-local') {
        check(job.error === null, 'verified_error');
        Object.assign(entry, await verify(acquisition.cache, job.file), {
          cache: await realpath(acquisition.cache),
          mime: job.file.mime,
          width: job.file.width,
          height: job.file.height,
        });
      } else if (job.state === 'missing')
        check(
          !job.file && ['http_404', 'http_410'].includes(job.error),
          'invalid_missing',
        );
      else entry.state = 'unresolved';
      const prior = acquired.get(job.url);
      if (prior?.state === 'verified-local' && entry.state === 'verified-local')
        check(prior.sha256 === entry.sha256, 'conflicting_acquisitions');
      if (
        (prior?.state === 'verified-local' && entry.state === 'missing') ||
        (prior?.state === 'missing' && entry.state === 'verified-local')
      )
        throw Error('conflicting_acquisition_states');
      if (!prior || prior.state === 'unresolved') acquired.set(job.url, entry);
    }
  }
  const oldUrls = new Map(transfer.urls.map((u) => [u.url, u])),
    oldObjects = new Map(
      transfer.objects.map((o) => [o.original.storageKey, o]),
    );
  const urls = [];
  for (const source of usage.urls) {
    let evidence;
    if (expectedJobs.has(source.url))
      evidence = acquired.get(source.url) ?? { state: 'unresolved' };
    else {
      const old = oldUrls.get(source.url),
        object = old && oldObjects.get(old.storageKey);
      if (object) {
        evidence = {
          state: 'verified-local',
          ...(await verify(originalCache, {
            sha256: object.original.sha256,
            bytes: object.original.sizeBytes,
            path: object.localPath,
          })),
          cache: await realpath(originalCache),
          mime: object.original.mimeType,
          width: object.original.width,
          height: object.original.height,
        };
      } else
        evidence = {
          state: old?.state === 'missing' ? 'missing' : 'unresolved',
        };
    }
    urls.push({
      url: source.url,
      usage: source.usage,
      evidence,
      attachmentMatch: source.attachmentMatch,
      attachments: source.attachments,
    });
  }
  const decisions = JSON.parse(decisionsBytes),
    decisionUrls = new Set();
  check(
    decisions.schemaVersion === 'wordpress-media-recovery-decisions/v1',
    'invalid_decisions',
  );
  for (const decision of decisions.decisions) {
    check(!decisionUrls.has(decision.sourceUrl), 'duplicate_decision');
    decisionUrls.add(decision.sourceUrl);
    const entry = urls.find((u) => u.url === decision.sourceUrl),
      source = usage.urls.find((u) => u.url === decision.sourceUrl);
    check(
      entry?.evidence.state === 'missing' &&
        source.references.every(
          (r) =>
            r.sourceStatus === 'publish' &&
            decision.articleIds.includes(r.legacyId),
        ) &&
        decision.articleIds.every((id) =>
          source.references.some((r) => r.legacyId === id),
        ),
      'decision_scope_mismatch',
    );
    check(
      decision.preserveOriginalHtml === true &&
        typeof decision.approval === 'string',
      'missing_decision_provenance',
    );
    entry.originalFailure = entry.evidence;
    entry.decision = decision;
    if (decision.decision === 'exclude') {
      check(!decision.recoveryUrl && !decision.sha256, 'invalid_exclusion');
      entry.evidence = { state: 'approved-exclusion' };
    } else {
      check(decision.decision === 'recover-original', 'unknown_decision');
      const target = oldUrls.get(decision.recoveryUrl),
        object = target && oldObjects.get(target.storageKey);
      check(
        object &&
          object.original.sha256 === decision.sha256 &&
          object.original.mimeType.startsWith('image/'),
        'recovery_object_mismatch',
      );
      entry.evidence = {
        state: 'recovery-verified-local',
        ...(await verify(originalCache, {
          sha256: object.original.sha256,
          bytes: object.original.sizeBytes,
          path: object.localPath,
        })),
        cache: await realpath(originalCache),
        mime: object.original.mimeType,
        width: object.original.width,
        height: object.original.height,
      };
    }
  }
  const byUrl = new Map(urls.map((u) => [u.url, u]));
  for (const entry of urls) {
    if (
      entry.attachmentMatch !== 'not-in-wxr' ||
      entry.evidence.state !== 'verified-local'
    )
      continue;
    const url = new URL(entry.url);
    url.protocol = url.protocol === 'http:' ? 'https:' : 'http:';
    const counterpart = byUrl.get(url.href);
    if (
      counterpart?.attachmentMatch === 'matched' &&
      counterpart.evidence.state === 'verified-local' &&
      counterpart.evidence.sha256 === entry.evidence.sha256 &&
      counterpart.evidence.sizeBytes === entry.evidence.sizeBytes
    ) {
      entry.attachmentMatch = 'verified-scheme-alias';
      entry.attachments = counterpart.attachments;
      entry.aliasEvidence = counterpart.url;
    }
  }
  const countBy = (entries, key) =>
    entries.reduce((s, e) => {
      const v = key(e);
      s[v] = (s[v] ?? 0) + 1;
      return s;
    }, {});
  const unique = new Map(
    urls
      .filter((u) =>
        ['verified-local', 'recovery-verified-local'].includes(
          u.evidence.state,
        ),
      )
      .map((u) => [u.evidence.sha256, u.evidence.sizeBytes]),
  );
  return {
    schemaVersion: 'wordpress-media-usage-verification/v1',
    usageHash: hash(usageBytes),
    transferHash: hash(transferBytes),
    decisionsHash: hash(decisionsBytes),
    acquisitionHashes: acquisitions.map((a) => hash(a.resultBytes)),
    summary: {
      urls: urls.length,
      states: countBy(urls, (u) => u.evidence.state),
      uniqueObjects: unique.size,
      uniqueBytes: [...unique.values()].reduce((n, b) => n + b, 0),
      nonpublic: {
        urls: urls.filter((u) => u.usage !== 'public-only').length,
        states: countBy(
          urls.filter((u) => u.usage !== 'public-only'),
          (u) => u.evidence.state,
        ),
        attachmentMatch: countBy(
          urls.filter((u) => u.usage !== 'public-only'),
          (u) => u.attachmentMatch,
        ),
      },
    },
    limitations: [
      'local verified bytes only; no registered asset IDs or delivery URLs',
      'approved exclusions are separate from recovered or verified files',
      'attachment direct-access policy does not publish articles',
    ],
    urls,
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    // usage transfer old-cache new-output acquisition-cache [retry-cache ...]
    const args = process.argv.slice(2);
    check(args.length >= 5, 'usage');
    const local = await realpath(
        fileURLToPath(new URL('../../.local', import.meta.url)),
      ),
      output = resolve(args[3]);
    const paths = await Promise.all(
      [...args.slice(0, 3), ...args.slice(4)].map((p) => realpath(resolve(p))),
    );
    check(
      [...paths, await realpath(dirname(output))].every(
        (p) => p === local || p.startsWith(local + sep),
      ),
      'local_paths_required',
    );
    const acquisitions = await Promise.all(
      paths
        .slice(3)
        .map(async (cache) => ({
          cache,
          planBytes: await readFile(join(cache, 'plan.json')),
          resultBytes: await readFile(join(cache, 'result.json')),
        })),
    );
    const report = await verifyMediaUsage({
      usageBytes: await readFile(paths[0]),
      transferBytes: await readFile(paths[1]),
      originalCache: paths[2],
      acquisitions,
      decisionsBytes: await readFile(
        new URL(
          '../../specs/011-wordpress-conversion/media-recovery-decisions.json',
          import.meta.url,
        ),
      ),
    });
    await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
    console.log(JSON.stringify(report.summary));
  } catch {
    console.error(
      'Media verification failed; inspect local inputs and unused output path.',
    );
    process.exitCode = 1;
  }
}
