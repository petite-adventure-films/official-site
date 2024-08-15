export type FilmId =
  | 'atarashikimura'
  | 'my_india_diary'
  | 'four_years_on'
  | 'apprentice_homeless'
  | 'dancing_zempukuji'
  | 'a_woman_from_fukushima'
  | 'otome_house'
  | 'goodbye_ur'
  | 'brian_and_co';

export type Film = {
  id: number;
  film_id: FilmId;
  title: string;
  content: string;
  director: string;
  genre: string;
  country: string;
  created_at: string;
  running_time: string;
  excerpt: string;
  gallery_num: number;
  catch?: string;
  prizes?: string[];
  recommends?: { by: string; text: string }[];
  details?: { index: string; text: string }[];
  teaser_youtube_id?: string;
  movie_youtube_id?: string;
  credits?: { index: string; text: string }[];
  national_screenings?: string[];
  global_screenings?: string[];
  media_screenings?: string[];
  related_infomation?: string[];
  has_dvd?: boolean;
  has_dvd_appendix?: string;
  shop_uri?: string;
  poster_appendix?: string;
  special_page?: {
    to: string;
    text: string;
    banner: string;
  };
};
