import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../../src/testing/fixtures';
import { emptyDraft } from '../../src/features/events/draft';
import { ContentDraftRepository, DraftConflict, DraftNotFound } from '../repositories/content-drafts';
import { PublicationService, type Delivery } from './publication';
import { RestoreService, RestoreInvalid } from './restore';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
let drafts: ContentDraftRepository;
let publication: PublicationService;
let restore: RestoreService;
beforeEach(async () => {
  fixture = await createWorkerFixture();
  for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore']) {
    const sql = await readFile(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  drafts = new ContentDraftRepository(fixture.db);
  publication = new PublicationService(fixture.db);
  restore = new RestoreService(fixture.db);
});
afterEach(async () => { await fixture?.dispose(); });
const payload = (title: string) => ({ ...emptyDraft(), title, startDate: '2026/12/30', venue: '会場', endDate: 'hidden' });
const save = (title: string) => drafts.save({ actor: 'author', operationId: crypto.randomUUID(), payload: payload(title) });
async function edit(id: string, title: string) {
  const current = (await drafts.get(id))!;
  return drafts.save({ actor: 'author', operationId: crypto.randomUUID(), payload: payload(title), target: { id, expectedVersion: current.version } });
}
async function publish(id: string) {
  const current = (await drafts.get(id))!;
  const op = await publication.prepare({ actor: 'publisher', operationId: crypto.randomUUID(), contentId: id,
    expectedVersion: current.version, expectedPublicationVersion: (await publication.current(id))?.version ?? 0 });
  const confirm = async (d: Delivery) => ({ status: 'succeeded' as const, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: 'test' });
  await publication.deliver(op.id, { deploy: confirm, inspect: confirm });
  return (await publication.history(id))[0].id;
}
const request = (contentId: string, sourceId: string, expectedVersion: number, sourceKind: 'publication' | 'protectedDraft' = 'publication') => ({
  actor: 'restorer', operationId: crypto.randomUUID(), contentId, sourceId, expectedVersion, sourceKind,
});

test('restores published fields to draft, protects all previous input and leaves publication untouched', async () => {
  const draft = await save('公開内容');
  const sourceId = await publish(draft.id);
  const before = await edit(draft.id, '途中の編集');
  const publicState = await publication.current(draft.id);
  const publicHistory = await publication.history(draft.id);
  const restored = await restore.restore(request(draft.id, sourceId, 2));
  expect(restored).toMatchObject({ version: 3, createdBy: 'author', updatedBy: 'restorer', createdAt: draft.createdAt,
    payload: { title: '公開内容', endDate: '', multiDay: false, startDate: '2026-12-30' } });
  const history = await restore.history(draft.id);
  expect(history.map(h => h.kind)).toEqual(['protectedDraft', 'publication']);
  expect(history[0].payload).toEqual(before.payload);
  expect(await publication.current(draft.id)).toEqual(publicState);
  expect(await publication.history(draft.id)).toEqual(publicHistory);
});
test('protected draft restoration swaps the slot and repeated restore can return again', async () => {
  const draft = await save('A');
  const source = await publish(draft.id);
  const edited = await edit(draft.id, 'B');
  const a = await restore.restore(request(draft.id, source, 2));
  const protectedB = (await restore.history(draft.id))[0];
  const b = await restore.restore(request(draft.id, protectedB.id, 3, 'protectedDraft'));
  expect(b.payload).toEqual(edited.payload);
  const protectedA = (await restore.history(draft.id))[0];
  expect(protectedA.id).not.toBe(protectedB.id);
  expect(protectedA.payload).toEqual(a.payload);
  expect((await restore.restore(request(draft.id, protectedA.id, 4, 'protectedDraft'))).payload).toEqual(a.payload);
  expect(await restore.history(draft.id)).toHaveLength(2);
});
test('concurrent replay and retry after newer edits return the original response without swapping again', async () => {
  const draft = await save('A');
  const source = await publish(draft.id);
  await edit(draft.id, 'B');
  const input = request(draft.id, source, 2);
  const [a, b] = await Promise.all([restore.restore(input), restore.restore(input)]);
  expect(a).toEqual(b);
  const protectedBefore = (await restore.history(draft.id))[0];
  await edit(draft.id, 'C');
  expect(await restore.restore(input)).toEqual(a);
  expect((await drafts.get(draft.id))?.payload.title).toBe('C');
  expect((await restore.history(draft.id))[0]).toEqual(protectedBefore);
  await expect(restore.restore({ ...input, expectedVersion: 4 })).rejects.toBeInstanceOf(DraftConflict);
});
test('concurrent different restores have one winner; stale edits cannot overwrite the restored draft', async () => {
  const draft = await save('A');
  const source = await publish(draft.id);
  const results = await Promise.allSettled([restore.restore(request(draft.id, source, 1)), restore.restore(request(draft.id, source, 1))]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
  await expect(drafts.save({ actor: 'author', operationId: crypto.randomUUID(), payload: payload('old edit'),
    target: { id: draft.id, expectedVersion: 1 } })).rejects.toBeInstanceOf(DraftConflict);
});
test('failure updating draft rolls back protection replacement and both operation records', async () => {
  const draft = await save('A');
  const source = await publish(draft.id);
  await restore.restore(request(draft.id, source, 1));
  const history = await restore.history(draft.id);
  const before = await drafts.get(draft.id);
  const input = request(draft.id, history[0].id, 2, 'protectedDraft');
  await fixture.db.exec("CREATE TRIGGER fail_restore BEFORE UPDATE ON content_drafts BEGIN SELECT RAISE(ABORT, 'test_failure'); END;");
  await expect(restore.restore(input)).rejects.toThrow();
  expect(await restore.history(draft.id)).toEqual(history);
  expect(await drafts.get(draft.id)).toEqual(before);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM restore_operations WHERE operation_id = ?').bind(input.operationId).first('count')).toBe(0);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations WHERE operation_id = ?').bind(input.operationId).first('count')).toBe(0);
  await fixture.db.exec('DROP TRIGGER fail_restore');
  expect((await restore.restore(input)).version).toBe(3);
});
test('another article, removed history and obsolete protection IDs cannot be restored', async () => {
  const a = await save('A');
  const b = await save('B');
  const source = await publish(a.id);
  await expect(restore.restore(request(b.id, source, 1))).rejects.toBeInstanceOf(DraftNotFound);
  await restore.restore(request(a.id, source, 1));
  const old = (await restore.history(a.id))[0].id;
  await restore.restore(request(a.id, source, 2));
  await expect(restore.restore(request(a.id, old, 3, 'protectedDraft'))).rejects.toBeInstanceOf(DraftNotFound);
  for (const title of ['C', 'D', 'E']) { await edit(a.id, title); await publish(a.id); }
  await expect(restore.restore(request(a.id, source, 6))).rejects.toBeInstanceOf(DraftNotFound);
  expect((await restore.history(a.id)).map(h => h.kind)).toEqual(['protectedDraft', 'publication', 'publication', 'publication']);
});
test('unsupported history schema or corrupt payload leaves draft and protection unchanged', async () => {
  const draft = await save('A');
  const source = await publish(draft.id);
  const before = await drafts.get(draft.id);
  await fixture.db.prepare("UPDATE publication_revisions SET payload = json_set(payload, '$.payloadSchemaVersion', 'event-publication/v2') WHERE id = ?").bind(source).run();
  await expect(restore.restore(request(draft.id, source, 1))).rejects.toBeInstanceOf(RestoreInvalid);
  expect(await drafts.get(draft.id)).toEqual(before);
  expect((await restore.history(draft.id)).some(h => h.kind === 'protectedDraft')).toBe(false);
});
test('DB source check rejects a revision removed between reading and committing', async () => {
  const draft = await save('A');
  const source = await publish(draft.id);
  await edit(draft.id, 'B'); await publish(draft.id);
  await fixture.db.prepare(`CREATE TRIGGER prune_source BEFORE INSERT ON restore_operations BEGIN
    DELETE FROM publication_revisions WHERE id = NEW.source_id; END;`).run();
  await expect(restore.restore(request(draft.id, source, 2))).rejects.toThrow();
  expect((await drafts.get(draft.id))?.version).toBe(2);
  expect((await restore.history(draft.id)).some(h => h.kind === 'protectedDraft')).toBe(false);
});
