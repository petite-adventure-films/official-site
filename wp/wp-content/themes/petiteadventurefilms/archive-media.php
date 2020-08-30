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
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo $termLink; ?>" itemprop="url">
					<span itemprop="title"><?php echo $termName; ?></span>
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

	<?php
	$args = array(
		"post_type" => "media",
		"posts_per_page" => -1
	);
	$posts = query_posts($args);
	if($posts): ?>
		<ul class="col col_9 last list_posts list_events">
		<?php foreach($posts as $post):
			$media_name = get_post_meta($post->ID, "media_info_01", true);
			$media_volume = get_post_meta($post->ID, "media_info_02", true);
			$media_contents = get_post_meta($post->ID, "media_info_03", true);
			$media_video = get_post_meta($post->ID, "media_info_04", true);
			$media_pdf_id = get_post_meta($post->ID, "media_info_05", true);
			$media_pdf_thumb = get_post_meta($post->ID, "media_info_09", true); ?>
			<li>
				<a href="<?php echo get_permalink($post->ID); ?>">
					<?php echo get_the_title($post); ?>
				</a>
			</li>
		<?php endforeach; ?>
		</ul>
	<?php else: ?>
		<p class="col col_9 last m7_t">
		ただいまコンテンツ準備中です。
		</p>
	<?php endif; ?>
	<div class="last"></div>

</div>

<?php get_footer(); ?>