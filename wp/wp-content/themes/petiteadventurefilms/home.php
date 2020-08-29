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
	$news_posts = query_posts($args);
	if($news_posts): ?>
		<section class="contents" id="latest">
			<div class="col col_9 last list_posts">
				<span class="block caption1">NEWS</span>
				<?php foreach($news_posts as $news): ?>
					<?php echo get_news($news); ?>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif;?>

	<?php
	$args = array(
		"posts_per_page" => 1
	);
	$blogs = query_posts($args);
	if($blogs): ?>
		<section class="contents" id="latest">
			<div class="col col_9 last list_posts">
				<span class="block caption1">BLOG</span>
				<?php foreach($blogs as $blog): ?>
					<?php echo get_blogs($blog); ?>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif;?>

	<?php
	$i = 1;
	$args = array(
		"post_type" => "films",
		"posts_per_page" => -1
	);
	$films = query_posts($args);
	if($films): ?>
		<div class="contents">
			<div class="col col_9 last">
			<ul class="owl-carousel-film list_films">
			<?php foreach($films as $film): ?>
				<li>
					<a href="<?php echo get_permalink($film->ID); ?>">
						<div class="film_poster">
						<?php
						$poster_img = get_post_meta($film->ID, "films_info_00", TRUE);
						echo get_post_meta_img($poster_img, "medium", "owl-lazy", TRUE);
						?>
						</div>
						<p class="film_title"><?php echo $film->post_title; ?></p>
					</a>
				</li>
			<?php $i++; endforeach; ?>
			</ul>
			</div>
		</div>
	<?php endif;?>

	<?php
	$i = 1;
	$args = array(
		"post_type" => "channel",
		"posts_per_page" => -1
	);
	$videos = query_posts($args);
	if($videos): ?>
		<div class="contents">
			<div class="col col_9 last">
			<ul class="owl-carousel-channel list_channel">
			<?php foreach($videos as $video): ?>
				<li>
					<a href="<?php echo get_permalink($video->ID); ?>">
						<?php $thumbnail = get_post_meta($video->ID, "video_info_00", TRUE); ?>
						<?php $running_time = get_post_meta($video->ID, "video_info_04", TRUE); ?>
						<div class="video_thumbnail">
							<img src="http://i.ytimg.com/vi/<? echo $thumbnail; ?>/mqdefault.jpg" alt="" />
							<p class="running_time"><? echo $running_time; ?></p>
						</div>
						<p class="m1_t video_title"><?php echo get_the_title($video->ID); ?></p>
					</a>
				</li>
			<?php $i++; endforeach; ?>
			</ul>
			</div>
		</div>
	<?php endif;?>


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

	var player;
	var videoID="b4Q1CVO_VVE";

	function fGetScript(){
		$.ajax({
			url:"https://www.youtube.com/player_api/",
			dataType:"script",
			success:function(data){
			},
			error:function(xhr, status, thrown) {
				fGetScript();
			}
		});
	};
	fGetScript();

	function loadPlayer(videoID){
		player = new YT.Player(
			"player",{
				videoId: videoID,
				playerVars: {
					"rel": 0,
					"showinfo": 0,
					"controls": 1
				}
			}
		);
	};
	function playPlayer(){
		player.playVideo();
	};
	function stopPlayer(){
		player.stopVideo();
	};

	var playButton = $("#play_video");
	playButton.bind("click", function(){
		$(".overlay").fadeIn('fast');
		$("#home_video").fadeIn('fast');
	});
	$(".overlay").bind("click", function(){
		$("#home_video").fadeOut('fast');
		stopPlayer();
	});

	window.onYouTubeIframeAPIReady = function(){
		loadPlayer(videoID);
	};


	$(function(){

		$(".owl-carousel-film").owlCarousel({
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


		$(".owl-carousel-channel").owlCarousel({
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
					items: 4
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