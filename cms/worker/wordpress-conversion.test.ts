import { prepareEventPublication } from './event-publication';
import { describe, expect, it } from 'vitest';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { validateBlogDraft } from './blog-draft';
import { validateArticleDraft } from './article-draft';
import { validateDraft } from './event-draft';

describe('WordPress conversion candidates', () => {
  it('accounts for every source row and validates each candidate with the current CMS validators', () => {
    const directory = mkdtempSync(join(tmpdir(), 'paf-conversion-test-'));
    let report: any;
    try {
      const output = join(directory, 'report.json');
      execFileSync(process.execPath, [
        fileURLToPath(
          new URL(
            '../../astro/scripts/prepare-wordpress-conversion.mjs',
            import.meta.url,
          ),
        ),
        process.env.WP_CONVERSION_SNAPSHOT ?? fileURLToPath(
          new URL('../../astro/data/wordpress-export.json', import.meta.url),
        ),
        output,
      ]);
      report = JSON.parse(readFileSync(output, 'utf8'));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
    const source = JSON.parse(
      readFileSync(
        process.env.WP_CONVERSION_SNAPSHOT ?? new URL('../../astro/data/wordpress-export.json', import.meta.url),
        'utf8',
      ),
    );
    expect(report.rows).toHaveLength(
      Object.values(source.content).reduce(
        (n: number, rows: any) => n + rows.length,
        0,
      ),
    );
    expect(report.rows.filter((r: any) => r.candidate).length).toBeGreaterThan(
      0,
    );
    for (const row of report.rows) {
      if (!row.candidate) {
        expect(row.issues.length).toBeGreaterThan(0);
        continue;
      }
      expect(row.issues).toEqual([]);
      const valid =
        row.type === 'blog'
          ? validateBlogDraft(row.candidate)
          : row.type === 'event'
            ? validateDraft(row.candidate)
            : validateArticleDraft(row.type, row.candidate);
      expect(valid, `${row.type}/${row.legacyId}`).toBe(true);
      if (row.type === 'event') {
        const result = prepareEventPublication(row.candidate, { contentId: String(row.legacyId), filmTagIds: new Set(row.candidate.filmTagIds), eventTagIds: new Set(row.candidate.eventTagIds) });
        expect(result.ok, `${row.legacyId}: ${JSON.stringify(result)}`).toBe(true);
      }
    }
  }, 60_000);
});

// The combined report contains private source records and stays in ignored local storage.
describe('combined WordPress candidates', () => {
  it.skipIf(!process.env.WP_COMBINED_REPORT)('validates unpublished candidates with CMS save validators', () => {
    const report = JSON.parse(readFileSync(process.env.WP_COMBINED_REPORT!, 'utf8'));
    expect(report.schemaVersion).toBe('wordpress-combined-preflight/v1');
    expect(report.rows.length).toBe(report.summary.total);
    let candidates = 0;
    for (const row of report.rows) {
      expect(row.publish).toBe(false);
      expect(['publish', 'draft', 'private'].includes(row.source.status)).toBe(true);
      if (!row.candidate) { expect(row.issues.length > 0).toBe(true); continue; }
      candidates++;
      const valid = row.type === 'blog' ? validateBlogDraft(row.candidate)
        : row.type === 'event' ? validateDraft(row.candidate)
        : validateArticleDraft(row.type, row.candidate);
      expect(valid).toBe(true);
    }
    expect(candidates > 0).toBe(true);
  });
});
