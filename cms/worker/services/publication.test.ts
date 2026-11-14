import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createWorkerFixture } from '../../src/testing/fixtures';
import { emptyDraft } from '../../src/features/events/draft';
import { ContentDraftRepository } from '../repositories/content-drafts';
import { PublicationService, PublicationInvalid, type Delivery, type DeliveryResult } from './publication';

let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
let drafts: ContentDraftRepository;
let service: PublicationService;
beforeEach(async () => {
  fixture = await createWorkerFixture();
  for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history']) {
    const sql = await readFile(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  drafts = new ContentDraftRepository(fixture.db);
  service = new PublicationService(fixture.db);
});
afterEach(async () => { await fixture?.dispose(); });
const payload = (title = '上映会') => ({ ...emptyDraft(), title, startDate: '2026/12/30', venue: '会場' });
const save = (title?: string) => drafts.save({ actor: 'editor', operationId: crypto.randomUUID(), payload: payload(title) });
const request = (id: string, expectedVersion = 1, expectedPublicationVersion = 0) => ({
  actor: 'editor', operationId: crypto.randomUUID(), contentId: id, expectedVersion, expectedPublicationVersion,
});
const confirmed = (d: Delivery, status: 'succeeded' | 'failed' = 'succeeded'): DeliveryResult => ({
  status, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: `local-test-${d.operationId}-${d.attempt}`,
});
const adapter = () => ({ deploy: vi.fn(async (d: Delivery) => confirmed(d)), inspect: vi.fn(async (d: Delivery) => confirmed(d)) });
async function update(id: string, title: string) {
  const current = (await drafts.get(id))!;
  return drafts.save({ actor: 'editor', operationId: crypto.randomUUID(), payload: payload(title), target: { id, expectedVersion: current.version } });
}

test('invalid candidates and stale drafts leave no operation or publication', async () => {
  const draft = await drafts.save({ actor: 'editor', operationId: crypto.randomUUID(), payload: emptyDraft() });
  await expect(service.prepare(request(draft.id))).rejects.toBeInstanceOf(PublicationInvalid);
  await expect(service.prepare(request(draft.id, 2))).rejects.toThrow();
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM publication_operations').first('count')).toBe(0);
  expect(await service.current(draft.id)).toBeNull();
});
test('fixed public payload excludes hidden data and subsequent edits; success alone records history', async () => {
  const draft = await drafts.save({ actor: 'editor', operationId: crypto.randomUUID(), payload: { ...payload(), endDate: 'hidden' } });
  const op = await service.prepare(request(draft.id));
  await update(draft.id, '次回の編集');
  expect(await service.history(draft.id)).toEqual([]);
  const delivery = adapter();
  const done = await service.deliver(op.id, delivery);
  expect(done.state).toBe('succeeded');
  expect(delivery.deploy.mock.calls[0][0].payload).toMatchObject({ title: '上映会' });
  expect(delivery.deploy.mock.calls[0][0].payload).not.toHaveProperty('endDate');
  expect(JSON.parse((await service.history(draft.id))[0].payload).title).toBe('上映会');
  expect((await drafts.get(draft.id))?.payload.title).toBe('次回の編集');
  expect(done.payload).toBeNull(); // Terminal requests do not keep a second, unbounded content history.
  expect((await service.history(draft.id))[0].published_by).toBe('editor');
});
test('concurrent identical requests and dispatches create one operation and one deployment', async () => {
  const draft = await save();
  const input = request(draft.id);
  const [a, b] = await Promise.all([service.prepare(input), service.prepare(input)]);
  expect(a.id).toBe(b.id);
  const delivery = adapter();
  await Promise.all([service.deliver(a.id, delivery), service.deliver(a.id, delivery)]);
  expect(delivery.deploy).toHaveBeenCalledTimes(1);
  expect(await service.history(draft.id)).toHaveLength(1);
  await update(draft.id, 'new');
  expect((await service.prepare(input)).state).toBe('succeeded');
  await expect(service.prepare({ ...input, expectedVersion: 2 })).rejects.toThrow('operation_id_reused');
});
test('confirmed failure preserves current publication and retry uses the same snapshot', async () => {
  const draft = await save();
  const initial = await service.prepare(request(draft.id));
  await service.deliver(initial.id, adapter());
  const current = await service.current(draft.id);
  await update(draft.id, '更新');
  const op = await service.prepare(request(draft.id, 2, 1));
  const delivery = adapter();
  delivery.deploy.mockImplementationOnce(async d => confirmed(d, 'failed'));
  expect((await service.deliver(op.id, delivery)).state).toBe('failed');
  expect(await service.current(draft.id)).toEqual(current);
  expect(await service.history(draft.id)).toHaveLength(1);
  await update(draft.id, 'さらに編集');
  await service.retry(op.id);
  expect((await service.deliver(op.id, delivery)).attempt).toBe(2);
  expect(delivery.deploy.mock.calls[1][0].payload.title).toBe('更新');
  expect(await service.history(draft.id)).toHaveLength(2);
});
test('unknown result blocks subsequent publication and reconciles without another deploy', async () => {
  const draft = await save();
  const op = await service.prepare(request(draft.id));
  const delivery = adapter();
  delivery.deploy.mockRejectedValueOnce(new Error('response lost'));
  expect((await service.deliver(op.id, delivery)).state).toBe('unknown');
  expect((await service.retry(op.id)).state).toBe('unknown');
  const other = await save('別記事');
  await expect(service.prepare(request(other.id))).rejects.toThrow();
  expect(await service.history(draft.id)).toHaveLength(0);
  expect((await service.reconcile(op.id, delivery)).state).toBe('succeeded');
  await service.reconcile(op.id, delivery);
  expect(delivery.deploy).toHaveBeenCalledTimes(1);
  expect(delivery.inspect).toHaveBeenCalledTimes(1);
  expect(await service.history(draft.id)).toHaveLength(1);
});
test('DB finalization failure rolls back everything, then inspection commits without redeploy', async () => {
  const draft = await save();
  const op = await service.prepare(request(draft.id));
  const delivery = adapter();
  await fixture.db.exec("CREATE TRIGGER fail_history BEFORE INSERT ON publication_revisions BEGIN SELECT RAISE(ABORT, 'test_failure'); END;");
  await expect(service.deliver(op.id, delivery)).rejects.toThrow();
  expect((await service.get(op.id)).state).toBe('delivering');
  expect(await service.current(draft.id)).toBeNull();
  expect(await service.history(draft.id)).toHaveLength(0);
  await fixture.db.exec('DROP TRIGGER fail_history');
  expect((await service.reconcile(op.id, delivery)).state).toBe('succeeded');
  expect(delivery.deploy).toHaveBeenCalledTimes(1);
});
test('same current content is a no-op; A → B → A adds a new history; fourth success keeps latest three', async () => {
  const draft = await save('A');
  const delivery = adapter();
  for (const [index, title] of ['A', 'B', 'A', 'C'].entries()) {
    if (index) await update(draft.id, title);
    const op = await service.prepare(request(draft.id, index + 1, index));
    await service.deliver(op.id, delivery);
    if (index === 0) {
      const same = await service.prepare(request(draft.id, 1, 1));
      expect(same.state).toBe('noop');
      await service.deliver(same.id, delivery);
      expect(delivery.deploy).toHaveBeenCalledTimes(1);
    }
  }
  const history = await service.history(draft.id);
  expect(history.map(h => [h.version, JSON.parse(h.payload).title])).toEqual([[4, 'C'], [3, 'A'], [2, 'B']]);
  expect(new Set(history.map(h => h.id)).size).toBe(3);
  expect((await service.current(draft.id))?.revision_id).toBe(history[0].id);
});
test('wrong attempt or content confirmation cannot finalize or release the active operation', async () => {
  const draft = await save();
  const op = await service.prepare(request(draft.id));
  const delivery = adapter();
  delivery.deploy.mockImplementationOnce(async d => ({ ...confirmed(d), attempt: d.attempt + 1 }));
  await expect(service.deliver(op.id, delivery)).rejects.toThrow('confirmation_mismatch');
  expect(await service.history(draft.id)).toHaveLength(0);
  expect((await service.get(op.id)).state).toBe('delivering');
  expect((await service.reconcile(op.id, delivery)).state).toBe('succeeded');
});
test('an old failed operation cannot retry over a more recent publication', async () => {
  const draft = await save();
  const old = await service.prepare(request(draft.id));
  const delivery = adapter();
  delivery.deploy.mockImplementationOnce(async d => confirmed(d, 'failed'));
  await service.deliver(old.id, delivery);
  await update(draft.id, 'new');
  const next = await service.prepare(request(draft.id, 2));
  await service.deliver(next.id, delivery);
  expect((await service.retry(old.id)).state).toBe('failed');
  await service.deliver(old.id, delivery);
  expect(delivery.deploy).toHaveBeenCalledTimes(2);
  expect(JSON.parse((await service.history(draft.id))[0].payload).title).toBe('new');
});

test('a failure while pruning the fourth revision rolls back the new pointer and history together', async () => {
  const draft = await save('1');
  const delivery = adapter();
  for (let n = 1; n <= 3; n++) {
    if (n > 1) await update(draft.id, String(n));
    await service.deliver((await service.prepare(request(draft.id, n, n - 1))).id, delivery);
  }
  const before = await service.current(draft.id);
  const history = await service.history(draft.id);
  await update(draft.id, '4');
  const op = await service.prepare(request(draft.id, 4, 3));
  await fixture.db.exec("CREATE TRIGGER fail_prune BEFORE DELETE ON publication_revisions BEGIN SELECT RAISE(ABORT, 'test_failure'); END;");
  await expect(service.deliver(op.id, delivery)).rejects.toThrow();
  expect(await service.current(draft.id)).toEqual(before);
  expect(await service.history(draft.id)).toEqual(history);
  expect((await service.get(op.id)).state).toBe('delivering');
  await fixture.db.exec('DROP TRIGGER fail_prune');
  await service.reconcile(op.id, delivery);
  expect((await service.history(draft.id)).map(h => h.version)).toEqual([4, 3, 2]);
  expect(delivery.deploy).toHaveBeenCalledTimes(4);
});
test('the DB rejects preparation if the draft changes between validation and insertion', async () => {
  const draft = await save();
  await fixture.db.prepare(`CREATE TRIGGER edit_before_prepare BEFORE INSERT ON publication_operations BEGIN
    UPDATE content_drafts SET version = version + 1 WHERE id = NEW.content_id; END;`).run();
  await expect(service.prepare(request(draft.id))).rejects.toThrow('draft_version_conflict');
  expect(await service.history(draft.id)).toEqual([]);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM publication_operations').first('count')).toBe(0);
});
test('a late result from an earlier attempt cannot finalize a retry', async () => {
  const draft = await save();
  const op = await service.prepare(request(draft.id));
  const delivery = adapter();
  let first: Delivery;
  delivery.deploy.mockImplementationOnce(async d => { first = d; return confirmed(d, 'failed'); });
  await service.deliver(op.id, delivery);
  await service.retry(op.id);
  delivery.deploy.mockRejectedValueOnce(new Error('lost'));
  await service.deliver(op.id, delivery);
  delivery.inspect.mockImplementationOnce(async () => confirmed(first));
  await expect(service.reconcile(op.id, delivery)).rejects.toThrow('confirmation_mismatch');
  expect((await service.get(op.id)).state).toBe('unknown');
  expect(await service.history(draft.id)).toEqual([]);
  await service.reconcile(op.id, delivery);
  expect(await service.history(draft.id)).toHaveLength(1);
});
