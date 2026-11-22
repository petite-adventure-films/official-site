// #339: local transfer preparation only. No network, asset IDs, SQL writes or upload commands.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, lstat, realpath, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { makePlan } from './acquire-wordpress-media.mjs';
import { buildInventory } from './inventory-wordpress-media.mjs';
import { mediaTypes, maxMediaBytes } from '../../packages/content-schema/media-policy.ts';

const hash = (data) => createHash('sha256').update(data).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const exec = promisify(execFile);
async function verifyFile(cacheRoot, file) {
  if (
    !file ||
    !/^[a-f0-9]{64}$/.test(file.sha256) ||
    !Object.hasOwn(mediaTypes, file.mime) ||
    !Number.isSafeInteger(file.bytes) ||
    file.bytes < 1
  )
    throw Error('invalid_file_record');
  const extension = mediaTypes[file.mime];
  if (file.path !== `blobs/${file.sha256}.${extension}`) throw Error('unexpected_blob_path');
  const path = join(cacheRoot, file.path);
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size !== file.bytes)
    throw Error('invalid_blob_file');
  const actualPath = await realpath(path);
  if (!actualPath.startsWith(cacheRoot + sep)) throw Error('blob_outside_cache');
  const digest = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(actualPath)) {
    digest.update(chunk);
    bytes += chunk.length;
  }
  if (bytes !== file.bytes || digest.digest('hex') !== file.sha256)
    throw Error('blob_checksum_mismatch');
  if (file.mime === 'application/pdf') {
    const { stdout } = await exec('pdfinfo', [actualPath], {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });
    const pages = Number(stdout.match(/^Pages:\s+(\d+)/m)?.[1]);
    if (file.format !== 'pdf' || !pages || pages !== file.pages)
      throw Error('pdf_metadata_mismatch');
  } else {
    const metadata = await sharp(actualPath, {
      limitInputPixels: 40000000,
      failOn: 'warning',
      animated: true,
    }).metadata();
    if (
      `image/${metadata.format}` !== file.mime ||
      metadata.format !== file.format ||
      metadata.width !== file.width ||
      metadata.height !== file.height ||
      (metadata.pages ?? 1) !== file.pages
    )
      throw Error('image_metadata_mismatch');
  }
  return {
    kind: file.mime === 'application/pdf' ? 'document' : 'image',
    localPath: file.path,
    original: {
      storageKey: `originals/${file.sha256.slice(0, 2)}/${file.sha256}.${extension}`,
      mimeType: file.mime,
      sizeBytes: file.bytes,
      sha256: file.sha256,
      ...(file.mime === 'application/pdf' ? {} : { width: file.width, height: file.height }),
    },
  };
}
export async function prepareTransfer({ snapshotBytes, inventoryBytes, reportBytes, cache }) {
  const inventory = JSON.parse(inventoryBytes),
    snapshot = JSON.parse(snapshotBytes),
    report = JSON.parse(reportBytes);
  const entries = (value) =>
    value.entries
      .map((e) => [e.storageKey, [...e.sourceUrls].sort(), e.references])
      .sort((a, b) => a[0].localeCompare(b[0]));
  if (!same(entries(inventory), entries(buildInventory(snapshot))))
    throw Error('snapshot_inventory_mismatch');
  const plan = makePlan(inventory, hash(inventoryBytes), hash(snapshotBytes));
  const inputHash = hash(JSON.stringify(plan));
  if (report.inputHash !== inputHash || report.stopReason !== null)
    throw Error('acquisition_input_mismatch');
  if (!Array.isArray(report.jobs) || report.jobs.length !== plan.jobs.length)
    throw Error('job_set_mismatch');
  const expected = new Map(plan.jobs.map((job) => [job.url, job]));
  const seen = new Set(),
    counts = {};
  for (const job of report.jobs) {
    if (
      seen.has(job.url) ||
      !expected.has(job.url) ||
      !same(expected.get(job.url).sources, job.source)
    )
      throw Error('job_set_mismatch');
    seen.add(job.url);
    if (!['verified-local', 'missing'].includes(job.state)) throw Error('unfinished_acquisition');
    if (
      job.state === 'missing' &&
      (job.file !== null || !['http_404', 'http_410'].includes(job.error))
    )
      throw Error('invalid_missing_record');
    if (job.state === 'verified-local' && job.error !== null)
      throw Error('invalid_verified_record');
    counts[job.state] = (counts[job.state] ?? 0) + 1;
  }
  const pairs = (value) => Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  if (!same(pairs(counts), pairs(report.counts))) throw Error('acquisition_count_mismatch');
  const cacheRoot = await realpath(cache),
    objects = new Map(),
    records = new Map(),
    urls = [],
    paths = new Map();
  for (const job of report.jobs) {
    const referenced = job.source.some((source) => source.role === 'referenced');
    let object;
    if (job.state === 'verified-local') {
      const file = job.file;
      const signature = JSON.stringify(file);
      if (records.has(file?.sha256) && records.get(file.sha256) !== signature)
        throw Error('conflicting_blob_metadata');
      if (!records.has(file?.sha256)) {
        object = await verifyFile(cacheRoot, file);
        object.urls = [];
        object.referenced = false;
        object.withinCmsUploadLimit = file.bytes <= maxMediaBytes(file.mime);
        objects.set(file.sha256, object);
        records.set(file.sha256, signature);
      }
      object = objects.get(file.sha256);
      object.urls.push(job.url);
      object.referenced ||= referenced;
    }
    const state = !object
      ? 'missing'
      : !referenced
        ? 'candidate-only'
        : object.withinCmsUploadLimit
          ? 'planned'
          : 'blocked-upload-limit';
    urls.push({
      url: job.url,
      state,
      ...(object ? { storageKey: object.original.storageKey } : { reason: job.error }),
      sources: job.source,
    });
    for (const source of job.source.filter((source) => source.role === 'referenced')) {
      const p = paths.get(source.storageKey) ?? {
        legacyStorageKey: source.storageKey,
        urls: [],
        hashes: new Set(),
        complete: true,
      };
      p.urls.push(job.url);
      if (object) p.hashes.add(object.original.sha256);
      if (state !== 'planned') p.complete = false;
      paths.set(source.storageKey, p);
    }
  }
  const pathMappings = [...paths.values()].map((p) => {
    if (p.hashes.size > 1) throw Error('alias_hash_mismatch');
    const sha = [...p.hashes][0];
    return {
      legacyStorageKey: p.legacyStorageKey,
      urls: p.urls,
      state: p.complete ? 'planned' : 'blocked',
      ...(p.complete ? { storageKey: objects.get(sha).original.storageKey } : {}),
    };
  });
  const objectList = [...objects.values()].map((object) => ({
    ...object,
    state: !object.referenced
      ? 'candidate-only'
      : object.withinCmsUploadLimit
        ? 'planned'
        : 'blocked-upload-limit',
  }));
  const selected = objectList.filter((o) => o.state === 'planned');
  return {
    schemaVersion: 'wordpress-media-transfer-preflight/v1',
    inputHash,
    snapshotHash: plan.snapshotHash,
    inventoryHash: plan.inventoryHash,
    acquisitionReportHash: hash(reportBytes),
    limitations: [
      'local preparation only; no registered assetId or remote verification',
      'missing sources and original-size candidates are not replacements',
      'public snapshot only; final synchronization and private-media scope unverified',
    ],
    summary: {
      urls: urls.length,
      referencedUrls: urls.filter((u) => u.sources.some((s) => s.role === 'referenced')).length,
      missingUrls: urls.filter((u) => u.state === 'missing').length,
      verifiedObjects: objectList.length,
      verifiedBytes: objectList.reduce((n, o) => n + o.original.sizeBytes, 0),
      plannedObjects: selected.length,
      plannedBytes: selected.reduce((n, o) => n + o.original.sizeBytes, 0),
      candidateOnlyObjects: objectList.filter((o) => o.state === 'candidate-only').length,
      uploadLimitBlockedObjects: objectList.filter((o) => o.state === 'blocked-upload-limit')
        .length,
      legacyPaths: pathMappings.length,
      plannedPaths: pathMappings.filter((p) => p.state === 'planned').length,
    },
    objects: objectList,
    urls,
    paths: pathMappings,
  };
}
export async function writeTransfer(path, manifest) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args.some((arg) => arg.startsWith('--')))
    throw Error('usage: <acquisition-cache> <new-output.json>');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const cache = resolve(args[0]),
    output = resolve(args[1]);
  const manifest = await prepareTransfer({
    cache,
    snapshotBytes: await readFile(join(root, 'astro/data/wordpress-export.json')),
    inventoryBytes: await readFile(join(root, 'astro/data/wordpress-media-inventory.json')),
    reportBytes: await readFile(join(cache, 'result.json')),
  });
  await writeTransfer(output, manifest);
  console.log(JSON.stringify(manifest.summary, null, 2));
  console.log(`Manifest: ${output}`);
}
