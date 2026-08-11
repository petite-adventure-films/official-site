import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  renderSummary,
  summarizeRemoteChecks,
  writeJsonAtomic,
} from './inventory-wordpress-media.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const DEFAULT_INPUT = path.join(projectDirectory, 'data', 'wordpress-media-inventory.json');
const DEFAULT_REPORT = path.join(projectDirectory, 'data', 'wordpress-media-inventory-summary.md');

function readOption(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

function readIntegerOption(args, name, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const value = Number(readOption(args, name, String(fallback)));
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function createOriginalSizeCandidate(url) {
  const parsed = new URL(url);
  const originalPath = parsed.pathname.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/u, '$1');
  if (originalPath === parsed.pathname) return null;
  parsed.pathname = originalPath;
  return parsed.href;
}

async function probeUrl(url, { timeout, retries }) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(timeout),
        headers: { 'User-Agent': 'PAF-WordPress-Media-Audit/1.0' },
      });
      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        await wait(500 * 2 ** attempt);
        continue;
      }

      const contentLengthHeader = response.headers.get('content-length');
      const contentLength = contentLengthHeader === null ? null : Number(contentLengthHeader);
      return {
        checkedAt: new Date().toISOString(),
        ok: response.ok,
        httpStatus: response.status,
        finalUrl: response.url,
        contentType: response.headers.get('content-type'),
        contentLength: Number.isFinite(contentLength) ? contentLength : null,
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
        error: null,
      };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await wait(500 * 2 ** attempt);
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    ok: false,
    httpStatus: null,
    finalUrl: null,
    contentType: null,
    contentLength: null,
    etag: null,
    lastModified: null,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = path.resolve(readOption(args, '--input', DEFAULT_INPUT));
  const outputPath = path.resolve(readOption(args, '--output', inputPath));
  const reportPath = path.resolve(readOption(args, '--report', DEFAULT_REPORT));
  const concurrency = readIntegerOption(args, '--concurrency', 2, { min: 1, max: 8 });
  const delay = readIntegerOption(args, '--delay-ms', 250, { min: 0, max: 10_000 });
  const timeout = readIntegerOption(args, '--timeout-ms', 15_000, {
    min: 1_000,
    max: 120_000,
  });
  const retries = readIntegerOption(args, '--retries', 2, { min: 0, max: 5 });
  const limit = readIntegerOption(args, '--limit', Number.MAX_SAFE_INTEGER);

  let inventory;
  try {
    inventory = JSON.parse(await readFile(outputPath, 'utf8'));
  } catch {
    inventory = JSON.parse(await readFile(inputPath, 'utf8'));
  }

  const pending = inventory.entries
    .filter((entry) => !entry.remoteCheck || entry.remoteCheck.httpStatus === null)
    .slice(0, limit);
  let nextIndex = 0;
  let completed = 0;
  let checkpoint = Promise.resolve();

  async function persist() {
    inventory.remoteSummary = summarizeRemoteChecks(inventory.entries);
    await writeJsonAtomic(outputPath, inventory);
    await writeFile(reportPath, renderSummary(inventory), 'utf8');
  }

  async function worker() {
    while (nextIndex < pending.length) {
      const entry = pending[nextIndex];
      nextIndex += 1;
      entry.remoteCheck = await probeUrl(entry.sourceUrl, { timeout, retries });
      completed += 1;
      if (completed % 25 === 0 || completed === pending.length) {
        process.stdout.write(`Checked ${completed}/${pending.length}\n`);
      }
      if (completed % 100 === 0) {
        checkpoint = checkpoint.then(persist);
      }
      await wait(delay);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, () => worker()));

  const recoveryEntries = inventory.entries.filter(
    (entry) =>
      [404, 410].includes(entry.remoteCheck?.httpStatus) && entry.recoveryCandidate === undefined,
  );
  for (const entry of recoveryEntries) {
    const candidateUrl = createOriginalSizeCandidate(entry.sourceUrl);
    entry.recoveryCandidate = candidateUrl
      ? {
          sourceUrl: candidateUrl,
          remoteCheck: await probeUrl(candidateUrl, { timeout, retries }),
        }
      : null;
    await wait(delay);
  }

  await checkpoint;
  await persist();
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
