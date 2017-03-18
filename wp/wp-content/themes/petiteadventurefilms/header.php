<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<link href="<?php echo bloginfo("stylesheet_url"); ?>" rel="stylesheet" type="text/css" media="all" />
<link href='https://fonts.googleapis.com/css?family=Dosis:400,200,300,500,600,700,800&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
<!--[if lt IE 9]><script src="http://html5shiv-printshiv.googlecode.com/svn/trunk/html5shiv-printshiv.js"></script>
<![endif]-->
<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/script.min.js"></script>
<?php wp_head(); ?>
</head>
<body class="<?php echo set_body_class(); ?>">

<nav class="relative" id="site_header">
	<div class="container">
		<div class="col col_4" id="site_name">
			<a href="<?php echo get_bloginfo("url"); ?>">
				<p id="eng">Petite Adventure Films</p>
				<p id="jpn">プチ･アドベンチャー･フィルムズ </p>
			</a>
		</div>
		<div class="col col_8 last show_wider">
			<ul class="site_menu">
				<li><a href="<?php echo get_bloginfo("siteurl"); ?>">HOME</a></li>
				<li><a href="<?php echo get_post_type_archive_link("news"); ?>">新着情報</a></li>
				<li><a href="<?php echo get_post_type_archive_link("events"); ?>">上映会･イベント</a></li>
				<li><a href="<?php echo get_post_type_archive_link("films"); ?>">映画</a></li>
				<li><a href="<?php echo get_post_type_archive_link("channel"); ?>">チャンネル</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("director")); ?>">監督</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("four-walling")); ?>">自主上映</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("order_jp")); ?>">DVD購入</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("blog")); ?>">BLOG</a></li>
			</ul>
		</div>
		<div class="show_smaller">
			<span class="icon-menu" id="icon_site_menu"></span>
		</div>
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