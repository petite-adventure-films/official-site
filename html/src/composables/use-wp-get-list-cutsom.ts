import type { Endpoints } from '~/types/endpoints';

export const useWpGetListCustom = async <T>(endpoint: Endpoints) => {
  const config = useRuntimeConfig();
  const url = `${config.public.API_BASE}wp/wp-json/wp/v2/${endpoint}`;
  const router = useRouter();
  const { data, error } = await useFetch<{ data: T }>(url);
  const posts = data as Ref<{ data: T }>;
  if (!posts.value || error.value) {
    router.push('/404/');
  }
  return { posts };
};
