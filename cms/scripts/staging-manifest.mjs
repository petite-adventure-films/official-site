import { createHash } from 'node:crypto';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Validate the fixed candidate before running the staging build. */
export function validateStagingManifest(manifest) {
  const { delivery, snapshot, blogs, articles = [], assets, redirects } = manifest;
  if (!/^[a-f0-9-]{36}$/i.test(delivery?.operationId) || !Number.isSafeInteger(delivery.attempt) ||
      delivery.attempt < 1 || !delivery.payload || hash(delivery.payload) !== delivery.hash ||
      ![blogs, articles, assets, redirects].every(Array.isArray)) throw new Error('Invalid publication manifest');
  const validPath = value => typeof value === 'string' && /^\/(?!\/)[^\s\\?#*]+\/$/.test(value);
  const path = delivery.routes?.canonicalPath;
  const validCandidate = delivery.payload.type === 'news' ? /^\/news\/#cms-[a-f0-9-]{36}$/i.test(path) : validPath(path);
  const included = delivery.payload.type === 'event'
    ? snapshot?.schemaVersion === 'cms-events/v1' && Array.isArray(snapshot.events) &&
      path === `/events/${encodeURIComponent(delivery.payload.slug)}/` &&
      snapshot.events.some(event => event.id === delivery.contentId && hash(event.payload) === delivery.hash)
    : [...blogs, ...articles].some(entry => entry.path === path);
  if (!validCandidate || !included || redirects.some(({ from, to }) => !validPath(from) || !validPath(to))) {
    throw new Error('Invalid staging site routes');
  }
}
