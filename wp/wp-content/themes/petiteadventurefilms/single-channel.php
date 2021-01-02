<?php
get_header();

$post_type = get_post_type_object( get_query_var( 'post_type' ));
$term_link = get_post_type_archive_link($post_type->name);
$term_name = $post_type->label;

$country = get_post_meta($post->ID, "video_info_03", TRUE);
$year = get_post_meta($post->ID, "video_info_02", TRUE);
$running_time = get_post_meta($post->ID, "video_info_04", TRUE);
$basic_info = array($country, $year, $running_time);
$basic_info = array_filter($basic_info, "strlen");

$video = get_post_meta($post->ID, "video_info_01", TRUE);

?>

<div class="single">

	<div class="col col_9 last header_page">
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink(get_page_by_path("channel")); ?>" itemprop="url">
					<span itemprop="title">チャンネル</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
					<span itemprop="title"><?php echo $post->post_title; ?></span>
				</a>
			</div>
		</nav>
	<!--.header_page--></div>

	<div class="col col_9 last">

		<?php if($video): ?>
			<div class="video m2_t">
				<?php echo $video; ?>
			</div>
		<?php endif; ?>

		<h1 class="m2_t body1">
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

		<?php if($basic_info): ?>
			<p><?php echo implode(" / ", $basic_info); ?></p>
		<?php endif; ?>

		<div class="m2_t">
			<?php echo apply_filters('the_content', $post->post_content); ?>
		</div>

		<?php
		$filmtags = get_the_terms($post->ID, "filmtags");
		$film_label = get_film($filmtags, "label");
		$film_link = get_film($filmtags, "link");
		if($film_label){
			$film_info = '<span class="inline_block">';
			if($film_link){
				$film_info .= '<a href="'.$film_link.'">'.$film_label.'</a>';
			}else{
				$film_info .= $film_label;
			}
			$film_info .= '</span>';
		}else{
			$film_info = NULL;
		}?>
		<?php if($film_info): ?>
			<p class="index film"><?php echo $film_info; ?></p>
		<?php endif; ?>

		<?php
		$i = 1;
		$tags = get_the_tags();
		if($tags){
			foreach($tags as $tag){
				if($i > 1) $tag_info .= ", ";
				$tag_info .= '<span class="inline_block">';
				$tag_info .= $tag->name;
				$tag_info .= '</span>';
				$i++;
			}
		}else{
			$tag_info = NULL;
		}?>
		<?php if($tag_info): ?>
			<p class="index label"><?php echo $tag_info; ?></p>
		<?php endif; ?>

		<div class="contents">

		<?php
		$i = 1;
		$args = array(
			"post_type" => "channel",
			"posts_per_page" => -1,
			"post__not_in" => array($post->ID),
		);
		$videos = query_posts($args);
		if($videos): ?>
			<ul class="owl-carousel list_channel">
			 <?php foreach($videos as $video): ?>
				<li>
					<a href="<?php echo get_permalink($video->ID); ?>">
						<?php $thumbnail = get_post_meta($video->ID, "video_info_00", TRUE); ?>
						<?php $running_time = get_post_meta($video->ID, "video_info_04", TRUE); ?>
						<div class="video_thumbnail">
						<img src="http://i.ytimg.com/vi/<? echo $thumbnail; ?>/mqdefault.jpg" alt="<?php echo get_the_title($video->ID); ?>" />
						<p class="running_time"><? echo $running_time; ?></p>
						</div>
					</a>
				</li>
			<?php endforeach; ?>

			</ul>
		<?php endif; ?>

		</div>

	</div>

</div>

<script type="text/javascript">

	$(window).load(function(){

		$(".owl-carousel").owlCarousel({
			autoplay: true,
			lazyLoad : true,
			loop: true,
			dots: true,
			margin: 16,
			autoHeight: true,
			responsive: {
				0:{
					items: 2
				},
				960:{
					items: 4
				}
			}
		});

	});

</script>
<?php get_footer(); ?>