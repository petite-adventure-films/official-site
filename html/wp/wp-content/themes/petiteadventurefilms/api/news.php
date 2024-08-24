<?

// お知らせ
add_action('rest_api_init', 'register_news_api');
function register_news_api()
{
    register_rest_route(
        'wp/v2',
        'news',
        [
            'methods'  =>  'GET',
            'callback' => 'get_values_news'
        ],
        true
    );
}
function get_values_news()
{
    $args = array(
        'post_type' => 'news',
        'paged' => $_GET['page'],
        'posts_per_page' => $_GET['per_page']
    );
    $get_data = fn() => [
        'id' => get_the_ID(),
        'title' => html_entity_decode(get_the_title()),
        'content' => html_entity_decode(get_the_content()),
        'published' => get_the_date(),
        'updated' => get_the_modified_date()
    ];
    return get_list($args, $get_data);
}
