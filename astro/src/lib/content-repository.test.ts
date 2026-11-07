import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { FileJsonContentRepository } from '../../../packages/content-repository/src/file-json';
import type { Content } from '../../../packages/content-repository/src/types';
import { RepositoryValidationError } from '../../../packages/content-repository/src/validation';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

async function createRepository() {
  const rootDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'paf-content-repository-'));
  temporaryDirectories.push(rootDirectory);
  return {
    rootDirectory,
    repository: new FileJsonContentRepository({
      rootDirectory,
      now: () => new Date('2026-08-12T00:00:00.000Z'),
    }),
  };
}

function blog(overrides: Partial<Content['record']> = {}): Content {
  const record = {
    schemaVersion: 1,
    id: 'blog_first',
    type: 'blog' as const,
    publication: { state: 'draft' as const },
    workingRevisionId: 'rev_blog_first_1',
    createdAt: '2026-08-12T09:00:00+09:00',
    updatedAt: '2026-08-12T09:00:00+09:00',
    ...overrides,
  };
  return {
    record,
    workingRevision: {
      schemaVersion: 1,
      revisionId: record.workingRevisionId,
      contentId: record.id,
      state: 'working',
      createdAt: record.updatedAt,
      createdBy: 'user_test',
      payload: {
        schemaVersion: 1,
        type: 'blog',
        title: '最初の記事',
        slug: 'first-post',
      },
    },
  };
}

describe('FileJsonContentRepository', () => {
  it('saves and loads an aggregate while keeping record and revision separate', async () => {
    const { repository, rootDirectory } = await createRepository();
    const content = blog();

    await repository.save(content);

    await expect(repository.findById(content.record.id)).resolves.toEqual(content);
    await expect(
      fs.stat(path.join(rootDirectory, 'records', 'blog_first.json')),
    ).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(rootDirectory, 'revisions', 'blog_first', 'rev_blog_first_1.json')),
    ).resolves.toBeDefined();
  });

  it('finds by slug and searches the lightweight index', async () => {
    const { repository, rootDirectory } = await createRepository();
    await repository.save(blog());
    const second = blog({
      id: 'blog_second',
      workingRevisionId: 'rev_blog_second_1',
      updatedAt: '2026-08-12T10:00:00+09:00',
    });
    second.workingRevision.revisionId = 'rev_blog_second_1';
    second.workingRevision.contentId = 'blog_second';
    second.workingRevision.createdAt = second.record.updatedAt;
    second.workingRevision.payload.title = 'ふたつめのお知らせ';
    second.workingRevision.payload.slug = 'second-post';
    await repository.save(second);

    await expect(repository.findBySlug('blog', 'second-post')).resolves.toEqual(second);
    await expect(repository.search({ text: 'お知らせ', types: ['blog'] })).resolves.toEqual([
      expect.objectContaining({ id: 'blog_second', slug: 'second-post' }),
    ]);

    const index = JSON.parse(
      await fs.readFile(path.join(rootDirectory, 'indexes', 'content.json'), 'utf8'),
    ) as { entries: Record<string, unknown>[] };
    expect(index.entries).toHaveLength(2);
    expect(JSON.stringify(index)).not.toContain('body');
  });

  it('rejects a duplicate slug within the same content type', async () => {
    const { repository } = await createRepository();
    await repository.save(blog());
    const duplicate = blog({ id: 'blog_duplicate', workingRevisionId: 'rev_blog_duplicate_1' });
    duplicate.workingRevision.revisionId = 'rev_blog_duplicate_1';
    duplicate.workingRevision.contentId = 'blog_duplicate';

    await expect(repository.save(duplicate)).rejects.toThrow('duplicate slug for blog');
  });

  it('rebuilds a missing derived index from canonical JSON', async () => {
    const { repository, rootDirectory } = await createRepository();
    await repository.save(blog());
    await fs.rm(path.join(rootDirectory, 'indexes', 'content.json'));

    await expect(repository.search({})).resolves.toEqual([
      expect.objectContaining({ id: 'blog_first' }),
    ]);
  });

  it('validates aggregate references and removes all canonical files', async () => {
    const { repository, rootDirectory } = await createRepository();
    const invalid = blog();
    invalid.workingRevision.contentId = 'blog_someone_else';
    await expect(repository.save(invalid)).rejects.toBeInstanceOf(RepositoryValidationError);

    await repository.save(blog());
    await repository.remove('blog_first');
    await expect(repository.findById('blog_first')).resolves.toBeNull();
    await expect(fs.stat(path.join(rootDirectory, 'revisions', 'blog_first'))).rejects.toThrow();
    await expect(repository.search({})).resolves.toEqual([]);
  });
});
