<?php
$cat = get_queried_object();
$termLink = get_term_link($cat->term_id);
$termName = $cat->name;
get_header(); ?>

<div class="col col_8">

	<header class="page_header">
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
				printf( __("日別アーカイブ: %s"), get_the_date());
			}elseif(is_month()){
				printf( __("月別アーカイブ: %s"), get_the_date("Y年n月"));
			}elseif(is_year()){
				printf( __("年別アーカイブ: %s"), get_the_date("Y年"));
			}elseif(is_post_type_archive()){
				$post_type = get_post_type_object( get_query_var( "post_type" ));
				echo $post_type->label;
			}elseif(is_category() || is_tag() || is_tax()){
				single_term_title("", true);
			}else{
				the_title();
			}?>
		</h1>
	<!--.header_page--></header>

	<?php
	$paged = get_query_var('paged')? get_query_var('paged') : 1;
	$the_query = new WP_Query(array(
		'post_type' => 'post',
		'posts_per_page' => 10,
		 'paged' => $paged,
		'post_status' => 'publish',
	));
	if($the_query->have_posts()): ?>
		<ul class="list_posts list_blogs">
			<?php while($the_query->have_posts()): $the_query->the_post(); ?>
				<li><?php echo get_blogs($post); ?></li>
			<?php endwhile; ?>
		</ul>
	<?php else:?>
		<div class="m4_t">
			<p>準備中です。更新まで今しばらくお待ち下さい。</p>
		</div>
	<?php endif;?>
	<?php if(function_exists("wp_pagenavi")){wp_pagenavi(array('query'=>$the_query));} wp_reset_postdata();?>

</div>
<div class="col col_3 last" id="sidebar">
	<ul>
		<?php dynamic_sidebar();?>
	</ul>
</div>

<?php get_footer(); ?>