import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createWorkerFixture } from '../../src/testing/fixtures';
import { emptyDraft } from '../../src/features/events/draft';
import { ContentDraftRepository } from '../repositories/content-drafts';
import { PublicationService, type Delivery, type DeliveryResult } from './publication';
import { PublicationUrls, PublicationUrlConflict } from './publication-urls';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
let drafts: ContentDraftRepository;
let service: PublicationService;
let urls: PublicationUrls;
beforeEach(async () => {
  fixture = await createWorkerFixture();
  for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore', '0006_history_names', '0007_publication_urls']) {
    const sql = await readFile(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  drafts = new ContentDraftRepository(fixture.db); service = new PublicationService(fixture.db); urls = new PublicationUrls(fixture.db);
});
afterEach(async () => { await fixture?.dispose(); });
async function save(slug: string, id?: string) {
  const current = id ? (await drafts.get(id))! : null;
  return drafts.save({ actor: 'editor', operationId: crypto.randomUUID(), payload: { ...emptyDraft(), title: '上映会', startDate: '2026-12-30', venue: '会場', slug },
    ...(current ? { target: { id: current.id, expectedVersion: current.version } } : {}) });
}
async function prepare(id: string) {
  return service.prepare({ actor: 'editor', operationId: crypto.randomUUID(), contentId: id,
    expectedVersion: (await drafts.get(id))!.version, expectedPublicationVersion: (await service.current(id))?.version ?? 0 });
}
const result = (d: Delivery, status: 'succeeded' | 'failed' = 'succeeded'): DeliveryResult => ({ status,
  operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: 'test-only' });
const adapter = () => ({ deploy: vi.fn(async (d: Delivery) => result(d)), inspect: vi.fn(async (d: Delivery) => result(d)) });
async function publish(slug: string, id?: string) {
  const draft = await save(slug, id); const op = await prepare(draft.id);
  await service.deliver(op.id, adapter()); return draft.id;
}

test('reserves every known legacy event path and leaves legacy article bodies outside the CMS', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../../astro/data/wordpress-export.json', import.meta.url), 'utf8'));
  const rows = await fixture.db.prepare("SELECT slug FROM event_url_owners WHERE origin = 'legacy'").all<{ slug: string }>();
  expect(rows.results.map((row: { slug: string }) => row.slug).sort()).toEqual(snapshot.content.events.map((event: { id: number }) => String(event.id)).sort());
  const draft = await save('18010');
  await expect(prepare(draft.id)).rejects.toBeInstanceOf(PublicationUrlConflict);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM publication_operations').first('count')).toBe(0);
  expect(await urls.resolve('18010')).toBeNull(); // Still served by the legacy site, not a CMS redirect.
  await expect(urls.plan(draft.id, 'archive')).rejects.toThrow();
});
test('draft changes and preparation do not change the current URL; confirmation commits the route plan', async () => {
  const id = await publish('A');
  await save('B', id); const op = await prepare(id);
  expect(await urls.resolve('A')).toMatchObject({ kind: 'page', path: '/events/A/' });
  expect(await urls.resolve('B')).toBeNull();
  await save('not-published', id);
  const delivery = adapter(); await service.deliver(op.id, delivery);
  expect(delivery.deploy.mock.calls[0][0].routes).toEqual({ canonicalPath: '/events/B/', redirects: [{ from: '/events/A/', to: '/events/B/' }] });
  expect(await urls.resolve('A')).toMatchObject({ kind: 'redirect', path: '/events/B/' });
  expect(await urls.resolve('B')).toMatchObject({ kind: 'page' });
  expect(await urls.resolve('not-published')).toBeNull();
});
test('A → B → C → A has no chains or loops and retains ownership beyond three histories', async () => {
  const id = await publish('A');
  await publish('B', id); await publish('C', id); await publish('D', id);
  expect(await service.history(id)).toHaveLength(3);
  expect(await urls.resolve('A')).toMatchObject({ kind: 'redirect', path: '/events/D/' });
  await save('A', id); const op = await prepare(id);
  const delivery = adapter(); await service.deliver(op.id, delivery);
  expect(delivery.deploy.mock.calls[0][0].routes).toEqual({ canonicalPath: '/events/A/', redirects: [
    { from: '/events/B/', to: '/events/A/' }, { from: '/events/C/', to: '/events/A/' }, { from: '/events/D/', to: '/events/A/' },
  ] });
  expect(await urls.resolve('A')).toMatchObject({ kind: 'page' });
  for (const slug of ['B', 'C', 'D']) expect(await urls.resolve(slug)).toMatchObject({ kind: 'redirect', path: '/events/A/' });
  const other = await save('B');
  await expect(prepare(other.id)).rejects.toBeInstanceOf(PublicationUrlConflict);
});
test('a definite failure does not claim a new URL; a later owner blocks retry of the failed operation', async () => {
  const id = await publish('original'); await save('shared', id); const op = await prepare(id);
  const delivery = adapter(); delivery.deploy.mockImplementationOnce(async d => result(d, 'failed'));
  await service.deliver(op.id, delivery);
  expect(await urls.resolve('original')).toMatchObject({ kind: 'page' }); expect(await urls.resolve('shared')).toBeNull();
  const other = await publish('shared');
  await expect(service.retry(op.id)).rejects.toThrow('url_reserved');
  expect((await service.get(op.id)).state).toBe('failed');
  expect(await urls.resolve('shared')).toMatchObject({ kind: 'page', contentId: other });
});
test('unknown delivery holds the publication slot and uses the same routes on reconciliation', async () => {
  const id = await publish('before'); await save('after', id); const op = await prepare(id);
  const delivery = adapter(); delivery.deploy.mockRejectedValueOnce(new Error('lost'));
  await service.deliver(op.id, delivery);
  const other = await save('after'); await expect(prepare(other.id)).rejects.toThrow();
  expect(await urls.resolve('before')).toMatchObject({ kind: 'page' });
  await service.reconcile(op.id, delivery);
  expect(delivery.inspect.mock.calls[0][0].routes).toEqual(delivery.deploy.mock.calls[0][0].routes);
  expect(await urls.resolve('before')).toMatchObject({ kind: 'redirect', path: '/events/after/' });
});
test('URL commit failure rolls back publication and history, then reconciliation commits only once', async () => {
  const id = await publish('before'); const history = await service.history(id); const current = await service.current(id);
  await save('after', id); const op = await prepare(id); const delivery = adapter();
  await fixture.db.exec("CREATE TRIGGER fail_url BEFORE UPDATE ON event_canonical_urls BEGIN SELECT RAISE(ABORT, 'test_failure'); END;");
  await expect(service.deliver(op.id, delivery)).rejects.toThrow();
  expect(await service.history(id)).toEqual(history); expect(await service.current(id)).toEqual(current);
  expect(await urls.resolve('after')).toBeNull(); expect((await service.get(op.id)).state).toBe('delivering');
  await fixture.db.exec('DROP TRIGGER fail_url'); await service.reconcile(op.id, delivery);
  expect(await service.history(id)).toHaveLength(2); expect(delivery.deploy).toHaveBeenCalledTimes(1);
  expect(await urls.resolve('before')).toMatchObject({ kind: 'redirect', path: '/events/after/' });
});
test('DB insertion rejects a URL reserved after the service read and concurrent owners have one winner', async () => {
  const first = await save('race'); const second = await save('race');
  const results = await Promise.allSettled([prepare(first.id), prepare(second.id)]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  const winner = results.find(r => r.status === 'fulfilled')!;
  if (winner.status === 'fulfilled') await service.deliver(winner.value.id, adapter());
  await fixture.db.prepare(`CREATE TRIGGER reserve_during_prepare BEFORE INSERT ON publication_operations BEGIN
    INSERT INTO event_url_owners(slug, content_id, origin) VALUES (NEW.target_slug, NULL, 'legacy'); END;`).run();
  const late = await save('late'); await expect(prepare(late.id)).rejects.toThrow('url_reserved');
});
test('Unicode paths are encoded once and exact case is preserved without silently renaming inputs', async () => {
  const id = await publish('上映会');
  await save('Another', id); const op = await prepare(id); const delivery = adapter(); await service.deliver(op.id, delivery);
  expect(delivery.deploy.mock.calls[0][0].routes.redirects).toEqual([{ from: '/events/%E4%B8%8A%E6%98%A0%E4%BC%9A/', to: '/events/Another/' }]);
  expect(await urls.resolve('another')).toBeNull();
  const same = await prepare(id); expect(same.state).toBe('noop');
  expect(await service.history(id)).toHaveLength(2);
});
test('migration preserves retained URLs and refuses dispatch of old operations without a frozen route plan', async () => {
  const old = await createWorkerFixture();
  try {
    for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore', '0006_history_names']) {
      const sql = await readFile(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8');
      await old.db.batch(unstable_splitSqlQuery(sql).map(s => old.db.prepare(s)));
    }
    const seed = await readFile(new URL('../../e2e/history-fixtures.sql', import.meta.url), 'utf8');
    await old.db.batch(unstable_splitSqlQuery(seed).map(s => old.db.prepare(s)));
    const id = '00000000-0000-4000-8000-000000000001';
    await old.db.prepare("UPDATE publication_revisions SET payload = json_set(payload, '$.slug', 'previous') WHERE content_id = ? AND version = 1").bind(id).run();
    await old.db.prepare(`INSERT INTO publication_operations
      (id, actor_id, operation_id, fingerprint, content_id, draft_version, expected_publication_version, payload, draft_snapshot, content_hash, state, created_at)
      SELECT 'old-pending', 'editor', 'old-operation', 'old', content_id, 1, 3, payload, '{}', 'hash', 'ready', '2026-11-14'
      FROM publication_revisions WHERE content_id = ? AND version = 3`).bind(id).run();
    const migration = await readFile(new URL('../../migrations/0007_publication_urls.sql', import.meta.url), 'utf8');
    await old.db.batch(unstable_splitSqlQuery(migration).map(s => old.db.prepare(s)));
    const migrated = new PublicationUrls(old.db);
    expect(await migrated.resolve('previous')).toMatchObject({ kind: 'redirect', path: `/events/${id}/` });
    expect(await migrated.resolve(id)).toMatchObject({ kind: 'page' });
    const delivery = adapter();
    await expect(new PublicationService(old.db).deliver('old-pending', delivery)).rejects.toThrow('missing_publication_routes');
    expect(delivery.deploy).not.toHaveBeenCalled();
  } finally { await old.dispose(); }
});
