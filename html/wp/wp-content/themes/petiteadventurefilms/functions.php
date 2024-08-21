<?php

require_once __DIR__ . '/../../../../stripe/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
define('GITHUB_TOKEN', $_ENV['GITHUB_TOKEN']);

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

function dispatch_github_actions()
{
  $token = GITHUB_TOKEN;
  $url = 'https://api.github.com/repos/petite-adventure-films/ja/dispatches';
  $headers = [
    'Authorization: bearer ' . $token,
    'Accept: application/vnd.github.v3+json',
    'User-Agent: after_saving_wordpress'
  ];
  $data = [
    'event_type' => 'deploy-wordpess',
  ];

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
  curl_setopt($ch, CURLOPT_HEADER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_exec($ch);
  curl_close($ch);
}

add_action('admin_menu', 'custom_menu_page');
function custom_menu_page()
{
  add_menu_page('公開', '公開', 'manage_options', 'custom_menu_page', 'add_custom_menu_page', 'dashicons-update', 2);
}
function add_custom_menu_page()
{
?>
  <div class="wrap">
    <h2>公開</h2>
  <?
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['run']) && $_POST['run'] === 'run') {
    dispatch_github_actions();
    echo "GitHub Actionsのフックが実行されました。公開までしばらくお待ちください。";
  } else {
    echo '<form method="post" action="">';
    echo '<button type="submit" name="run" value="run">公開を始める</button>';
    echo '</form>';
  }
  echo '</div></div>';
}
