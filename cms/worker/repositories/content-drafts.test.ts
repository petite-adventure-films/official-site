import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../../src/testing/fixtures';
import { ContentDraftRepository, DraftConflict } from './content-drafts';

let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
let repository: ContentDraftRepository;
beforeEach(async () => {
  fixture = await createWorkerFixture();
  const sql = await readFile(new URL('../../migrations/0001_content_drafts.sql', import.meta.url), 'utf8');
  await fixture.db.batch(unstable_splitSqlQuery(sql).map((statement) => fixture.db.prepare(statement)));
  repository = new ContentDraftRepository(fixture.db);
});
afterEach(async () => { await fixture?.dispose(); });
const input = () => ({ actor: 'verified-user', operationId: crypto.randomUUID(), payload: { title: '', startDate: '2026/1' } });

test('preserves incomplete input, server identity and immutable creation fields', async () => {
  const initial = await repository.save(input());
  const updated = await repository.save({ ...input(), payload: { title: '更新' }, target: { id: initial.id, expectedVersion: 1 } });
  expect(initial.payload.startDate).toBe('2026/1');
  expect(updated).toMatchObject({ id: initial.id, version: 2, createdAt: initial.createdAt, createdBy: 'verified-user' });
  expect(await repository.get(initial.id)).toEqual(updated);
});
test('response loss and retry return the original response even after a newer update', async () => {
  const request = input();
  const initial = await repository.save(request);
  await repository.save({ ...input(), target: { id: initial.id, expectedVersion: 1 } });
  expect(await repository.save(request)).toEqual(initial);
  expect((await repository.get(initial.id))!.version).toBe(2);
  await expect(repository.save({ ...request, payload: { title: 'different' } })).rejects.toBeInstanceOf(DraftConflict);
});
test('concurrent identical creates produce exactly one draft', async () => {
  const request = input();
  const [a, b] = await Promise.all([repository.save(request), repository.save(request)]);
  expect(a).toEqual(b);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM content_drafts').first('count')).toBe(1);
});
test('concurrent edits have one winner and leave no losing operation record', async () => {
  const initial = await repository.save(input());
  const results = await Promise.allSettled(['A', 'B'].map((title) => repository.save({
    ...input(), payload: { title }, target: { id: initial.id, expectedVersion: 1 },
  })));
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  expect((await repository.get(initial.id))!.version).toBe(2);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations').first('count')).toBe(2);
});
test('database failure rolls back both draft and operation result', async () => {
  const initial = await repository.save(input());
  await fixture.db.exec("CREATE TRIGGER fail_update BEFORE UPDATE ON content_drafts BEGIN SELECT RAISE(ABORT, 'test_failure'); END;");
  await expect(repository.save({ ...input(), target: { id: initial.id, expectedVersion: 1 } })).rejects.toThrow();
  expect(await repository.get(initial.id)).toEqual(initial);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations').first('count')).toBe(1);
});
