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
<?php wp_head(); ?>
</head>
<body class="<?php echo set_body_class(); ?>">
<div id="app" v-cloak>

<nav class="relative site_header">
    <div class="container">
        <div class="single">
        <div class="col col_9 last">
            <div id="site_name">
                <router-link :to="{ name: 'top' }">
                    <p id="eng">Petite Adventure Films Shop</p>
                    <p class="inline_block" id="jpn">プチ･アドベンチャー･フィルムズ ショップ</p>
                </router-link>
                
                <div class="_btns">
                    <div class="__btn qna_btn inline_block">
                        <router-link :to="{ name: 'faq' }">
                            <span class="___icon icon-question-answer"></span>
                            <span class="___text">FAQ</span>
                        </router-link>
                    </div>
                    <div class="__btn basket_btn inline_block">                    
                        <router-link
                            :to="{ name: 'basket' }"
                            :class="(basketsCount > 0) ? '_added' : ''">
                            <span class="___icon icon-shopping-basket"></span>
                            <span
                            v-if="basketsCount > 0"
                            class="___number basketsCount">{{basketsCount}}</span>
                            <span class="___text">BASKET</span>
                        </router-link>
                    </div>
                </div>
            </div>
        </div><!-- col col_9 last -->
        </div><!-- single -->
    </div>
</nav>
<div class="clear"></div>

<div class="container">
<article>