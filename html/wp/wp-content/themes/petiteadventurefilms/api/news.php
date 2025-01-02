<?php

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
    $archive = isset($_GET['archive']) ? boolval($_GET['archive']) : false;

    if ($archive) {
        $start_date = date('Y-m-d', strtotime('2000-01-01'));
        $end_date = date('Y-m-d', strtotime('2 years ago December 31'));
    } else {
        $start_date = date('Y-m-d', strtotime('1 year ago January 1'));
        $end_date = date('Y-m-d');
    }

    $args = array(
        'post_type' => 'news',
        'paged' => $_GET['page'],
        'posts_per_page' => $_GET['per_page'],
        'date_query' => array(
            'after' => $start_date,
            'before' => $end_date,
            'inclusive' => true
        )
    );
    $get_data = fn() => [
        'id' => get_the_ID(),
        'title' => html_entity_decode(get_the_title()),
        'content' => wpautop(get_the_content(), true),
        'published' => get_the_date(),
        'updated' => get_the_modified_date()
    ];
    return get_list($args, $get_data);
}
