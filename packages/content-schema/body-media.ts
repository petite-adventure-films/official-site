// WordPress size-full is metadata, not a CSS class: Tailwind uses the same name for width/height 100%.
// Article-level presentation; IDs resolve independently in the editor and public renderer.
export const imageTypes = ['assetImage', 'inlineAssetImage'];
export const imageKeys = [
  'assetId',
  'alt',
  'title',
  'width',
  'height',
  'legacyClass',
  'loading',
  'decoding',
  'sources',
  'sizes',
];
export const assetLinkKeys = ['assetId', 'assetKind', 'target', 'title'];
export function imageAttributes(
  attrs: Record<string, any>,
  path: (id: string) => string,
): Record<string, string | number> {
  return {
    src: path(attrs.assetId),
    alt: attrs.alt,
    ...Object.fromEntries(
      ['title', 'width', 'height', 'loading', 'decoding', 'sizes']
        .filter((k) => attrs[k] != null)
        .map((k) => [k, attrs[k]]),
    ),
    ...(attrs.sources?.length
      ? {
          srcset: attrs.sources
            .map(
              (s: { assetId: string; width: number }) =>
                `${path(s.assetId)} ${s.width}w`,
            )
            .join(', '),
        }
      : {}),
  };
}
export function assetLinkAttributes(
  attrs: Record<string, any>,
  path: (id: string) => string,
): Record<string, string> {
  return {
    href: path(attrs.assetId),
    ...(attrs.target ? { target: attrs.target } : {}),
    ...(attrs.title != null ? { title: attrs.title } : {}),
    ...(attrs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}),
  };
}
export function bodyAssetReferences(node: {
  type: string;
  attrs?: Record<string, any>;
  content?: any[];
  marks?: any[];
}): { id: string; kind: string }[] {
  const own = imageTypes.includes(node.type)
    ? [
        { id: node.attrs!.assetId, kind: 'image' },
        ...(node.attrs!.sources ?? []).map((s: { assetId: string }) => ({
          id: s.assetId,
          kind: 'image',
        })),
      ]
    : node.type === 'assetLink'
      ? [{ id: node.attrs!.assetId, kind: node.attrs!.assetKind }]
      : [];
  return [
    ...own,
    ...[...(node.content ?? []), ...(node.marks ?? [])].flatMap(
      bodyAssetReferences,
    ),
  ];
}
