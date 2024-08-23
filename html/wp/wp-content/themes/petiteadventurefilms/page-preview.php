<?php
$post_type = ($_GET['type'] === 'news' || $_GET['type'] === 'events' || $_GET['type'] === 'channel' || $_GET['type'] === 'media') ? $_GET['type'] : 'post';
$args = array(
  'post_type'   => $post_type,
  'p'           => $_GET['id'],
  'post_status' => ['publish', 'draft']

);
$query = new WP_Query($args);
?>

<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yakuhanjp@4.1.1/dist/css/yakuhanjp.css">
  <meta name="robots" content="noindex, nofollow">
  <title>プレビュー</title>
  <style>
    .link-text,
    p>a {
      color: rgb(37 99 235);
      text-decoration: underline;
    }

    .link-text[target='_blank']::after,
    p>a[target='_blank']::after {
      content: '↗︎';
    }

    @media screen and (min-width: 640px) {

      .link-text:hover,
      p>a:hover {
        color: rgb(96 165 250);
        text-decoration: none;
      }

    }

    .m2_t {
      margin-top: 1em;
    }
  </style>
</head>

<body style="font-family: YakuHanJP, sans-serif;">

  <?
  switch ($_GET['type']) {
    case 'news':
      require_once('preview/news.php');
      break;
    case 'events':
      require_once('preview/events.php');
      break;
    case 'channel':
      require_once('preview/channel.php');
      break;
    case 'media':
      require_once('preview/media.php');
      break;
    case 'blog':
      require_once('preview/blog.php');
      break;
  }; ?>
</body>

</html>