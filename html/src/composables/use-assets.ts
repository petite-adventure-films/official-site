const assets = import.meta.glob('~/assets/images/**/*', {
  eager: true,
  import: 'default',
});

export const useAsset = (path: string): string =>
  assets[`/assets/images/${path}`];
