<?php
/*
Template Name: Past events
*/
$year = wp_get_post_terms($post->ID, "eventsdate");
get_header(); ?>

<div class="single">

	<div class="col col_9 last">
		<header class="page_header">
			<nav class="crumbs">
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
						<span itemprop="title">HOME</span>
					</a>
				</div>
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<a href="<?php echo get_post_type_archive_link("events"); ?>">
						<span itemprop="title">上映会・イベント</span>
					</a>

				</div>
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
						<span itemprop="title"><?php echo $post->post_title; ?></span>
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
	</div>

	<div class="m7_t">
		<div class="col col_5">
			<ul class="list_archives_past border_on">
				<li><a href="<?php echo get_post_type_archive_link("events"); ?>">2018</a></li>
				<li<?php echo ($year[0]->slug == 2016) ? ' class="is_active"' : "";?>><a href="<?php echo get_permalink(get_page_by_path("events2017")); ?>">2017</a></li>
				<li<?php echo ($year[0]->slug == 2016) ? ' class="is_active"' : "";?>><a href="<?php echo get_permalink(get_page_by_path("events2016")); ?>">2016</a></li>
				<li<?php echo ($year[0]->slug == 2015) ? ' class="is_active"' : "";?>><a href="<?php echo get_permalink(get_page_by_path("events2015")); ?>">2015</a></li>
				<li<?php echo ($year[0]->slug == 2014) ? ' class="is_active"' : "";?>><a href="<?php echo get_permalink(get_page_by_path("events2014")); ?>">2014</a></li>
				<li<?php echo ($year[0]->slug == 2013) ? ' class="is_active"' : "";?>><a href="<?php echo get_permalink(get_page_by_path("events2013")); ?>">2013</a></li>
				<li<?php echo ($year[0]->slug == 2012) ? ' class="is_active"' : "";?>><a href="<?php echo get_permalink(get_page_by_path("events2012")); ?>">2012</a></li>
			</ul>
		</div>
	</div>

	<div class="col col_9 last">
		<?php echo get_events($year[0]->slug); ?>
	</div>

</div>

<?php get_footer(); ?>
