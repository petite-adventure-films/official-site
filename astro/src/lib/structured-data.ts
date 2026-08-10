import type { JsonLdObject } from '@/types/structured-data';

export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function toIsoDate(value?: string) {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return undefined;

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function minutesToIsoDuration(value?: string) {
  if (!value) return undefined;
  const minutes = Number(value.match(/(\d+)\s*分/)?.[1]);
  if (!Number.isFinite(minutes) || minutes <= 0) return undefined;
  return `PT${String(minutes)}M`;
}

export function createBreadcrumbList(items: { name: string; url: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
