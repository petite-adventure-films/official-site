<?php
get_header();

$post_type = get_post_type_object( get_query_var( 'post_type' ));
$term_link = get_post_type_archive_link($post_type->name);
$term_name = $post_type->label;

$poster_img = get_post_meta($post->ID, "films_info_00", TRUE);
$gallery_imgs = get_post_meta($post->ID, "films_info_09", FALSE);

$catch = get_post_meta($post->ID, "films_info_21", TRUE);
$prizes = get_post_meta($post->ID, "films_info_07", FALSE);

$genre = get_post_meta($post->ID, "films_info_01", TRUE);
$country = get_post_meta($post->ID, "films_info_02", TRUE);
$year = get_post_meta($post->ID, "films_info_03", TRUE);
$running_time = get_post_meta($post->ID, "films_info_04", TRUE);
$basic_info = array($genre, $country, $year, $running_time);
$basic_info = array_filter($basic_info, "strlen");

$recommend_by = get_post_meta_arr($post->ID, "films_info_12");
$recommends = get_post_meta_arr($post->ID, "films_info_13");

$detail_indexs = get_post_meta_arr($post->ID, "films_info_05");
$detail_contents = get_post_meta_arr($post->ID, "films_info_06");

$teaser = get_post_meta($post->ID, "films_info_08", TRUE);
$movie = get_post_meta($post->ID, "films_info_17", TRUE);

$excerpt = apply_filters('the_content', $post->post_excerpt);

$credits_indexs = get_post_meta_arr($post->ID, "films_info_10");
$credits_contents = get_post_meta_arr($post->ID, "films_info_11");

$national_screenings = get_post_meta($post->ID, "films_info_14");
$global_screenings = get_post_meta($post->ID, "films_info_15");
$media_screenings = get_post_meta($post->ID, "films_info_27");

$related_infomation = get_post_meta($post->ID, "films_info_16");

$sell_dvd = get_post_meta($post->ID, "films_info_20");
$sell_dvd_appendix = get_post_meta($post->ID, "films_info_22", TRUE);
?>

<div class="single">

	<header class="col col_9 last header_page">
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo $term_link; ?>" itemprop="url">
					<span itemprop="title"><?php echo $term_name; ?></span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
					<span itemprop="title"><?php echo $post->post_title; ?></span>
				</a>
			</div>
		</nav>
		<h1 class="m5_b">
			<?php if(is_day()){
				printf( __('日別アーカイブ: %s'), get_the_date());
			}elseif(is_month()){
				printf( __('月別アーカイブ: %s'), get_the_date('Y年n月'));
			}elseif(is_year()){
				printf( __('年別アーカイブ: %s'), get_the_date('Y年'));
			}elseif(is_post_type_archive()){
				$post_type = get_post_type_object( get_query_var( 'post_type' ));
				echo $post_type->label;
			}elseif(is_category() || is_tag() || is_tax()){
				single_term_title("", true);
			}else{
				the_title();
			}?>
		</h1>
	<!--.header_page--></header>

	<div class="col col_6">

		<?php if($catch): ?>
			<div class="subhead1 m2_t pink"><?php echo $catch; ?></div>
		<?php endif; ?>

		<?php if($prizes): ?>
			<div class="subhead1 m2_t pink">
			<?php foreach($prizes as $prize): ?>
				<p><?php echo $prize; ?></p>
			<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<?php if($excerpt): ?>
			<div class="subhead1 m2_t"><?php echo $excerpt; ?></div>
		<?php endif; ?>

		<?php if($basic_info): ?>
			<p class="m2_t"><?php echo implode(" / ", $basic_info); ?></p>
		<?php endif; ?>

		<?php if($detail_indexs): ?>
			<dl class="list_definition">
			<?php for($i=0; $i<count($detail_indexs); $i++): ?>
				<?php echo $detail_indexs[$i] ? "<dt>".$detail_indexs[$i]."</dt>" : ""; ?>
				<?php echo $detail_contents[$i] ? "<dd>".$detail_contents[$i]."</dd>" : ""; ?>
			<?php endfor; ?>
			</dl>
		<?php endif;?>

	</div>

	<div class="col col_3 last m3_t">
		<div id="film_poster">
			<?php echo get_post_meta_img($poster_img, "large"); ?>
			<?php if(!$sell_dvd): ?>
				<div class="m2_t m2_b btn priority1">
					<a href="<?php echo get_permalink(get_page_by_path("order_jp")); ?>">SHOP</a>
					<?php if($sell_dvd_appendix): ?>
						<p class="m1_t caption1"><?php echo $sell_dvd_appendix; ?></p>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>

	<div class="col col_9 last">

		<?php if(!empty($recommends)): ?>
			<section class="contents">
				<h2 class="contents_title">推薦のことば</h2>
				<?php for($i=0; $i<count($recommends); $i++): ?>
					<blockquote class="m4_t"><?php echo $recommends[$i]; ?></blockquote>
					<footer class="m1_t"><cite><?php echo $recommend_by[$i]; ?></cite></footer>
				<?php endfor; ?>
			</section>
		<?php endif; ?>

		<?php
		$events = get_available_events($post->ID);
		if($events): ?>
			<section class="contents">
				<h2 class="contents_title">関連イベント</h2>
				<ul class="list_posts">
				<?php foreach($events as $event):
					$place = get_post_meta($event->ID, "events_info_01", TRUE);
					$date = get_post_meta($event->ID, "events_info_09", TRUE); ?>
					<li>
						<h3><?php echo $event->post_title; ?></h3>
						<ul class="list_events_info">
							<li class="index place"><?php echo $place; ?></li>
							<li class="index date"><?php echo $date; ?></li>
						</ul>
					</li>
					<?php endforeach; ?>
				</ul>
			<p class="m2_t"><a href="<?php echo get_post_type_archive_link("events"); ?>">もっと詳しく</a></p>
			</section>
		<?php endif;?>

		<?php if($teaser): ?>
			<div class="contents">
				<h2 class="contents_title">予告編動画</h2>
				<div class="video">
					<?php echo $teaser; ?>
				</div>
			</div>
		<?php endif; ?>

		<?php if($movie): ?>
			<div class="contents">
				<h2 class="contents_title">映画本編</h2>
				<div class="video">
					<?php echo $movie; ?>
				</div>
			</div>
		<?php endif; ?>

		<div class="contents">
			<h2 class="contents_title">あらすじ</h2>
			<?php echo apply_filters('the_content', $post->post_content); ?>
		</div>

		<?php if($gallery_imgs): ?>
			<div class="contents slides">
				<h2 class="contents_title">フォトギャラリー</h2>
				<div class="owl-carousel">
					<?php foreach($gallery_imgs as $img):?>
						<div class="slide"><?php echo get_post_meta_img($img, "large", "preload"); ?></div>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>

	</div>

	<?php if($credits_indexs): ?>
		<div class="contents" id="credits">
			<h2 class="col col_9 last contents_title">制作クレジット<span class="inline-block caption1">（敬称略）</span></h2>
			<ul class="floating_grids">
			<?php for($i=0; $i<count($credits_indexs); $i++): ?>
				<li class="col col_3 grid_item">
					<h3><?php echo $credits_indexs[$i]; ?></h3>
					<?php echo $credits_contents[$i]; ?>
				</li>
			<?php endfor; ?>
			</ul>
		</div>
	<?php endif;?>

	<?php if($national_screenings || $global_screenings): ?>
		<div class="contents">
			<div class="col col_9 last">
				<h2 class="contents_title">映画祭上映履歴</h2>
				<?php if($national_screenings): ?>
					<h3>国内</h3>
					<ul class="m1_t">
					<?php for($i=0; $i<count($national_screenings); $i++): ?>
						<li><?php echo $national_screenings[$i]; ?></li>
					<?php endfor; ?>
					</ul>
				<?php endif; ?>
				<?php if($global_screenings): ?>
					<h3 class="m2_t">海外</h3>
					<ul class="m1_t">
					<?php for($i=0; $i<count($global_screenings); $i++): ?>
						<li><?php echo $global_screenings[$i]; ?></li>
					<?php endfor; ?>
					</ul>
				<?php endif; ?>
			</div>
		</div>
	<?php endif;?>

	<?php if($media_screenings): ?>
		<div class="contents">
			<div class="col col_9 last">
				<h2 class="contents_title">放映・劇場公開履歴</h2>
				<?php if($media_screenings): ?>
					<ul class="m1_t">
					<?php for($i=0; $i<count($media_screenings); $i++): ?>
						<li><?php echo $media_screenings[$i]; ?></li>
					<?php endfor; ?>
					</ul>
				<?php endif; ?>
			</div>
		</div>
	<?php endif;?>

	<?php if($related_infomation): ?>
		<div class="contents">
			<div class="col col_9 last">
				<h2 class="contents_title">関連情報<span class="inline-block caption1">（敬称略）</span></h2>
				<?php for($i=0; $i<count($related_infomation); $i++): ?>
					<div class="m2_b<?php echo $last_class; ?>"><?php echo $related_infomation[$i]; ?></div>
				<?php endfor; ?>
			</div>
		</div>
	<?php endif;?>

</div>

<script type="text/javascript">

	$(window).load(function(){

		$(".owl-carousel").owlCarousel({
			items: 1,
			autoHeight: true,
			lazyLoad:true,
			loop: true,
			dots: true,
			nav: true,
			navText: ["",""]
		});
	});

</script>
<?php get_footer(); ?>