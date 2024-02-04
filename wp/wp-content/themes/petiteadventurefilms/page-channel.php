<?php
if(is_post_type_archive()){
	$post_type = get_post_type_object( get_query_var( 'post_type' ));
	$termLink = get_post_type_archive_link($post_type->name);
	$termName = $post_type->label;
}elseif(is_category() || is_tag() || is_tax()){
	$cat = get_the_category();
	$cat = $cat[0];
	$termLink = get_term_link($cat);
	$termName = $cat->name;
}
get_header(); ?>

<div class="single">

	<header class="col col_9 last page_header">
		<nav class="crumbs" aria-label="Breadcrumb">
			<div class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div class="crumb" aria-current="page">
                <a href="<?php echo get_permalink(get_page_by_path("channel")); ?>" itemprop="url">
					<span itemprop="title">チャンネル</span>
				</a>
			</div>
		</nav>
		<h1>
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

	<div class="col col_9 last">
	<p class="m7_t">これまでにYouTubeで公開した映像の中から、厳選した動画をご紹介します。</p>
	プチ・アドベンチャー・フィルムズの<span class="icon icon-youtube"><span class="display-none">YouTube</span></span>全動画は<a href="https://www.youtube.com/user/petiteadventurefilms" rel="nofollow" target="_blank">こちら</a>から
	</div>

	<?php
	$i = 1;
	$args = array(
		"post_type" => "channel",
		"posts_per_page" => -1
	);
	$posts = query_posts($args);
	if($posts): ?>
		<ul class="list_channel archive">
		<?php foreach($posts as $post): ?>
			<li class="col col_3<?php echo ($i % 3) ? "" : " last"; ?>">
				<a href="<?php echo get_permalink($post->ID); ?>">
					<?php $thumbnail = get_post_meta($post->ID, "video_info_00", TRUE); ?>
					<?php $running_time = get_post_meta($post->ID, "video_info_04", TRUE); ?>
					<div class="video_thumbnail">
						<img src="http://i.ytimg.com/vi/<? echo $thumbnail; ?>/mqdefault.jpg" alt="" />
						<p class="running_time"><? echo $running_time; ?></p>
					</div>
					<p class="m1_t video_title"><?php echo get_the_title($post->ID); ?></p>
				</a>
			</li>
		<?php $i++; endforeach; ?>
		</ul>
	<?php else: ?>
		<p class="col col_9 last m7_t">
		ただいまコンテンツ準備中です。
		</p>
	<?php endif; ?>
	<div class="last"></div>

</div>

<?php get_footer(); ?>