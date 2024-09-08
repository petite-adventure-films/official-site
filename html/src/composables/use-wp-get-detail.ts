import type { Endpoints } from '~/types/endpoints';

export const useWpGetListDetail = async <T>(
  endpoint: Endpoints,
  query: { pageId?: string; pageName?: string },
) => {
  const config = useRuntimeConfig();
  const router = useRouter();
  const url = `${config.public.API_BASE}wp/wp-json/wp/v2/${endpoint}`;
  const { data, error } = await useFetch(url, {
    query,
  });
  const detail = data as Ref<{ data: T }>;
  if (error.value && error.value.statusCode === 404) {
    router.push('/404/');
  }
  return { detail };
};
