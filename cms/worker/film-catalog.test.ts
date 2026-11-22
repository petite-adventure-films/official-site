import { readFile, readdir } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { emptyArticleDraft } from '../src/features/articles/draft';
import { emptyDraft } from '../src/features/events/draft';
import { prepareBlogPublication } from './blog-publication';
import { prepareArticlePublication } from './article-publication';
import { prepareEventPublication } from './event-publication';
import mappings from '../../packages/content-schema/mappings/wordpress-film-tags.json';

test('adds the missing film references without modifying existing rows; all five types can save and validate publication', async () => {
  const f = await createWorkerFixture('local');
  const dir = new URL('../migrations/', import.meta.url);
  const apply = async (name: string) =>
    f.db.batch(
      unstable_splitSqlQuery(await readFile(new URL(name, dir), 'utf8')).map(
        (sql) => f.db.prepare(sql),
      ),
    );
  const request = (path: string, body?: unknown) =>
    f.runtime.dispatchFetch('http://localhost' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        Origin: 'http://127.0.0.1:5174',
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    for (const name of (await readdir(dir))
      .filter((n) => n.endsWith('.sql') && n < '0013')
      .sort())
      await apply(name);
    await f.db.batch(
      unstable_splitSqlQuery(
        await readFile(
          new URL('../e2e/history-fixtures.sql', import.meta.url),
          'utf8',
        ),
      ).map((sql) => f.db.prepare(sql)),
    );
    const create = (type: string, payload: unknown) =>
      request('/api/contents', {
        type,
        payload,
        operationId: crypto.randomUUID(),
      });
    const blog = {
      ...emptyBlogDraft(),
      title: '作品参照',
      slug: 'film-catalog-blog',
      categoryId: '2879',
      filmTagIds: ['2727', '160'],
    };
    expect((await create('blog', blog)).status).toBe(422);
    const tables = (
      await f.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name <> 'tags' ORDER BY name",
        )
        .all<{ name: string }>()
    ).results;
    const snapshot = () =>
      Promise.all(
        tables.map(
          async ({ name }: { name: string }) =>
            (
              await f.db
                .prepare(
                  `SELECT * FROM "${name.replaceAll('"', '""')}" ORDER BY rowid`,
                )
                .all()
            ).results,
        ),
      );
    const before = await snapshot();
    const oldTags = (
      await f.db.prepare('SELECT * FROM tags ORDER BY kind,id').all()
    ).results;
    await apply('0013_missing_film_tags.sql');
    expect(await snapshot()).toEqual(before);
    const tags = (
      await f.db.prepare('SELECT * FROM tags ORDER BY kind,id').all()
    ).results;
    expect(tags).toHaveLength(oldTags.length + 2);
    expect(tags).toEqual(expect.arrayContaining(oldTags));
    const catalog = (await (await request('/api/tags')).json()) as any;
    for (const mapping of mappings.mappings)
      expect(catalog.filmTags).toContainEqual({
        id: String(mapping.legacyTermId),
        kind: 'film',
        name: mapping.legacyName,
      });
    const filmTagIds = new Set<string>(
      catalog.filmTags.map((tag: any) => tag.id),
    );
    for (const type of [
      'blog',
      'event',
      'news',
      'pressCoverage',
      'video',
    ] as const) {
      const payload =
        type === 'blog'
          ? blog
          : type === 'event'
            ? {
                ...emptyDraft(),
                title: '上映',
                slug: 'film-catalog-event',
                startDate: '2026/11/22',
                venue: '会場',
                filmTagIds: ['2727', '160'],
              }
            : {
                ...emptyArticleDraft(type),
                title: '作品参照',
                slug: `film-catalog-${type.toLowerCase()}`,
                filmTagIds: ['2727', '160'],
                ...(type === 'video' ? { youtubeId: 'kwHsbFrH2EA' } : {}),
              };
      const response = await create(type, payload);
      expect(response.status, type).toBe(201);
      const saved = (await response.json()) as any;
      expect(
        ((await (await request(`/api/contents/${saved.id}`)).json()) as any)
          .payload.filmTagIds,
      ).toEqual(['2727', '160']);
      if (type === 'blog')
        expect(
          (await prepareBlogPublication(f.db, payload)).content.filmTagIds,
        ).toEqual(['2727', '160']);
      else if (type === 'event')
        expect(
          prepareEventPublication(payload, {
            contentId: saved.id,
            filmTagIds,
            eventTagIds: new Set(),
          }),
        ).toMatchObject({ ok: true, payload: { filmTagIds: ['2727', '160'] } });
      else
        expect(
          (await prepareArticlePublication(f.db, type, payload)).content
            .filmTagIds,
        ).toEqual(['2727', '160']);
      expect(
        (await create(type, { ...payload, filmTagIds: ['missing'] })).status,
      ).toBe(422);
    }
    expect(
      (await f.db.prepare('PRAGMA foreign_key_check').all()).results,
    ).toEqual([]);
  } finally {
    await f.dispose();
  }
}, 60_000);
