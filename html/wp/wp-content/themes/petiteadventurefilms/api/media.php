<?

/**
 * メディア紹介記事一覧の詳細を取得
 */
add_action('rest_api_init', 'register_media_api');
function register_media_api()
{
  register_rest_route(
    'wp/v2',
    'media',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_media'
    ],
    true
  );
}
function get_values_media()
{
  $args = array(
    'post_type' => 'media',
    'posts_per_page' => $_GET['per_page']
  );
  $get_data = fn() => [
    'id' => get_the_ID(),
    'title' => get_the_title(),
    'media_name' => get_post_meta(get_the_ID(), "media_info_01", TRUE),
    'media_volume' => get_post_meta(get_the_ID(), "media_info_02", TRUE),
    'media_contents' => get_post_meta(get_the_ID(), "media_info_03", TRUE),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
  ];
  return get_list($args, $get_data);
}

/**
 * メディア紹介個別記事の詳細を取得
 */
add_action('rest_api_init', 'register_media_detail_api');
function register_media_detail_api()
{
  register_rest_route(
    'wp/v2',
    'media_detail',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_media_detail'
    ],
    true
  );
}
function get_values_media_detail()
{
  $args = array(
    'post_type' => 'media',
    'p' => $_GET['pageId']
  );
  $get_data = fn() => [
    'id' => get_the_ID(),
    'title' => get_the_title(),
    'content' => wpautop(get_the_content(), true),
    'published' => get_the_date(),
    'updated' => get_the_modified_date(),
    'media_name' => get_post_meta(get_the_ID(), "media_info_01", TRUE),
    'media_volume' => get_post_meta(get_the_ID(), "media_info_02", TRUE),
    'media_contents' => get_post_meta(get_the_ID(), "media_info_03", TRUE),
    'media_video' => get_post_meta(get_the_ID(), "media_info_04", TRUE),
    'media_pdf_url' => wp_get_attachment_url(get_post_meta(get_the_ID(), "media_info_05", TRUE)),
    'article_title' => get_post_meta(get_the_ID(), "media_info_06", TRUE),
    'article_subtitle' => get_post_meta(get_the_ID(), "media_info_07", TRUE),
    'article_contents' => get_post_meta(get_the_ID(), "media_info_08", TRUE),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
  ];
  return get_detail($args, $get_data);
}
