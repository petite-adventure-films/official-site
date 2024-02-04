<?php
$contents = apply_filters('the_content', $post->post_content);
get_header(); ?>

<div class="single">

	<div class="col col_6">

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

		<div class="subhead2 m7_t subhead1">
			<p>早川由美子（はやかわゆみこ）<br />
				ドキュメンタリー監督</p>
		</div>

	</div>

	<div class="col col_3 last">
		<div id="director_profile_img">
			<img src="<?php echo bloginfo("template_url"); ?>/assets/img/director_img_01.jpg" alt="" />
		</div>
	</div>

	<div class="col col_9 last">
		<div class="contents">
			<?php echo $contents; ?>
		</div>
		<section class="contents" id="director_history">
			<h2 class="contents_title">Filmography</h2>
			<dl>
			<?php
			$pre = "";
			$args= array(
				"post_type" => "films",
				"posts_per_type" => -1,
				"orderby" => "films_info_03",
				"order" => "DESC"
			);
			$films = query_posts($args);
			foreach($films as $film): ?>
				<?php
				$year = get_post_meta($film->ID, "films_info_03", TRUE);
				if($pre != $year) echo '<dt>'.$year.'</dt>'; ?>
				<dd>
					<p><?php echo get_the_title($film->ID); ?></p>
					<p class="caption1">
						<?php echo get_post_meta($film->ID, "films_info_01", TRUE); ?> /
						<?php echo get_post_meta($film->ID, "films_info_02", TRUE); ?> /
						<?php echo get_post_meta($film->ID, "films_info_04", TRUE); ?>
					</p>
				</dd>
				<?php $pre = $year; ?>
			<?php endforeach; ?>
			</dl>
		</section>
	</div>

</div>

<?php get_footer(); ?>