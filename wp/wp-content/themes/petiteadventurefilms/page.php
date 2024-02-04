<?php
$contents = apply_filters('the_content', $post->post_content);
get_header(); ?>

<div class="single">

	<div class="col col_9 last">

		<header class="header_page">
			<nav class="crumbs" aria-label="Breadcrumb">
				<div class="crumb">
					<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
						<span itemprop="title">HOME</span>
					</a>
				</div>
				<div class="crumb" aria-current="page">
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

		<div class="m7_t">
			<?php echo $contents; ?>
		</div>

	</div>

</div>

<?php get_footer(); ?>