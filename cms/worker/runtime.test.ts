import { expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';

test('Worker refuses unauthenticated requests and tests use isolated D1', async () => {
  const fixture = await createWorkerFixture();
  try {
    const response = await fixture.runtime.dispatchFetch('http://localhost/api/session');
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await fixture.db.exec('CREATE TABLE probe (value TEXT);');
    await fixture.db.prepare('INSERT INTO probe VALUES (?)').bind('テスト').run();
    expect(await fixture.db.prepare('SELECT value FROM probe').first('value')).toBe('テスト');
  } finally {
    await fixture.dispose();
  }
});
