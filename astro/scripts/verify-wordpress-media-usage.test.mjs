import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { makeUsagePlan } from './acquire-wordpress-media-usage.mjs';
import { verifyMediaUsage } from './verify-wordpress-media-usage.mjs';
const hash = (b) => createHash('sha256').update(b).digest('hex'),
  bytes = (v) => Buffer.from(JSON.stringify(v));
const url =
  'https://www.petiteadventurefilms.com/wp/wp-content/uploads/2020/a.png';
async function fixture() {
  const cache = await mkdtemp(join(tmpdir(), 'paf-media-verify-'));
  await mkdir(join(cache, 'blobs'));
  const blob = Buffer.from('synthetic immutable bytes'),
    sha256 = hash(blob),
    path = `blobs/${sha256}.png`;
  await writeFile(join(cache, path), blob);
  const transfer = { urls: [], objects: [] },
    transferBytes = bytes(transfer);
  const usage = {
    schemaVersion: 'wordpress-combined-media-usage/v1',
    summary: { unparsed: 0 },
    inputHashes: { public: 'public-hash', transfer: hash(transferBytes) },
    urls: [
      {
        url,
        usage: 'nonpublic-only',
        acquisition: 'not-in-existing-transfer',
        references: [
          { legacyId: 1, sourceStatus: 'private', field: 'rendered' },
        ],
        attachmentMatch: 'matched',
        attachments: [{ legacyId: 2, kind: 'original' }],
      },
      {
        url: url.replace('https:', 'http:'),
        usage: 'nonpublic-only',
        acquisition: 'not-in-existing-transfer',
        references: [{ legacyId: 1, sourceStatus: 'private', field: 'raw' }],
        attachmentMatch: 'not-in-wxr',
        attachments: [],
      },
    ],
  };
  const usageBytes = bytes(usage),
    plan = makeUsagePlan(usageBytes);
  const result = {
    inputHash: hash(JSON.stringify(plan)),
    jobs: plan.jobs.map((j) => ({
      url: j.url,
      source: j.sources,
      state: 'verified-local',
      error: null,
      file: {
        sha256,
        bytes: blob.length,
        path,
        mime: 'image/png',
        width: 1,
        height: 1,
      },
    })),
  };
  const args = {
    usageBytes,
    transferBytes,
    originalCache: cache,
    acquisitions: [
      { cache, planBytes: bytes(plan), resultBytes: bytes(result) },
    ],
  };
  return { cache, blob, path, args, usage, transfer, result, plan, sha256 };
}
test('rechecks disk bytes and links only equal-byte HTTP/HTTPS attachment aliases', async () => {
  const f = await fixture();
  try {
    const report = await verifyMediaUsage(f.args);
    assert.equal(report.summary.uniqueObjects, 1);
    assert.equal(
      report.summary.nonpublic.attachmentMatch['verified-scheme-alias'],
      1,
    );
    assert.deepEqual(report, await verifyMediaUsage(f.args));
    await writeFile(join(f.cache, f.path), 'corrupt');
    await assert.rejects(
      verifyMediaUsage(f.args),
      /invalid_blob|blob_mismatch/,
    );
  } finally {
    await rm(f.cache, { recursive: true, force: true });
  }
});
test('rejects changed source provenance, invented jobs and conflicting results', async () => {
  const f = await fixture();
  try {
    await assert.rejects(
      verifyMediaUsage({ ...f.args, transferBytes: bytes({}) }),
      /transfer_hash/,
    );
    const result = structuredClone(f.result);
    result.jobs[0].source = [];
    await assert.rejects(
      verifyMediaUsage({
        ...f.args,
        acquisitions: [
          { ...f.args.acquisitions[0], resultBytes: bytes(result) },
        ],
      }),
      /job_mismatch/,
    );
    const plan = structuredClone(f.plan);
    plan.jobs[0].url = url + 'invented';
    await assert.rejects(
      verifyMediaUsage({
        ...f.args,
        acquisitions: [{ ...f.args.acquisitions[0], planBytes: bytes(plan) }],
      }),
      /plan_mismatch/,
    );
  } finally {
    await rm(f.cache, { recursive: true, force: true });
  }
});
test('applies scoped recovery/exclusion, verifies chosen bytes and preserves original missing evidence', async () => {
  const f = await fixture();
  try {
    const missing = url.replace('a.png', 'missing.png'),
      excluded = url.replace('a.png', 'excluded.png');
    const transfer = {
      urls: [
        { url: missing, state: 'missing' },
        { url: excluded, state: 'missing' },
        { url, storageKey: 'originals/chosen' },
      ],
      objects: [
        {
          localPath: f.path,
          original: {
            storageKey: 'originals/chosen',
            sha256: f.sha256,
            sizeBytes: f.blob.length,
            mimeType: 'image/png',
            width: 1,
            height: 1,
          },
        },
      ],
    };
    const usage = {
      ...f.usage,
      inputHashes: { ...f.usage.inputHashes, transfer: hash(bytes(transfer)) },
      urls: [missing, excluded].map((url) => ({
        url,
        usage: 'public-only',
        acquisition: 'missing',
        references: [{ legacyId: 10, sourceStatus: 'publish' }],
        attachmentMatch: 'not-in-wxr',
        attachments: [],
      })),
    };
    const decisions = {
      schemaVersion: 'wordpress-media-recovery-decisions/v1',
      decisions: [
        {
          sourceUrl: missing,
          articleIds: [10],
          decision: 'recover-original',
          approval: 'synthetic approval',
          preserveOriginalHtml: true,
          recoveryUrl: url,
          sha256: f.sha256,
        },
        {
          sourceUrl: excluded,
          articleIds: [10],
          decision: 'exclude',
          approval: 'synthetic approval',
          preserveOriginalHtml: true,
        },
      ],
    };
    const args = {
      usageBytes: bytes(usage),
      transferBytes: bytes(transfer),
      originalCache: f.cache,
      acquisitions: [],
      decisionsBytes: bytes(decisions),
    };
    const report = await verifyMediaUsage(args);
    assert.deepEqual(report.summary.states, {
      'recovery-verified-local': 1,
      'approved-exclusion': 1,
    });
    assert.equal(report.urls[0].originalFailure.state, 'missing');
    assert.equal(report.summary.uniqueObjects, 1);
    decisions.decisions[0].articleIds = [11];
    await assert.rejects(
      verifyMediaUsage({ ...args, decisionsBytes: bytes(decisions) }),
      /scope_mismatch/,
    );
  } finally {
    await rm(f.cache, { recursive: true, force: true });
  }
});
