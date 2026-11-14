import { dev } from 'astro';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

process.env.CMS_EVENT_SNAPSHOT = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../fixtures/cms-events.json', import.meta.url));

// Own this server directly so test teardown never stops the regular dev server.
const server = await dev({
  server: { host: '127.0.0.1', port: 4326 },
  vite: { server: { strictPort: true } },
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
