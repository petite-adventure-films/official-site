import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import readdirGlob from 'readdir-glob';

test('patched minimatch preserves recursive include and ignore for the archive builder', async () => {
  const root = await mkdtemp(join(tmpdir(), 'paf-glob-'));
  try {
    await mkdir(join(root, 'nested'));
    await writeFile(join(root, 'keep.txt'), 'a');
    await writeFile(join(root, 'nested', 'keep.txt'), 'b');
    await writeFile(join(root, 'nested', 'skip.txt'), 'c');
    await writeFile(join(root, 'other.json'), '{}');
    const files = await new Promise((resolve, reject) => {
      const paths = [];
      readdirGlob(root, { pattern: '**/*.txt', ignore: '**/skip.txt' })
        .on('match', ({ relative }) => paths.push(relative))
        .on('error', reject)
        .on('end', () => resolve(paths.sort()));
    });
    assert.deepEqual(files, ['keep.txt', 'nested/keep.txt']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
