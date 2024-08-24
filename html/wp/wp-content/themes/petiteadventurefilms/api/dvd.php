<?php

/**
 * DVD一覧を取得
 */
add_action('rest_api_init', 'register_dvd_api');
function register_dvd_api()
{
  register_rest_route(
    'wp/v2',
    'dvd',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_dvd'
    ],
    true
  );
}
function get_values_dvd()
{
  $args = array(
    'post_type' => 'pafshop',
    'pages_per_page' => -1
  );
  $get_data = fn() => [
    'id' => get_the_ID(),
    'title' => html_entity_decode(get_the_title()),
    'name' => get_post_field('post_name', get_the_ID()),
    'catch' => get_post_meta(get_the_ID(), 'product_info_05', TRUE),
  ];
  return get_list($args, $get_data);
}


/**
 * DVD個別の詳細を取得
 */
add_action('rest_api_init', 'register_dvd_detail_api');
function register_dvd_detail_api()
{
  register_rest_route(
    'wp/v2',
    'dvd_detail',
    [
      'methods'  =>  'GET',
      'callback' => 'get_values_dvd_detail'
    ],
    true
  );
}
function get_values_dvd_detail()
{
  $args = array(
    'post_type' => 'pafshop',
    'name' => $_GET['pageName']
  );
  $get_data = fn() => [
    'id' => get_the_ID(),
    'title' => html_entity_decode(get_the_title()),
    'name' => get_post_field('post_name', get_the_ID()),
    'content' => wpautop(html_entity_decode(get_the_content()), true),
    'intro' => get_post_meta(get_the_ID(), 'product_info_03', TRUE),
    'catch' => get_post_meta(get_the_ID(), 'product_info_05', TRUE),
  ];
  return get_detail($args, $get_data);
}
