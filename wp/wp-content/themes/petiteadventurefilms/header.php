<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
<meta name="google-site-verification" content="Ne-xN9Ore9lEUJAgy9yJBwXETUaiU2dxPte_FKNe-Pc" />
<title></title>
<?php add_alternate_link(); ?>

<link href="<?php echo get_template_directory_uri(); ?>/_style.css" rel="stylesheet">
<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); echo '?' . filemtime( get_stylesheet_directory() . '/style.css'); ?>">
<link href='https://fonts.googleapis.com/css?family=Dosis:400,200,300,500,600,700,800&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/script.min.js"></script>

<?php if(is_page('takahatadai73')): ?>
<link href="https://fonts.googleapis.com/css?family=Sawarabi+Gothic" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Sawarabi+Mincho" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js"></script>
<script src="https://unpkg.com/vue-masonry@0.11.3/dist/vue-masonry-plugin-window.js"></script>
<script src="https://unpkg.com/vue-lazyload/vue-lazyload.js"></script>
<?php endif; ?>

<?php wp_head(); ?>
</head>
<body class="<?php echo set_body_class(); ?>">
<div id="app">

<nav class="relative site_header" id="site_header">
    <div class="container">
        <div class="single">
        <div class="col col_9 last">
            <div id="site_name">
                <a href="<?php echo get_bloginfo("url"); ?>">
                    <p id="eng">Petite Adventure Films</p>
                    <p id="jpn">プチ･アドベンチャー･フィルムズ </p>
                </a>
                
                <div class="_btns">
                    <div class="__btn shop_btn inline_block">
                        <a href="<?php echo get_post_type_archive_link("pafshop"); ?>">
                            <span class="___icon icon-store"></span>
                            <span class="___text">SHOP</span>
                        </a>
                    </div>
                </div>
            </div>
            <div class="show_wider">
                <ul class="site_menu">
                    <li><a href="<?php echo get_post_type_archive_link("news"); ?>">新着情報</a></li>
                    <li><a href="<?php echo get_post_type_archive_link("events"); ?>">上映会･イベント</a></li>
                    <li><a href="<?php echo get_post_type_archive_link("films"); ?>">映画</a></li>
                    <li><a href="<?php echo get_post_type_archive_link("channel"); ?>">チャンネル</a></li>
                    <li><a href="<?php echo get_post_type_archive_link("media"); ?>">メディア</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("director")); ?>">監督</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("four-walling")); ?>">自主上映</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("workshop")); ?>">ワークショップ</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("blog")); ?>">BLOG</a></li>
                </ul>
            </div>
            <div class="show_smaller">
                <span class="icon-menu" id="icon_site_menu"></span>
            </div>
        </div><!-- col col_9 last -->
        </div><!-- single -->
    </div>
</nav>

<?php if(is_home()): ?>
    <div id="video_background_mask"></div>
    <video autoplay loop muted preload="auto" id="video_background">
        <source src="<?php echo get_bloginfo("template_url"); ?>/assets/video/home.mp4" type="video/mp4">
        <source src="<?php echo get_bloginfo("template_url"); ?>/assets/video/home.webm" type="video/webm">
    </video>
    <div id="home_video" class="hidden video_container">
        <div class="video" id="video"><div id="player"></div></div>
    </div>
<?php else: ?>
    <div class="container">
<?php endif; ?>
<article>