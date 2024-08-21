<?

/**
 * チャンネル記事一覧の詳細を取得
 */
add_action('rest_api_init', 'register_channel_api');
function register_channel_api()
{
  register_rest_route(
    'wp/v2',
    'channel',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_channel'
    ],
    true
  );
}
function get_values_channel()
{
  $args = array(
    'post_type' => 'channel',
    'posts_per_page' => $_GET['per_page']
  );
  $get_data = fn() => [
    'id' => get_the_ID(),
    'title' => html_entity_decode(get_the_title()),
    'youtube_id' => get_post_meta(get_the_ID(), 'video_info_00', TRUE),
    'created_year' => get_post_meta(get_the_ID(), 'video_info_02', TRUE),
    'created_country' => get_post_meta(get_the_ID(), 'video_info_03', TRUE),
    'running_time' => get_post_meta(get_the_ID(), 'video_info_04', TRUE),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
    'published' => get_the_date(),
    'updated' => get_the_modified_date()
  ];
  return get_list($args, $get_data);
}

/**
 * チャンネル個別記事の詳細を取得
 */
add_action('rest_api_init', 'register_channel_detail_api');
function register_channel_detail_api()
{
  register_rest_route(
    'wp/v2',
    'channel_detail',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_channel_detail'
    ],
    true
  );
}
function get_values_channel_detail()
{
  $args = array(
    'post_type' => 'channel',
    'p' => $_GET['pageId']
  );
  $get_data = fn() => [
    'id' => get_the_ID(),
    'title' => html_entity_decode(get_the_title()),
    'content' => wpautop(get_the_content(), true),
    'published' => get_the_date(),
    'youtube_id' => get_post_meta(get_the_ID(), 'video_info_00', TRUE),
    'created_year' => get_post_meta(get_the_ID(), 'video_info_02', TRUE),
    'created_country' => get_post_meta(get_the_ID(), 'video_info_03', TRUE),
    'running_time' => get_post_meta(get_the_ID(), 'video_info_04', TRUE),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
  ];
  return get_detail($args, $get_data);
}
