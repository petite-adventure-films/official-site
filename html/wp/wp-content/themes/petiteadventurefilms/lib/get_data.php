<?php

/**
 * WP記事一覧を取得
 * 
 * @param array $args
 * @param callable $get_data
 * @return WP_REST_Response
 */
function get_list(array $args, callable $get_data)
{
  $query = new WP_Query($args);
  $query->get_posts();
  $data = array();
  if ($query->have_posts()) {
    while ($query->have_posts()) {
      $query->the_post();
      array_push($data, $get_data());
    }
  }
  return new WP_REST_Response(array('data' => $data, 'total_pages' => $query->max_num_pages), 200);
}

/**
 * WP個別記事の詳細を取得
 * 
 * @param array $args
 * @param callable $get_data
 * @return WP_REST_Response
 */
function get_detail(array $args, callable $get_data)
{
  $query = new WP_Query($args);
  $query->get_posts();
  $data = [];
  if ($query->have_posts()) {
    while ($query->have_posts()) {
      $query->the_post();
      $data = $get_data();
    }
  }
  return new WP_REST_Response(array('data' => $data), 200);
}
