import { expect, test } from 'vitest';
import { slugIssue } from './slug';
test('rejects URL delimiters, reserved routes and empty values without rewriting input', () => {
  for (const value of ['', '.', '..', 'a/b', 'a\\b', 'a b', 'a?b', 'a#b', '%2f', 'archive', 'ARCHIVE', 'a'.repeat(201)]) expect(slugIssue(value)).toBeTruthy();
  for (const value of ['paris-screening', '18010', '上映会', crypto.randomUUID()]) expect(slugIssue(value)).toBeUndefined();
});
