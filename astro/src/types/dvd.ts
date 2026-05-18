import type { FilmId } from './film';

export type DVD = {
  id: number;
  film_id: FilmId | FilmId[];
  name: string;
  article_component: string;
  title: string;
  prices: { amount: number; type: string; disc: ('DVD' | 'ブルーレイ')[] }[];
  specials?: boolean;
  disc: { index: string; number: number; type: string; content: string }[];
  image_num: number;
  catch?: string;
  intro?: string;
  article_type: 'main' | 'specials';
};
