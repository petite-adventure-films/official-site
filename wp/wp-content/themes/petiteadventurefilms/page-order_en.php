<?php
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

		<p>Welcome to the online DVD Shop!<p>
		<p>To order, please fill in the form below. Within a few days, you will receive instructions on how to pay securely via PayPal.</p>

		<dl class="m2_t list_definition">
			<dt>DVD format</dt>
			<dd>DVD-R, Region 0 (free), NTSC/PAL available.</dd>
			<dt>DVD types</dt>
			<dd>For Home use/For Library use. Please choose "Library" if you purchase for group/library use.</dd>
		</dl>

		<p class="m2_t">Postage & packing prices</p>
		<p>Postage & packing prices are dependant on country and speed of delivery.</p>
		<dl class="list_definition">
			<dt>To Asia</dt>
			<dd>Registered JP ¥740 / Registered Express JP ¥900</dd>
			<dt>To North America/Europe</dt>
			<dd>Registered JP ¥810 / Registered Express JP ¥1,500</dd>
			<dt>To South America/Africa</dt>
			<dd>Registered JP ¥890 / Registered Express JP ¥1,700 </dd>
		</dl>

		<p class="m4_t pink">* Required</p>
		<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("order_en/confirm")); ?>" id="order" class="m1_t">
			<?php include (TEMPLATEPATH . "/_order_en_form.php"); ?>
			<div class="form_btns m4_t"><div class="btn priority1"><input type="submit" id="send" value="Confirm" /></div></div>
		</form>

	</div>

</div>
</div>

<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/assets/js/form_order.js"></script>
<?php get_footer(); ?>