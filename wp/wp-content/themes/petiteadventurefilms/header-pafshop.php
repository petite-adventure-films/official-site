<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
<meta name="google-site-verification" content="Ne-xN9Ore9lEUJAgy9yJBwXETUaiU2dxPte_FKNe-Pc" />
<title></title>
<?php add_alternate_link(); ?>

<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); echo '?' . filemtime( get_stylesheet_directory() . '/style.css'); ?>">
<link href='https://fonts.googleapis.com/css?family=Dosis:400,200,300,500,600,700,800&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
<link href="https://fonts.googleapis.com/css?family=Sawarabi+Gothic" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Sawarabi+Mincho" rel="stylesheet">
<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/script.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios@0.20.0/dist/axios.min.js"></script>
<script src="https://unpkg.com/vue-masonry@0.11.3/dist/vue-masonry-plugin-window.js"></script>
<script src="https://unpkg.com/vue-lazyload/vue-lazyload.js"></script>


<script src="https://js.stripe.com/v3/"></script>
<!-- <script src="https://requirejs.org/docs/release/2.3.5/minified/require.js"></script> -->
<?php wp_head(); ?>
</head>
<body class="<?php echo set_body_class(); ?>">
<div id="app">

<nav class="relative" id="site_header">
    <div class="container">
        <div class="single">
        <div class="col col_9 last">
            <div id="site_name">
                <a href="<?php echo get_post_type_archive_link("pafshop"); ?>">
                    <p id="eng">Petite Adventure Films Shop</p>
                    <p class="inline_block" id="jpn">プチ･アドベンチャー･フィルムズ ショップ</p>
                </a>
                <div class="qna_btn">
                    <a href="<?php echo get_permalink(get_page_by_path("cashier/faq")); ?>">
                        <span class="_icon icon-question-answer"></span>
                        <span class="_text">FAQ</span>
                    </a>
                </div>
                <div class="cart_btn">
                    <a
                    :class="(pafCartCount > 0) ? '_added' : ''"
                    href="<?php echo get_permalink(get_page_by_path("cashier")); ?>">
                        <span class="_icon icon-shopping-basket"></span>
                        <span
                        v-if="pafCartCount > 0"
                        class="_number pafCartCount">{{pafCartCount}}</span>
                        <span class="_text">BASKET</span>
                    </a>       
                </div>
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