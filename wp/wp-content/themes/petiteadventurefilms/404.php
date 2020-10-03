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
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink($post->ID) ?>" itemprop="url">
					<span itemprop="title">お探しのページが見つかりません。</span>
				</a>
			</div>
		</nav>
		<h1 class="m5_b">
			お探しのページが見つかりません。
		</h1>
	<!--.header_page--></header>


	<p>
		URLに間違いがないかもう一度ご確認ください。 <br />
		もしくはページが一時的にアクセスができない状況にあるか、
		移動もしくは削除された可能性があります。
	</p>
	<ul class="m1_t">
		<li><a href="<?php echo get_bloginfo("siteurl"); ?>"><?php echo bloginfo("site_name"); ?> TOP</a></li>
		<li><a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a></li>
	</ul>

</div>
</div>

<?php get_footer(); ?>