import type { Endpoints } from '~/types/endpoints';

type Options = {
  query?: {
    page?: string;
    per_page?: number;
    year?: string;
    category_name?: string;
    tag?: string;
    post__not_in?: number;
    meta_key?: string;
    meta_value?: string | number;
  };
};

export const useWpGetList = async <T>(
  endpoint: Endpoints,
  options?: Options,
) => {
  const config = useRuntimeConfig();
  const url = `${config.public.API_BASE}wp/wp-json/wp/v2/${endpoint}`;
  const { data } = await useFetch(url, options);
  const posts = data as Ref<{ data: T[]; total_pages: number }>;
  return { posts };
};
