<?php
/*
Template Name: Order EN Confrim
*/

include (TEMPLATEPATH . '/_order_post.php');
get_header(); ?>

<div class="single">
<div class="col col_9 last">

	<header class="header_page">
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>" itemprop="url">
					<span itemprop="title">DVD Shop</span>
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

	<div class="m7_t" id="confirm">
		<?php include (TEMPLATEPATH . '/_order_en_form.php'); ?>
	</div>

</div>

<div class="m4_t">
<div class="col col_2">
	<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("order_en")); ?>">
		<?php foreach($_POST as $key => $value): ?>
			<input type="hidden" name="<?php echo $key; ?>" value="<?php echo $value; ?>">
		<?php endforeach; ?>
		<div class="form_btns">
			<div class="btn priority2"><input type="submit" value="Back" /></div>
		</div>
	</form>
</div>
<div class="col col_2">
	<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("order_en/thanks")); ?>">
		<?php foreach($_POST as $key => $value): ?>
			<input type="hidden" name="<?php echo $key; ?>" value="<?php echo $value; ?>">
		<?php endforeach; ?>
		<div class="form_btns">
			<div class="btn priority1"><input type="submit" value="Submit" /></div>
		</div>
	</form>
</div>
<div class="last"></div>
</div>

</div>

<?php get_footer(); ?>