<?

/**
 * ブログ記事のサムネイルがない時は、記事内の画像を取得
 */
function catch_that_image($post_id = NULL)
{
  if (!empty($post_id)) {
    $posts = get_post($post_id);
    $post_content = $posts->post_content;
  } else {
    global $post, $posts;
    $post_content = $post->post_content;
  }

  $first_img = '';
  ob_start();
  ob_end_clean();

  $output = preg_match_all('/<img.*?src=(["\'])(.+?)\1.*?>/i', $post_content, $matches);
  $first_img = $matches[2][0];

  if (empty($first_img)) {
    $first_img = false;
  }

  return $first_img;
}

/**
 * ブログ記事一覧の詳細を取得
 */
add_action('rest_api_init', 'register_blog_api');
function register_blog_api()
{
  register_rest_route(
    'wp/v2',
    'blog',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_blog'
    ],
    true
  );
}
function get_values_blog()
{
  $args = array(
    'post_type' => 'post',
    'paged' => $_GET['page'],
    'posts_per_page' => $_GET['per_page'],
    'category_name' => $_GET['category_name'],
    'tag' => $_GET['tag'],
    'post__not_in' => [$_GET['post__not_in']],
    'meta_key' => $_GET['meta_key'],
    'meta_value' => $_GET['meta_value'],
  );
  $data = fn() => [
    'id' => get_the_ID(),
    'title' => html_entity_decode(get_the_title()),
    'name' => get_post_field('post_name', get_the_ID()),
    'published' => get_the_date(),
    'updated' => get_the_modified_date(),
    'recommended' => get_post_meta(get_the_ID(), 'recommend', true),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
    'event_tags' => get_the_terms(get_the_ID(), 'eventtags'),
    'categories' => get_the_terms(get_the_ID(), 'category'),
    'thumbnail' => get_the_post_thumbnail_url(get_the_ID()),
  ];
  return get_list($args, $data);
}

/**
 * ブログ個別記事の詳細を取得
 */
add_action('rest_api_init', 'register_blog_detail_api');
function register_blog_detail_api()
{
  register_rest_route(
    'wp/v2',
    'blog_detail',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_blog_detail'
    ],
    true
  );
}
function get_values_blog_detail()
{
  $args = array(
    'post_type' => 'post',
    'name' => $_GET['pageName']
  );
  $data = fn() => [
    'id' => get_the_ID(),
    'title' => html_entity_decode(get_the_title()),
    'content' => wpautop(get_the_content(), true),
    'recommended' => get_post_meta(get_the_ID(), 'recommend', true),
    'published' => get_the_date(),
    'updated' => get_the_modified_date(),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
    'categories' => get_the_terms(get_the_ID(), 'category'),
  ];
  return get_detail($args, $data);
}
