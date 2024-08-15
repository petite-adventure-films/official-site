import type { Endpoints } from '~/types/endpoints';

export const useWpGetListDetail = async <T>(
  endpoint: Endpoints,
  query: { pageId?: string; pageName?: string },
) => {
  const config = useRuntimeConfig();
  const url = `${config.public.API_BASE}wp/wp-json/wp/v2/${endpoint}`;
  const { status, data } = await useFetch(url, {
    query,
  });
  const detail = data as Ref<{ data: T }>;
  return { status, detail };
};
