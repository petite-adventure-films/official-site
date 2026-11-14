import { mkdir, open, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// This endpoint exists only in the loopback-only local Worker, never in production.
const response = await fetch('http://127.0.0.1:8787/api/local/published-events', {
  redirect: 'error',
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok)
  throw new Error(
    `公開データの取得に失敗しました (${response.status})。CMSのローカルサーバーを確認してください。`,
  );
const snapshot = await response.json();
if (
  snapshot.schemaVersion !== 'cms-events/v1' ||
  !Array.isArray(snapshot.events) ||
  !Array.isArray(snapshot.filmTags) ||
  !Array.isArray(snapshot.eventTags)
)
  throw new Error('公開データの形式を確認してください。');
const destination = fileURLToPath(
  new URL('../../.local/cms-published-events.json', import.meta.url),
);
await mkdir(dirname(destination), { recursive: true });
const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
try {
  const file = await open(temporary, 'wx', 0o600);
  try {
    await file.writeFile(JSON.stringify(snapshot, null, 2) + '\n');
  } finally {
    await file.close();
  }
  await rename(temporary, destination);
} finally {
  await rm(temporary, { force: true });
}
console.log(`公開確定データ ${snapshot.events.length}件を書き出しました。`);
console.log('表示: pnpm --dir astro dev:cms ../.local/cms-published-events.json');
