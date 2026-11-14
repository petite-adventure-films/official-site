// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { loadLocalCmsEvents } from './local-cms-events';
const file = fileURLToPath(new URL('../../fixtures/cms-events.json', import.meta.url));
test('local fixture is explicit and cannot enter a production build', async () => {
  expect(await loadLocalCmsEvents(false)).toEqual([]);
  expect(await loadLocalCmsEvents(true)).toEqual([]);
  expect(await loadLocalCmsEvents(true, file)).toHaveLength(2);
  await expect(loadLocalCmsEvents(false, file)).rejects.toThrow('local-development only');
  await expect(loadLocalCmsEvents(true, '/missing-public-snapshot.json')).rejects.toThrow();
});
