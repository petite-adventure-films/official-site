<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
define('ACCESS_TOKEN_DISPATCH', $_ENV['ACCESS_TOKEN_DISPATCH']);
define('RECAPTCHA_SECRET_KEY', $_ENV['RECAPTCHA_SECRET_KEY']);

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

// wordpressからデプロイできるように
function dispatch_github_actions()
{
  $url = 'https://api.github.com/repos/petite-adventure-films/ja/dispatches';
  $headers = [
    'Authorization: bearer ' . ACCESS_TOKEN_DISPATCH,
    'Accept: application/vnd.github+json',
    'X-GitHub-Api-Version: 2022-11-28',
    'User-Agent: deploy_from_wordpress'
  ];
  $data = [
    'event_type' => 'deploy_from_wordpress',
  ];

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($ch);
  curl_close($ch);
  return $response;
}

add_action('admin_menu', 'custom_menu_page');
function custom_menu_page()
{
  add_menu_page('サイト更新', 'サイト更新', 'manage_options', 'custom_menu_page', 'add_custom_menu_page', 'dashicons-update', 2);
}
function add_custom_menu_page()
{
?>
  <div class="wrap">
    <h2>更新</h2>
    <?
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['run']) && $_POST['run'] === 'run') {
      dispatch_github_actions();
    ?>
      <p>GitHub Actionsが実行されました。更新までしばらくお待ちください。<br>
        結果は<a href="https://github.com/petite-adventure-films/ja/actions/" target="_blank" rel="noopener noreferrer"> Actionsのジョブ</a>を確認してください。</p>
    <? } else { ?>
      <form method="post" action="">
        <button type="submit" name="run" value="run">更新作業を始める</button>
      </form>
    <? }  ?>
  </div>
<? }
