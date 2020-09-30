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
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios@0.20.0/dist/axios.min.js"></script>
<script src="https://unpkg.com/vue-masonry@0.11.3/dist/vue-masonry-plugin-window.js"></script>
<script src="https://js.stripe.com/v3/"></script>
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
                
                <div class="_btns">
                    <div class="__btn qna_btn inline_block">
                        <a href="<?php echo get_permalink(get_page_by_path("cashier/faq")); ?>">
                            <span class="___icon icon-question-answer"></span>
                            <span class="___text">FAQ</span>
                        </a>
                    </div>
                    <div class="__btn basket_btn inline_block">
                        <a
                        :class="(pafCartCount > 0) ? '_added' : ''"
                        href="<?php echo get_permalink(get_page_by_path("cashier")); ?>">
                            <span class="___icon icon-shopping-basket"></span>
                            <span
                            v-if="pafCartCount > 0"
                            class="___number pafCartCount">{{pafCartCount}}</span>
                            <span class="___text">BASKET</span>
                        </a>
                    </div>
                </div>
            </div>
        </div><!-- col col_9 last -->
        </div><!-- single -->
    </div>
</nav>

<div class="container">
<article>