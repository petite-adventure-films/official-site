import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildInventory,
  extractUrls,
  normalizeMediaUrl,
  preserveRemoteResults,
  renderSummary,
  summarizeRemoteChecks,
} from './inventory-wordpress-media.mjs';
import { createOriginalSizeCandidate } from './probe-wordpress-media.mjs';

test('extractUrls decodes HTML ampersands', () => {
  assert.deepEqual(extractUrls('<img src="https://example.com/a.jpg?x=1&amp;y=2">'), [
    'https://example.com/a.jpg?x=1&y=2',
  ]);
});

test('normalizeMediaUrl removes query strings and maps the storage key', () => {
  assert.deepEqual(
    normalizeMediaUrl(
      'https://www.petiteadventurefilms.com/wp/wp-content/uploads/2024/10/image.JPG?cache=1',
    ),
    {
      sourceUrl: 'https://www.petiteadventurefilms.com/wp/wp-content/uploads/2024/10/image.JPG',
      host: 'www.petiteadventurefilms.com',
      pathname: '/wp/wp-content/uploads/2024/10/image.JPG',
      relativePath: '2024/10/image.JPG',
      storageKey: 'wordpress/2024/10/image.JPG',
      extension: 'jpg',
    },
  );
});

test('buildInventory deduplicates URLs and records every referring content item', () => {
  const url = 'https://www.petiteadventurefilms.com/wp/wp-content/uploads/2024/10/a.jpg';
  const httpUrl = url.replace('https://', 'http://');
  const inventory = buildInventory({
    schemaVersion: 1,
    source: { exportedAt: '2026-08-10T00:00:00.000Z' },
    content: {
      blogs: [
        {
          id: 1,
          name: 'first',
          title: 'First',
          content: `<img src="${url}"><img src="${url}">`,
        },
        { id: 2, name: 'second', title: 'Second', content: `<img src="${httpUrl}">` },
      ],
    },
  });

  assert.equal(inventory.summary.uniqueMedia, 1);
  assert.equal(inventory.summary.totalReferences, 3);
  assert.equal(inventory.entries[0].occurrenceCount, 3);
  assert.deepEqual(inventory.entries[0].sourceUrls, [httpUrl, url]);
  assert.deepEqual(
    inventory.entries[0].references.map((reference) => reference.legacyId),
    [1, 2],
  );
  assert.match(renderSummary(inventory), /ユニークメディア（保存キー単位）: 1件/u);
  assert.equal(inventory.summary.sourceUrlVariants, 2);
});

test('summarizeRemoteChecks excludes missing files from the size estimate', () => {
  const summary = summarizeRemoteChecks([
    { extension: 'jpg', remoteCheck: { ok: true, httpStatus: 200, contentLength: 100 } },
    { extension: 'jpg', remoteCheck: { ok: false, httpStatus: 404, contentLength: null } },
  ]);

  assert.equal(summary.available, 1);
  assert.equal(summary.missing, 1);
  assert.equal(summary.recoverableMissing, 0);
  assert.equal(summary.knownBytes, 100);
  assert.equal(summary.estimatedBytes, 100);
  assert.deepEqual(summary.byExtension.jpg, {
    checked: 2,
    available: 1,
    missing: 1,
    knownBytes: 100,
  });
});

test('createOriginalSizeCandidate removes a WordPress thumbnail suffix', () => {
  assert.equal(
    createOriginalSizeCandidate('https://example.com/wp-content/uploads/2024/10/image-300x225.jpg'),
    'https://example.com/wp-content/uploads/2024/10/image.jpg',
  );
  assert.equal(
    createOriginalSizeCandidate('https://example.com/wp-content/uploads/2024/10/image.jpg'),
    null,
  );
});

test('preserveRemoteResults keeps checks and recovery candidates on regeneration', () => {
  const entries = [
    {
      sourceUrl: 'https://example.com/missing-300x225.jpg',
      storageKey: 'wordpress/missing-300x225.jpg',
    },
  ];
  preserveRemoteResults(entries, [
    {
      sourceUrl: 'http://example.com/missing-300x225.jpg',
      storageKey: 'wordpress/missing-300x225.jpg',
      remoteCheck: { ok: false, httpStatus: 404 },
      recoveryCandidate: {
        sourceUrl: 'https://example.com/missing.jpg',
        remoteCheck: { ok: true, httpStatus: 200 },
      },
    },
  ]);

  assert.equal(entries[0].remoteCheck.httpStatus, 404);
  assert.equal(entries[0].recoveryCandidate.remoteCheck.ok, true);
});
