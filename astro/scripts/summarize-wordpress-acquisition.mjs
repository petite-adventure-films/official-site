import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function summarize(result) {
  const groups = new Map();
  const candidates = [];
  let verifiedBytes = 0;
  const blobs = new Map();
  const formats = {};
  for (const job of result.jobs) {
    if (job.state === 'verified-local') {
      verifiedBytes += job.file.bytes;
      blobs.set(job.file.sha256, job.file.bytes);
      formats[job.file.format] = (formats[job.file.format] ?? 0) + 1;
    }
    for (const source of job.source) {
      if (source.role === 'original-candidate') {
        candidates.push({
          sourceStorageKey: source.storageKey,
          url: job.url,
          state: job.state,
          file: job.file,
          references: source.references,
        });
      } else {
        const group = groups.get(source.storageKey) ?? [];
        group.push(job);
        groups.set(source.storageKey, group);
      }
    }
  }
  const aliases = [...groups].filter(([, jobs]) => jobs.length > 1);
  const same = aliases.filter(
    ([, jobs]) =>
      jobs.every((j) => j.state === 'verified-local') &&
      new Set(jobs.map((j) => j.file.sha256)).size === 1,
  );
  const conflicts = aliases.filter(
    ([, jobs]) =>
      new Set(jobs.filter((j) => j.file).map((j) => j.file.sha256)).size > 1,
  );
  return {
    inputHash: result.inputHash,
    checkedAt: result.checkedAt,
    counts: result.counts,
    stopReason: result.stopReason,
    chargedBytes: result.chargedBytes,
    knownReceivedBytes: result.knownReceivedBytes,
    unsettledReservationBytes: result.unsettledReservationBytes,
    verifiedURLBytes: verifiedBytes,
    uniqueBlobs: blobs.size,
    uniqueBlobBytes: [...blobs.values()].reduce((a, b) => a + b, 0),
    formats,
    referencedPaths: groups.size,
    pathsWithAllURLsVerified: [...groups.values()].filter((jobs) =>
      jobs.every((j) => j.state === 'verified-local'),
    ).length,
    aliases: {
      groups: aliases.length,
      allVerifiedAndSameHash: same.length,
      differentHash: conflicts.map(([storageKey, jobs]) => ({
        storageKey,
        urls: jobs.map((j) => ({
          url: j.url,
          state: j.state,
          sha256: j.file?.sha256,
        })),
      })),
    },
    unresolved: result.jobs
      .filter((j) => j.state !== 'verified-local')
      .map((j) => ({
        url: j.url,
        state: j.state,
        error: j.error,
        references: j.source,
      })),
    originalCandidates: candidates,
    boundary:
      'Local acquisition only. Candidates are not approved replacements; CMS/R2 registration and final synchronization are separate.',
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output)
    throw Error(
      'Usage: summarize-wordpress-acquisition.mjs result.json summary.json',
    );
  const summary = summarize(JSON.parse(await readFile(input, 'utf8')));
  await writeFile(output, JSON.stringify(summary, null, 2) + '\n');
  console.log(
    JSON.stringify({
      counts: summary.counts,
      referencedPaths: summary.referencedPaths,
      uniqueBlobs: summary.uniqueBlobs,
      aliasConflicts: summary.aliases.differentHash.length,
    }),
  );
}
