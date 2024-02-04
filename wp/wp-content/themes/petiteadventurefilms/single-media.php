<?php
get_header();

$post_type = get_post_type_object( get_query_var( 'post_type' ));
$term_link = get_post_type_archive_link($post_type->name);
$term_name = $post_type->label;

$media_name = get_post_meta($post->ID, "media_info_01", true);
$media_volume = get_post_meta($post->ID, "media_info_02", true);
$media_contents = get_post_meta($post->ID, "media_info_03", true);
$media_video = get_post_meta($post->ID, "media_info_04", TRUE);
$media_pdf_id = get_post_meta($post->ID, "media_info_05", true);

$article_title = get_post_meta($post->ID, "media_info_06", true);
$article_subtitle = get_post_meta($post->ID, "media_info_07", true);
$article_contents = get_post_meta($post->ID, "media_info_08", true);
?>

<div class="single">

	<div class="col col_9 last header_page">
		<nav class="crumbs" aria-label="Breadcrumb">
			<div class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div class="crumb">
				<a href="<?php echo $term_link; ?>" itemprop="url">
					<span itemprop="title"><?php echo $term_name; ?></span>
				</a>
			</div>
			<div class="crumb" aria-current="page">
				<a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
					<span itemprop="title">
					【<? echo $media_name; ?>】<? echo $media_volume; ?>掲載 <? echo $media_contents; ?>
					</span>
				</a>
			</div>
		</nav>
	<!--.header_page--></div>

	<div class="col col_9 last">

		<?php if($media_video): ?>
			<div class="video m2_t">
				<?php echo $media_video; ?>
			</div>
		<?php endif; ?>

		<?php if($media_pdf_id): ?>
			<?php $file = wp_get_attachment_url($media_pdf_id); ?>
			<div class="m2_t">
			<?php echo do_shortcode("[pdfviewer width='100%' height='480px' beta='true/false']".$file."[/pdfviewer]"); ?>
			</div>
		<?php endif; ?>

		<h1 class="media_info m1_t">
			<span class="inline-block index bookmark"><? echo $media_name; ?></span>
			<span class="inline-block index date"><? echo $media_volume; ?></span>
			<span class="inline-block index edit"><? echo $media_contents; ?></span>
		</h1>
		<div class="m1_t">
			<?php echo apply_filters('the_content', $post->post_content); ?>
		</div>

		<?php
		$filmtags = get_the_terms($post->ID, "filmtags");
		$film_label = get_film($filmtags, "label");
		$film_link = get_film($filmtags, "link");
		if($film_label){
			$film_info = '<span class="inline_block">';
			if($film_link){
				$film_info .= '<a href="'.$film_link.'">'.$film_label.'</a>';
			}else{
				$film_info .= $film_label;
			}
			$film_info .= '</span>';
		}else{
			$film_info = NULL;
		}?>
		<?php if($film_info): ?>
			<p class="index film"><?php echo $film_info; ?></p>
		<?php endif; ?>

		<?php
		$i = 1;
		$tags = get_the_tags();
		if($tags){
			foreach($tags as $tag){
				if($i > 1) $tag_info .= ", ";
				$tag_info .= '<span class="inline_block">';
				$tag_info .= $tag->name;
				$tag_info .= '</span>';
				$i++;
			}
		}else{
			$tag_info = NULL;
		}?>
		<?php if($tag_info): ?>
			<p class="index label"><?php echo $tag_info; ?></p>
		<?php endif; ?>


		<?php if($article_contents): ?>
		<div class="contents">
			<article class="media_article">
				<h1 class="title">
					<span class="block caption1">記事本文</span>
					<? echo $article_title; ?>
				</h1>
				<?php if($article_subtitle):?>
					<p><? echo $article_subtitle; ?></p>
				<?php endif; ?>
				<div class="m4_t">
					<?php echo $article_contents; ?>
				</div>
			</article>
		</div>
		<?php endif; ?>

	</div>


</div>

<?php get_footer(); ?>