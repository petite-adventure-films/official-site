import { expect, test } from 'vitest';
import { validateBlogDraft, validateBlogAssets } from './blog-draft';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { bodyAssetReferences } from '../../packages/content-schema/body-media';
const image = 'asset_' + 'a'.repeat(32),
  variant = 'asset_' + 'b'.repeat(32),
  pdf = 'asset_' + 'c'.repeat(32);
const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'inlineAssetImage',
          attrs: {
            assetId: image,
            alt: '説明',
            width: 200,
            height: 150,
            sources: [{ assetId: variant, width: 400 }],
            sizes: '(max-width: 400px) 100vw, 400px',
          },
          marks: [
            {
              type: 'assetLink',
              attrs: {
                assetId: pdf,
                assetKind: 'document',
                target: '_blank',
                title: '資料',
              },
            },
          ],
        },
      ],
    },
  ],
};
test('schema and reference inspection include inline images, variants and click targets', async () => {
  expect(
    validateBlogDraft({ ...emptyBlogDraft(), body: { schemaVersion: 2, doc } }),
  ).toBe(true);
  expect(bodyAssetReferences(doc)).toEqual([
    { id: image, kind: 'image' },
    { id: variant, kind: 'image' },
    { id: pdf, kind: 'document' },
  ]);
  const assets = new Map([
    [image, 'image'],
    [variant, 'image'],
    [pdf, 'document'],
  ]);
  const db = {
    prepare: () => ({
      bind: (id: string) => ({
        first: async () =>
          assets.has(id)
            ? { asset_json: JSON.stringify({ kind: assets.get(id) }) }
            : null,
      }),
    }),
  };
  await expect(validateBlogAssets(db as any, doc)).resolves.toBeUndefined();
  assets.delete(variant);
  await expect(validateBlogAssets(db as any, doc)).rejects.toThrow();
  assets.set(variant, 'document');
  await expect(validateBlogAssets(db as any, doc)).rejects.toThrow();
});
test('rejects unsupported presentation and unsafe link attributes', () => {
  for (const overrides of [
    { width: 0 },
    { sources: [{ assetId: 'unknown', width: 100 }] },
    { legacyClass: 'hidden' },
    { sizes: 'url(javascript:alert(1))' },
  ]) {
    const broken = structuredClone(doc);
    Object.assign(broken.content[0].content[0].attrs, overrides);
    expect(
      validateBlogDraft({
        ...emptyBlogDraft(),
        body: { schemaVersion: 2, doc: broken },
      }),
    ).toBe(false);
  }
});
