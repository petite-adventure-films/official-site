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
        fileURLToPath(
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
        new URL('../../astro/data/wordpress-export.json', import.meta.url),
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
    }
  }, 60_000);
});
