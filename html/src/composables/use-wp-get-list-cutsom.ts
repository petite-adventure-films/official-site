import type { Endpoints } from '~/types/endpoints';

export const useWpGetListCustom = async <T>(endpoint: Endpoints) => {
  const config = useRuntimeConfig();
  const url = `${config.public.API_BASE}wp/wp-json/wp/v2/${endpoint}`;
  const { status, data } = await useFetch<{ data: T }>(url);
  const posts = data as Ref<{ data: T }>;
  return { status, posts };
};
