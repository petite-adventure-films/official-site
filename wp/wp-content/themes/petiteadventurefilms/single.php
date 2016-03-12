<?php

//vars of cat
$cats = get_the_category($post->ID);
if($cats){
	$cat_id = $cats[0]->term_id;
	$cat_name = $cats[0]->name;
	$cat_slug = $cats[0]->slug;
	$cat_url = get_category_link($cats[0]->term_id);
}

get_header();?>

<div class="single">
<div class="col col_9 last">

	<header class="header_page">
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<?php if($cat_id): ?>
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<a href="<?php echo get_category_link($cat_id); ?>" itemprop="url">
						<span itemprop="title"><?php echo $cat_name; ?></span>
					</a>
				</div>
			<?php else: ?>
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<?php $post_type = get_post_type_object( get_query_var( 'post_type' )); ?>
					<a href="<?php echo get_post_type_archive_link($post_type->name); ?>">
						<span itemprop="title"><?php echo $post_type->label; ?></span>
					</a>

				</div>
			<?php endif; ?>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink($post->ID) ?>" itemprop="url">
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

	<?php echo apply_filters('the_content', $post->post_content); ?>

</div>
</div>

<?php get_footer(); ?>