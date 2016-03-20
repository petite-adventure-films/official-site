<?php get_header(); ?>

<div class="container">
<div class="single">

	<div id="main_visual">
		<div class="col col_9 last">
			<h1>
				一人ひとりの小さな“冒険”が<br />やがて世界を変えていく･･･
			</h1>
			<p class="m2_t">メインストリームのメディアでは取り上げられにくい課題を、
			マスメディアとはまったく異なる視点と手法で、
			大胆かつユニークに映像制作を行うプロダクションです。</p>
			<p id="play_video">Play video</p>
		</div>
		<div class="col col_3 btn priority2">
			<a href="<?php echo get_post_type_archive_link("events"); ?>">上映会･イベント</a>
		</div>
		<div class="col col_3 btn priority2">
			<a href="<?php echo get_post_type_archive_link("films"); ?>">映画</a>
		</div>
		<div class="col col_3 last btn priority1">
			<a href="<?php echo get_permalink(get_page_by_path("order_jp")); ?>">DVD購入</a>
		</div>
	<!--#main_visual--></div>

</div>
</div>

<div class="bg_white" id="sections">
<div class="container">
<div class="single">

	<?php
	$args = array(
		"post_type" => "news",
		"posts_per_page" => 1
	);
	$posts = query_posts($args);
	if($posts): ?>
		<section class="contents" id="latest">
			<div class="col col_9 last list_posts">
			<?php foreach($posts as $post): ?>
				<?php echo get_news($post); ?>
			<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>

	<?php
	$i = 1;
	$args = array(
		"post_type" => "films",
		"posts_per_page" => -1
	);
	$posts = query_posts($args);
	if($posts): ?>
		<div class="contents">
			<div class="col col_9 last">
			<ul class="owl-carousel list_films">
			<?php foreach($posts as $post): ?>
				<li>
					<a href="<?php echo get_permalink($post->ID); ?>">
						<div class="film_poster">
						<?php
						$poster_img = get_post_meta($post->ID, "films_info_00", TRUE);
						echo get_post_meta_img($poster_img, "medium", "lazyOwl", TRUE);
						?>
						</div>
						<p class="film_title"><?php echo $post->post_title; ?></p>
					</a>
				</li>
			<?php $i++; endforeach; ?>
			</ul>
			</div>
		</div>
	<?php endif; ?>

	<section class="contents">
		<div class="col_9 col last">
			<h2>プチ・アドベンチャー・フィルムズとは</h2>
			<p class="m2_t">メインストリームのメディアでは取り上げられにくいテーマを、マスメディアとは全く異なる視点と手法で、大胆かつユニークに映像制作を行うプロダクションです。このホームページでは、主に、インディペンデントのドキュメンタリー監督、早川由美子の作品紹介と上映情報などについてご紹介します。</p>
		</div>
	</section>

</div>
</div>
</div>

<script type="text/javascript">
	$(function(){

		$(".owl-carousel").owlCarousel({
			autoplay: true,
			lazyLoad : true,
			loop: true,
			dots: true,
			margin: 16,
			responsive: {
				0:{
					items: 2
				},
				960:{
					items: 3
				}
			}

		});

		var playButton = $("#play_video");
		playButton.bind("click", function(){
			$("#home_video").css("height", $("#player").height());
		});
	});

</script>



<?php get_footer(); ?>