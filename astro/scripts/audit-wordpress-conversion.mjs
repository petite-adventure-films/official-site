// #490/#491: evidence for decisions; this report never approves a lossy conversion.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from './prepare-wordpress-conversion.mjs';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const htmlFields = ['content', 'article_contents', 'dates_details', 'access_details',
  'fee_details', 'host_details', 'appendix_contents'];

export function audit(bytes) {
  const report = prepare(JSON.parse(bytes), hash(bytes));
  const groups = new Map();
  for (const row of report.rows) {
    for (const issue of row.issues) {
      const key = JSON.stringify([issue.code, issue.field, issue.detail]);
      if (!groups.has(key)) groups.set(key, { ...issue, articles: new Set(), occurrences: 0 });
      const group = groups.get(key);
      group.articles.add(`${row.type}:${row.legacyId}`);
      group.occurrences++;
    }
  }
  const formats = new Map();
  for (const row of report.rows) {
    for (const field of htmlFields) {
      const html = row.source.raw[field];
      if (typeof html !== 'string') continue;
      const document = new dom.window.DOMParser().parseFromString(html, 'text/html');
      for (const el of document.querySelectorAll('*')) {
        if (['html', 'head', 'body'].includes(el.localName)) continue;
        // Values are essential: span.style alone hides distinct preservation requirements.
        const attributes = Object.fromEntries([...el.attributes]
          .map((a) => [a.name, a.value]).sort(([a], [b]) => a.localeCompare(b, 'en')));
        const key = JSON.stringify([field, el.localName, attributes]);
        if (!formats.has(key)) formats.set(key, {
          field, tag: el.localName, attributes, occurrences: 0, articles: new Set(),
          example: { type: row.type, legacyId: row.legacyId, recordHash: row.source.recordHash,
            html: el.outerHTML },
        });
        const format = formats.get(key);
        format.occurrences++;
        format.articles.add(`${row.type}:${row.legacyId}`);
      }
    }
  }
  const serialize = (map) => [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([, value]) => ({ ...value, articles: [...value.articles].sort() }));
  return {
    schemaVersion: 'wordpress-conversion-audit/v1', sourceHash: report.sourceHash,
    source: report.source, summary: report.summary,
    limitations: [...report.limitations, 'format inventory is evidence, not approval or an import manifest'],
    blockers: serialize(groups), formats: serialize(formats),
    events: report.rows.filter((r) => r.type === 'event').map((r) => ({
      legacyId: r.legacyId, recordHash: r.source.recordHash, status: r.source.raw.status,
      formatDecision: 'retain-unknown-approved', issues: r.issues,
    })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || process.argv.length !== 4) throw Error('usage: <snapshot.json> <new-report.json>');
  const result = audit(await readFile(input));
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ ...result.summary, formatGroups: result.formats.length }, null, 2));
}
