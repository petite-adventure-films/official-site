// Final handoff for #492: only IDs confirmed in the dedicated migration environment.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediaTypes } from '../../packages/content-schema/media-policy.ts';
const require = createRequire(new URL('../package.json', import.meta.url));
const Ajv = require('ajv/dist/2020.js').default;
const ajv = new Ajv({ strict: false });
ajv.addFormat(
  'date-time',
  (value) =>
    typeof value === 'string' &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value,
);
ajv.addSchema(
  JSON.parse(
    await readFile(
      new URL(
        '../../packages/content-schema/schemas/common.schema.json',
        import.meta.url,
      ),
    ),
  ),
);
const validateAsset = ajv.compile(
  JSON.parse(
    await readFile(
      new URL(
        '../../packages/content-schema/schemas/asset.schema.json',
        import.meta.url,
      ),
    ),
  ),
);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const check = (condition, code) => {
  if (!condition) throw Error(code);
};
export function prepareAssetMap(registeredBytes, verifiedBytes) {
  const registered = JSON.parse(registeredBytes),
    verified = JSON.parse(verifiedBytes);
  check(
    registered.schemaVersion === 'wordpress-registered-media/v1' &&
      registered.complete === true &&
      verified.schemaVersion === 'wordpress-media-usage-verification/v1' &&
      registered.inputHash === hash(JSON.stringify(verified)),
    'registration_not_complete_or_mismatched',
  );
  check(
    registered.target?.database === 'paf-cms-migration-db' &&
      registered.target.bucket === 'paf-cms-migration-media',
    'wrong_registration_environment',
  );
  const assets = new Map(),
    hashes = new Set(),
    urls = new Map();
  for (const asset of registered.assets) {
    check(
      validateAsset(asset) &&
        /^asset_[a-f0-9]{32}$/.test(asset.id) &&
        !assets.has(asset.id) &&
        !hashes.has(asset.original.sha256),
      'invalid_or_duplicate_asset',
    );
    const extension = mediaTypes[asset.original.mimeType];
    check(
      extension &&
        asset.original.storageKey ===
          `originals/${asset.original.sha256.slice(0, 2)}/${asset.original.sha256}.${extension}`,
      'invalid_storage_key',
    );
    assets.set(asset.id, asset);
    hashes.add(asset.original.sha256);
  }
  for (const row of registered.urls) {
    check(!urls.has(row.url), 'duplicate_registered_url');
    urls.set(row.url, row);
  }
  check(
    urls.size === verified.urls.length &&
      registered.summary.sources === urls.size &&
      registered.summary.objects === assets.size &&
      registered.summary.totalObjects === assets.size,
    'registration_count_mismatch',
  );
  const used = new Set();
  const entries = verified.urls.map((source) => {
    const row = urls.get(source.url);
    check(
      row && row.disposition === source.evidence.state,
      'source_disposition_mismatch',
    );
    if (row.disposition === 'approved-exclusion') {
      check(
        row.assetId === null && source.decision?.decision === 'exclude',
        'invalid_exclusion',
      );
      return {
        sourceUrl: row.url,
        disposition: 'excluded',
        decision: source.decision,
        assetId: null,
        deliveryUrl: null,
      };
    }
    const asset = assets.get(row.assetId),
      evidence = source.evidence;
    check(
      asset &&
        asset.original.sha256 === evidence.sha256 &&
        asset.original.mimeType === evidence.mime &&
        asset.original.sizeBytes === evidence.sizeBytes &&
        asset.original.width === evidence.width &&
        asset.original.height === evidence.height,
      'asset_evidence_mismatch',
    );
    used.add(asset.id);
    return {
      sourceUrl: row.url,
      disposition:
        row.disposition === 'recovery-verified-local'
          ? 'recovered'
          : 'registered',
      ...(source.decision ? { decision: source.decision } : {}),
      usage: source.usage,
      assetId: asset.id,
      kind: asset.kind,
      sha256: asset.original.sha256,
      deliveryUrl: `https://paf-cms-migration-media.petiteadventurefilms2.workers.dev/media/${asset.id}.${mediaTypes[asset.original.mimeType]}`,
    };
  });
  check(used.size === assets.size, 'unreferenced_registered_asset');
  return {
    schemaVersion: 'wordpress-asset-map/v1',
    target: registered.target,
    sourceHashes: {
      registration: hash(registeredBytes),
      verification: hash(verifiedBytes),
    },
    summary: {
      assets: assets.size,
      urls: entries.length,
      registered: entries.filter((e) => e.disposition === 'registered').length,
      recovered: entries.filter((e) => e.disposition === 'recovered').length,
      excluded: entries.filter((e) => e.disposition === 'excluded').length,
    },
    limitations: [
      'valid only in the dedicated migration environment',
      'article conversion/import and legacy URL redirects are separate',
      'article publication is not authorized by attachment delivery',
    ],
    assets: registered.assets,
    entries,
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    check(process.argv.length === 5, 'usage');
    const local = await realpath(
      fileURLToPath(new URL('../../.local', import.meta.url)),
    );
    const inputs = await Promise.all(
      process.argv.slice(2, 4).map((p) => realpath(resolve(p))),
    );
    const output = resolve(process.argv[4]);
    check(
      [...inputs, await realpath(dirname(output))].every(
        (p) => p === local || p.startsWith(local + sep),
      ),
      'local_paths_required',
    );
    const report = prepareAssetMap(
      ...(await Promise.all(inputs.map((p) => readFile(p)))),
    );
    await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
    console.log(JSON.stringify(report.summary));
  } catch {
    console.error(
      'Asset map failed; check local registration and verification inputs.',
    );
    process.exitCode = 1;
  }
}
