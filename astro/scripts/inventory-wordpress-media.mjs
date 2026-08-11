import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');

const DEFAULT_INPUT = path.join(projectDirectory, 'data', 'wordpress-export.json');
const DEFAULT_OUTPUT = path.join(projectDirectory, 'data', 'wordpress-media-inventory.json');
const DEFAULT_REPORT = path.join(projectDirectory, 'data', 'wordpress-media-inventory-summary.md');
const DEFAULT_UPLOADS_PATH = '/wp/wp-content/uploads/';

const COLLECTION_TYPES = {
  blogs: 'blog',
  news: 'news',
  events: 'event',
  media: 'media',
  channels: 'channel',
};

function readOption(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

function normalizeUploadsPath(value) {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function decodeHtmlUrl(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&#038;', '&').replaceAll('&#38;', '&');
}

export function extractUrls(value) {
  const matches = value.match(/https?:\/\/[^\s"'<>\\]+/giu) ?? [];
  return matches.map((match) => decodeHtmlUrl(match).replace(/[.,;]+$/u, ''));
}

export function normalizeMediaUrl(value, uploadsPath = DEFAULT_UPLOADS_PATH) {
  const parsed = new URL(value);
  const normalizedPath = normalizeUploadsPath(uploadsPath);
  const uploadIndex = parsed.pathname.indexOf(normalizedPath);
  if (uploadIndex === -1) return null;

  parsed.hash = '';
  parsed.search = '';
  const relativePath = parsed.pathname.slice(uploadIndex + normalizedPath.length);
  if (!relativePath) return null;

  const extensionMatch = relativePath.match(/\.([a-zA-Z0-9]+)$/u);
  return {
    sourceUrl: parsed.href,
    host: parsed.host,
    pathname: parsed.pathname,
    relativePath,
    storageKey: `wordpress/${relativePath}`,
    extension: extensionMatch?.[1].toLowerCase() ?? null,
  };
}

function walkStrings(value, visit, fieldPath = []) {
  if (typeof value === 'string') {
    visit(value, fieldPath);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, [...fieldPath, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    walkStrings(child, visit, [...fieldPath, key]);
  }
}

function referenceKey(reference) {
  return `${reference.type}\0${reference.legacyId ?? ''}\0${reference.slug ?? ''}`;
}

function addReference(entry, reference, fieldPath) {
  const key = referenceKey(reference);
  let stored = entry.referenceMap.get(key);
  if (!stored) {
    stored = { ...reference, fields: new Set() };
    entry.referenceMap.set(key, stored);
  }
  stored.fields.add(fieldPath || '(root)');
}

function summarizeInventory(entries, invalidCandidates) {
  const byExtension = {};
  const byHost = {};
  const byContentType = {};
  let totalReferences = 0;

  for (const entry of entries) {
    const extension = entry.extension ?? '(none)';
    byExtension[extension] = (byExtension[extension] ?? 0) + 1;
    byHost[entry.host] = (byHost[entry.host] ?? 0) + 1;
    totalReferences += entry.occurrenceCount;
    for (const reference of entry.references) {
      byContentType[reference.type] = (byContentType[reference.type] ?? 0) + 1;
    }
  }

  return {
    uniqueMedia: entries.length,
    sourceUrlVariants: entries.reduce((sum, entry) => sum + entry.sourceUrls.length, 0),
    totalReferences,
    invalidCandidates: invalidCandidates.length,
    byExtension: Object.fromEntries(Object.entries(byExtension).sort()),
    byHost: Object.fromEntries(Object.entries(byHost).sort()),
    mediaReferencedByContentType: Object.fromEntries(Object.entries(byContentType).sort()),
  };
}

export function summarizeRemoteChecks(entries) {
  const checkedEntries = entries.filter((entry) => entry.remoteCheck);
  const availableEntries = checkedEntries.filter((entry) => entry.remoteCheck.ok);
  const missingEntries = checkedEntries.filter((entry) =>
    [404, 410].includes(entry.remoteCheck.httpStatus),
  );
  const errors = checkedEntries.length - availableEntries.length - missingEntries.length;
  const sizedEntries = availableEntries.filter((entry) =>
    Number.isFinite(entry.remoteCheck.contentLength),
  );
  const knownBytes = sizedEntries.reduce((sum, entry) => sum + entry.remoteCheck.contentLength, 0);
  const averageBytes = sizedEntries.length > 0 ? knownBytes / sizedEntries.length : null;
  const unchecked = entries.length - checkedEntries.length;
  const recoverableMissing = missingEntries.filter(
    (entry) => entry.recoveryCandidate?.remoteCheck?.ok,
  ).length;
  const byExtension = {};

  for (const entry of checkedEntries) {
    const extension = entry.extension ?? '(none)';
    const group = (byExtension[extension] ??= {
      checked: 0,
      available: 0,
      missing: 0,
      knownBytes: 0,
    });
    group.checked += 1;
    if (entry.remoteCheck.ok) group.available += 1;
    if ([404, 410].includes(entry.remoteCheck.httpStatus)) group.missing += 1;
    if (Number.isFinite(entry.remoteCheck.contentLength)) {
      group.knownBytes += entry.remoteCheck.contentLength;
    }
  }

  return {
    checked: checkedEntries.length,
    unchecked,
    available: availableEntries.length,
    missing: missingEntries.length,
    recoverableMissing,
    unrecoverableMissing: missingEntries.length - recoverableMissing,
    errors,
    withContentLength: sizedEntries.length,
    knownBytes,
    estimatedBytes:
      averageBytes === null ? null : Math.round(knownBytes + averageBytes * unchecked),
    byExtension: Object.fromEntries(Object.entries(byExtension).sort()),
  };
}

export function preserveRemoteResults(entries, previousEntries = []) {
  const previousResults = new Map();
  for (const entry of previousEntries) {
    const key = entry.storageKey ?? entry.sourceUrl;
    const stored = previousResults.get(key);
    if (!stored || (!stored.remoteCheck?.ok && entry.remoteCheck?.ok)) {
      previousResults.set(key, {
        remoteCheck: entry.remoteCheck ?? null,
        recoveryCandidate: entry.recoveryCandidate,
      });
    }
  }

  for (const entry of entries) {
    const previous = previousResults.get(entry.storageKey ?? entry.sourceUrl);
    entry.remoteCheck = previous?.remoteCheck ?? null;
    if (previous?.recoveryCandidate !== undefined) {
      entry.recoveryCandidate = previous.recoveryCandidate;
    }
  }
}

export function buildInventory(snapshot, options = {}) {
  const uploadsPath = normalizeUploadsPath(options.uploadsPath ?? DEFAULT_UPLOADS_PATH);
  const entryMap = new Map();
  const invalidCandidates = [];

  for (const [collectionName, records] of Object.entries(snapshot.content ?? {})) {
    if (!Array.isArray(records)) continue;
    const type = COLLECTION_TYPES[collectionName] ?? collectionName;

    for (const record of records) {
      const reference = {
        type,
        legacyId: typeof record.id === 'number' ? record.id : null,
        slug: typeof record.name === 'string' ? record.name : null,
        title: typeof record.title === 'string' ? record.title : null,
      };

      walkStrings(record, (text, fieldPath) => {
        if (!text.includes(uploadsPath)) return;
        const urls = extractUrls(text);
        let matchedInText = false;

        for (const rawUrl of urls) {
          try {
            const media = normalizeMediaUrl(rawUrl, uploadsPath);
            if (!media) continue;
            matchedInText = true;
            let entry = entryMap.get(media.storageKey);
            if (!entry) {
              entry = {
                ...media,
                sourceUrls: new Set(),
                occurrenceCount: 0,
                referenceMap: new Map(),
                remoteCheck: null,
              };
              entryMap.set(media.storageKey, entry);
            }
            entry.sourceUrls.add(media.sourceUrl);
            entry.occurrenceCount += 1;
            addReference(entry, reference, fieldPath.join('.'));
          } catch (error) {
            invalidCandidates.push({
              value: rawUrl,
              type,
              legacyId: reference.legacyId,
              field: fieldPath.join('.'),
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        if (!matchedInText && urls.length === 0) {
          invalidCandidates.push({
            value: text.slice(0, 500),
            type,
            legacyId: reference.legacyId,
            field: fieldPath.join('.'),
            error: 'Upload path found but no absolute URL could be parsed',
          });
        }
      });
    }
  }

  const entries = [...entryMap.values()]
    .map(({ referenceMap, sourceUrls, ...entry }) => ({
      ...entry,
      sourceUrls: [...sourceUrls].sort(),
      references: [...referenceMap.values()]
        .map(({ fields, ...reference }) => ({ ...reference, fields: [...fields].sort() }))
        .sort((left, right) =>
          `${left.type}:${left.legacyId ?? ''}`.localeCompare(
            `${right.type}:${right.legacyId ?? ''}`,
          ),
        ),
    }))
    .sort((left, right) => left.storageKey.localeCompare(right.storageKey));

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      snapshotSchemaVersion: snapshot.schemaVersion ?? null,
      snapshotExportedAt: snapshot.source?.exportedAt ?? null,
      snapshotBaseUrl: snapshot.source?.baseUrl ?? null,
      uploadsPath,
    },
    summary: summarizeInventory(entries, invalidCandidates),
    invalidCandidates,
    entries,
  };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '未計測';
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export function renderSummary(inventory) {
  const remote = inventory.remoteSummary ?? null;
  const lines = [
    '# WordPressメディア台帳サマリー',
    '',
    `生成日時: ${inventory.generatedAt}`,
    `元スナップショット: ${inventory.source.snapshotExportedAt ?? '不明'}`,
    '',
    '## 抽出結果',
    '',
    `- ユニークメディア（保存キー単位）: ${inventory.summary.uniqueMedia.toLocaleString('ja-JP')}件`,
    `- 抽出URLバリエーション: ${inventory.summary.sourceUrlVariants.toLocaleString('ja-JP')}件`,
    `- URL出現回数: ${inventory.summary.totalReferences.toLocaleString('ja-JP')}回`,
    `- URL解析不能候補: ${inventory.summary.invalidCandidates.toLocaleString('ja-JP')}件`,
    '',
    '| 拡張子 | 件数 |',
    '| --- | ---: |',
    ...Object.entries(inventory.summary.byExtension).map(
      ([extension, count]) => `| ${extension} | ${count.toLocaleString('ja-JP')} |`,
    ),
    '',
    '## リモート確認',
    '',
  ];

  if (!remote) {
    lines.push('未実施。`pnpm probe:wordpress-media`でHTTP状態と容量を確認する。');
  } else {
    lines.push(
      `- 確認済み: ${remote.checked.toLocaleString('ja-JP')}件`,
      `- 未確認: ${remote.unchecked.toLocaleString('ja-JP')}件`,
      `- 取得可能: ${remote.available.toLocaleString('ja-JP')}件`,
      `- 欠損候補: ${remote.missing.toLocaleString('ja-JP')}件`,
      `- 元サイズ画像で復旧可能: ${remote.recoverableMissing.toLocaleString('ja-JP')}件`,
      `- 復旧候補なし: ${remote.unrecoverableMissing.toLocaleString('ja-JP')}件`,
      `- エラー・未確認: ${remote.errors.toLocaleString('ja-JP')}件`,
      `- Content-Length判明: ${remote.withContentLength.toLocaleString('ja-JP')}件`,
      `- 判明分の合計容量: ${formatBytes(remote.knownBytes)}`,
      `- 全体推定容量: ${formatBytes(remote.estimatedBytes)}`,
      '',
      '| 拡張子 | 取得可能 | 欠損 | 容量 |',
      '| --- | ---: | ---: | ---: |',
      ...Object.entries(remote.byExtension).map(
        ([extension, result]) =>
          `| ${extension} | ${result.available.toLocaleString('ja-JP')} | ${result.missing.toLocaleString('ja-JP')} | ${formatBytes(result.knownBytes)} |`,
      ),
    );

    const missingEntries = inventory.entries.filter((entry) =>
      [404, 410].includes(entry.remoteCheck?.httpStatus),
    );
    if (missingEntries.length > 0) {
      lines.push(
        '',
        '## 欠損候補の詳細',
        '',
        '| 状態 | 欠損URL | 復旧候補 | 参照元 |',
        '| --- | --- | --- | --- |',
        ...missingEntries.map((entry) => {
          const candidate = entry.recoveryCandidate?.remoteCheck?.ok
            ? entry.recoveryCandidate.sourceUrl
            : 'なし';
          const status = candidate === 'なし' ? '復旧候補なし' : '元サイズで復旧可能';
          const references = entry.references
            .map((reference) => `${reference.type} #${reference.legacyId}: ${reference.title}`)
            .join('<br>')
            .replaceAll('|', '\\|');
          return `| ${status} | ${entry.sourceUrl} | ${candidate} | ${references} |`;
        }),
      );
    }
  }

  lines.push('', '詳細は`wordpress-media-inventory.json`を参照する。', '');
  return lines.join('\n');
}

export async function writeJsonAtomic(outputPath, value) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, outputPath);
}

async function readInput(inputPath) {
  if (inputPath !== '-') return readFile(inputPath, 'utf8');
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const inputOption = readOption(args, '--input', DEFAULT_INPUT);
  const outputPath = path.resolve(readOption(args, '--output', DEFAULT_OUTPUT));
  const reportPath = path.resolve(readOption(args, '--report', DEFAULT_REPORT));
  const uploadsPath = readOption(args, '--uploads-path', DEFAULT_UPLOADS_PATH);
  const inputPath = inputOption === '-' ? '-' : path.resolve(inputOption);

  const snapshot = JSON.parse(await readInput(inputPath));
  const inventory = buildInventory(snapshot, { uploadsPath });
  try {
    const previousInventory = JSON.parse(await readFile(outputPath, 'utf8'));
    preserveRemoteResults(inventory.entries, previousInventory.entries);
    if (inventory.entries.some((entry) => entry.remoteCheck)) {
      inventory.remoteSummary = summarizeRemoteChecks(inventory.entries);
    }
  } catch {
    // The first inventory generation has no previous output to preserve.
  }
  await writeJsonAtomic(outputPath, inventory);
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, renderSummary(inventory), 'utf8');

  process.stdout.write(`Found ${inventory.summary.uniqueMedia} unique media files\n`);
  process.stdout.write(`Wrote ${outputPath}\n`);
  process.stdout.write(`Wrote ${reportPath}\n`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}
