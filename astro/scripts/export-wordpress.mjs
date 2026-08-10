import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const defaultOutputPath = path.join(projectDirectory, 'data', 'wordpress-export.json');
const defaultBaseUrl = 'https://www.petiteadventurefilms.com/wp/wp-json/wp/v2';

function readOption(name, fallback) {
  const optionIndex = process.argv.indexOf(name);
  if (optionIndex === -1) return fallback;
  const value = process.argv[optionIndex + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

const baseUrl = readOption('--base-url', process.env.WP_API_BASE_URL || defaultBaseUrl).replace(
  /\/$/,
  '',
);
const outputPath = path.resolve(readOption('--output', defaultOutputPath));
const concurrency = Number(readOption('--concurrency', '8'));
const firstEventYear = Number(readOption('--first-event-year', '2011'));

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 20) {
  throw new Error('--concurrency must be an integer between 1 and 20');
}
if (!Number.isInteger(firstEventYear) || firstEventYear < 1970) {
  throw new Error('--first-event-year must be an integer greater than or equal to 1970');
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(endpoint, query = {}) {
  const url = new URL(`${baseUrl}/${endpoint}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (response.ok) return { data: await response.json(), headers: response.headers };
      lastError = new Error(`${response.status} ${response.statusText}: ${url}`);
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }

    if (attempt < 4) await sleep(500 * 2 ** (attempt - 1));
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

async function fetchCustomCollection(endpoint, query = {}) {
  const first = await fetchJson(endpoint, { ...query, per_page: 100, page: 1 });
  const firstBody = first.data;
  if (!firstBody || !Array.isArray(firstBody.data)) {
    throw new Error(`${endpoint} did not return a custom collection response`);
  }

  const totalPages = Number(firstBody.total_pages || 1);
  const pages = [firstBody.data];
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchJson(endpoint, { ...query, per_page: 100, page });
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error(`${endpoint} page ${page} did not return a custom collection response`);
    }
    pages.push(response.data.data);
  }
  return pages.flat();
}

async function fetchNativeCollection(endpoint, query = {}) {
  const first = await fetchJson(endpoint, { ...query, per_page: 100, page: 1 });
  if (!Array.isArray(first.data)) {
    throw new Error(`${endpoint} did not return a native WordPress collection response`);
  }

  const totalPages = Number(first.headers.get('x-wp-totalpages') || 1);
  const pages = [first.data];
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchJson(endpoint, { ...query, per_page: 100, page });
    if (!Array.isArray(response.data)) {
      throw new Error(`${endpoint} page ${page} did not return an array`);
    }
    pages.push(response.data);
  }
  return pages.flat();
}

async function mapConcurrent(items, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
      completed += 1;
      if (completed % 25 === 0 || completed === items.length) {
        process.stdout.write(`  ${completed}/${items.length}\n`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function fetchDetail(endpoint, query) {
  const response = await fetchJson(endpoint, query);
  if (!response.data || !response.data.data || typeof response.data.data !== 'object') {
    throw new Error(`${endpoint} did not return a detail response`);
  }
  return response.data.data;
}

function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function collectTerms(items, property) {
  const terms = items.flatMap((item) => (Array.isArray(item[property]) ? item[property] : []));
  return [
    ...new Map(terms.map((term) => [term.term_id ?? term.id ?? term.name, term])).values(),
  ].sort((left, right) => String(left.name).localeCompare(String(right.name), 'ja'));
}

async function exportWordPress() {
  const startedAt = Date.now();
  process.stdout.write(`Exporting WordPress content from ${baseUrl}\n`);

  process.stdout.write('Fetching collection indexes...\n');
  const [blogSummaries, news, mediaSummaries, channelSummaries, nativePosts, blogTags] =
    await Promise.all([
      fetchCustomCollection('blog'),
      fetchCustomCollection('news'),
      fetchCustomCollection('media'),
      fetchCustomCollection('channel'),
      fetchNativeCollection('posts', { _fields: 'id,tags' }),
      fetchNativeCollection('tags', { _fields: 'id,name,slug,count' }),
    ]);

  const currentYear = new Date().getFullYear();
  const eventYears = Array.from(
    { length: currentYear - firstEventYear + 1 },
    (_, index) => firstEventYear + index,
  );
  const eventArchives = await Promise.all(
    eventYears.map(async (year) => {
      const response = await fetchJson('events_archive', { year });
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error(`events_archive ${year} did not return a collection response`);
      }
      return response.data.data;
    }),
  );
  const currentEventsResponse = await fetchJson('events');
  const currentEvents = currentEventsResponse.data?.data;
  if (!currentEvents || typeof currentEvents !== 'object') {
    throw new Error('events did not return a grouped event response');
  }
  const currentEventSummaries = Object.values(currentEvents).flatMap((months) =>
    Object.values(months).flat(),
  );
  const eventSummaries = uniqueById([...currentEventSummaries, ...eventArchives.flat()]);

  const nativePostTags = new Map(nativePosts.map((post) => [post.id, post.tags]));

  process.stdout.write(`Fetching ${blogSummaries.length} blog details...\n`);
  const blogs = await mapConcurrent(blogSummaries, async (summary) => ({
    ...summary,
    ...(await fetchDetail('blog_detail', { pageName: summary.name })),
    name: summary.name,
    thumbnail: summary.thumbnail,
    tag_ids: nativePostTags.get(summary.id) || [],
  }));

  process.stdout.write(`Fetching ${eventSummaries.length} event details...\n`);
  const events = await mapConcurrent(eventSummaries, async (summary) => ({
    ...summary,
    ...(await fetchDetail('events_detail', { pageId: summary.id })),
    date_from: summary.date_from,
    date_to: summary.date_to,
  }));

  process.stdout.write(`Fetching ${mediaSummaries.length} media details...\n`);
  const media = await mapConcurrent(mediaSummaries, async (summary) => ({
    ...summary,
    ...(await fetchDetail('media_detail', { pageId: summary.id })),
  }));

  process.stdout.write(`Fetching ${channelSummaries.length} channel details...\n`);
  const channels = await mapConcurrent(channelSummaries, async (summary) => ({
    ...summary,
    ...(await fetchDetail('channel_detail', { pageId: summary.id })),
  }));

  const termSources = [...blogs, ...events, ...media, ...channels];
  const snapshot = {
    schemaVersion: 1,
    source: {
      type: 'wordpress-rest-api',
      baseUrl,
      exportedAt: new Date().toISOString(),
    },
    counts: {
      blogs: blogs.length,
      news: news.length,
      events: events.length,
      media: media.length,
      channels: channels.length,
      blogTags: blogTags.length,
    },
    content: {
      blogs,
      news,
      events,
      media,
      channels,
    },
    taxonomies: {
      blogTags,
      categories: collectTerms(blogs, 'categories'),
      filmTags: collectTerms(termSources, 'film_tags'),
      eventTags: collectTerms(termSources, 'event_tags'),
    },
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  process.stdout.write(`Exported ${Object.values(snapshot.counts).join(', ')} records/counts\n`);
  process.stdout.write(`Wrote ${outputPath}\n`);
  process.stdout.write(`Completed in ${durationSeconds}s\n`);
}

await exportWordPress();
