<?php

// API
require_once('lib/get_data.php');
require_once('lib/format_date.php');
require_once('lib/mail.php');
require_once('api/news.php');
require_once('api/events.php');
require_once('api/channel.php');
require_once('api/media.php');
require_once('api/blog.php');
require_once('api/dvd.php');
require_once('api/contact.php');
require_once('api/checkout.php');

// アイキャッチ画像有効化
add_theme_support('post-thumbnails');

// プレビューURL変更
function replace_preview_link($url)
{
  $pattern = "/(https?:\/\/[^\/]+)\/wp\/([^\/]+)\/.*\?preview_id=([0-9]+)/";
  preg_match($pattern, $url, $matches);

  if (isset($matches[1], $matches[2], $matches[3])) {
    $base_url = $matches[1];
    $type = $matches[2];
    $id = $matches[3];
    $type = ($type === 'news' || $type === 'media' || $type === 'events' || $type === 'channel') ? $type : 'blog';
    $new_url = "{$base_url}/wp/preview/?type={$type}&id={$id}";
    return $new_url;
  }

  return null; // No match found
}
add_filter('preview_post_link', 'replace_preview_link');
