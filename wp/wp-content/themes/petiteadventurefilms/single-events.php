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
					<?php $post_type = get_post_type_object( get_query_var('post_type' )); ?>
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

	<?php
		$filmtags = get_the_terms($post->ID, "filmtags");
			$film_label = get_film($filmtags, "label");
			$film_link = get_film($filmtags, "link");
			if($film_label){
				$film_info = '<span class="inline_block index film">';
				if($film_link){
					$film_info .= '<a href="'.$film_link.'">'.$film_label.'</a>';
				}else{
					$film_info .= $film_label;
				}
				$film_info .= '</span>';
			}else{
				$film_info = NULL;
			}

			$eventtags = get_the_terms($post->ID, "eventtags");
			if($eventtags){
				foreach($eventtags as $event){
					$event_info = '<span class="inline_block index label">';
					$event_info .= $event->name;
					$event_info .= '</span>';
				}
			}else{
				$event_info = NULL;
			}

			$list_post_info = NULL;
			if($film_info || $event_info){
				$list_post_info .= '<ul class="list_post_info">';
				$list_post_info .=  ($film_info) ? '<li>'.$film_info.'</li>' : "";
				$list_post_info .=  ($event_info) ? '<li>'.$event_info.'</li>' : "";
				$list_post_info .= '</ul>';
			}else{
				$list_post_info = NULL;
			}

			$place = get_post_meta($post->ID, "events_info_01", TRUE);
			$address = get_post_meta($post->ID, "events_info_02", TRUE);
			$map = get_post_meta($post->ID, "events_info_03", TRUE);
			//$address_code = urlencode(get_post_meta($post->ID, "events_info_02", TRUE));
			//$gmap = "http://maps.google.co.jp/maps?q=".$address_code;
			if($place){
				$place_list = '<li class="index place">';
				if($map){
					$place_list .= $place;
					$place_list .= '<span class="block">'.$address.'  <a href="'.$map.'" target="_blank">Map</a></span>';
				}else{
					$place_list .= $place;
					$place_list .= '<span class="block">'.$address.'</span>';
				}
				$place_list .= '</li>';
			}else{
				$place_list = NULL;
			}

			$access_details = get_post_meta($post->ID, "events_info_04", TRUE);
			if($access_details) $access = '<li class="index flag">'.$access_details.'</li>';
			else $access = NULL;

			$dates_details = get_post_meta($post->ID, "events_info_09", TRUE);
			if($dates_details) $dates = '<li class="index date">'.$dates_details.'</li>';
			else $dates = NULL;

			$fee_details = get_post_meta($post->ID, "events_info_13", TRUE);
			if($fee_details) $fee = '<li class="index fee">'.$fee_details.'</li>';
			else $fee = NULL;

			$appendix_contents = get_post_meta($post->ID, "events_info_06", TRUE);
			$appendix = ($appendix_contents) ? '<li class="index appendix">'.$appendix_contents.'</li>' : "";

			$post_title = get_post_number($post).$post->post_title;
			$post_date = get_the_date("", $post->ID);
			$post_date_time = get_the_date("Y-m-d h:i:s A");

			$html .= <<<EOF


		{$list_post_info}
		<ul class="list_events_info">
			{$place_list}
			{$access}
			{$dates}
			{$time}
			{$fee}
			{$appendix}
		</ul>
		<time datetime="{$post_date_time}" class="block m7_t caption1 list_post_time">{$post_date}掲載</time>
EOF;

echo $html;
?>
</div>
</div>

<?php get_footer(); ?>