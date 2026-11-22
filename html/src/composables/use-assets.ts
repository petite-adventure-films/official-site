const assets = import.meta.glob<string>('~/assets/images/**/*', {
  eager: true,
  import: 'default',
});

export const useAsset = (path: string): string | undefined =>
  assets[`/assets/images/${path}`];
