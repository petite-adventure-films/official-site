<?php
if(is_post_type_archive()){
	$post_type = get_post_type_object(get_query_var("post_type"));
	$termLink = get_post_type_archive_link($post_type->name);
	$termName = $post_type->label;
}elseif(is_category() || is_tag() || is_tax()){
	$cat = get_the_category();
	$cat = $cat[0];
	$termLink = get_term_link($cat);
	$termName = $cat->name;
}

$now = date("Ym");
$thisyear = array();
$args = array(
	"orderby" => "slug",
	"order" => "DESC"
);
$eventsdates = get_terms("eventsdate", $args);
$eventsdates = (array)$eventsdates;
foreach($eventsdates as $k => $v){
	if($v->slug == substr($now, 0, 4)){
		$thisyear = $v;
	}
}
if(!empty($thisyear)){
	foreach($eventsdates as $k => $v){
		$v = (array)$v;
		if($thisyear->term_id == $v["parent"]){
			$months[$k] = $v;
		}
	}
}


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
					<a href="<?php echo $termLink; ?>" itemprop="url">
						<span itemprop="title"><?php echo $termName; ?></span>
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

	<div class="m4_t">
		<div class="col col_4">
			<ul class="list_archives">
				<li><?php echo substr($now, 0, 4); ?></li>
				<li class="show_contents tab" data-tab="tab_latest">最新</li>
				<?php
					if($months){
						foreach ($months as $key => $value){
							$key_id[$key] = $value['slug'];
						}
						array_multisort($key_id , SORT_ASC , $months);
						foreach($months as $month){
							echo '<li class="show_contents tab" data-tab="tab_'.$month["slug"].'">'.mb_substr($month["name"], 5)."</li>";
						}
					}
					$key_id = array();
				?>
			</ul>
		</div>
		<div class="col col_5 last al_r show_wider">
			<ul class="list_archives_past">
<!-- 				<li><a href="<?php echo get_permalink(get_page_by_path("events2020 ")); ?>">2020</a></li> -->
				<li><a href="<?php echo get_permalink(get_page_by_path("events2019 ")); ?>">2019</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2018 ")); ?>">2018</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2017 ")); ?>">2017</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2016 ")); ?>">2016</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2015")); ?>">2015</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2014")); ?>">2014</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2013")); ?>">2013</a></li>
				<li><a href="<?php echo get_permalink(get_page_by_path("events2012")); ?>">2012</a></li>
			</ul>
		</div>
	</div>

	<div class="col col_9 last">
		<section class="tab_contents" id="tab_latest">
			<?php echo get_events($now, TRUE); ?>
		</section>
		<?php if(!empty($months)):
		foreach($months as $month): ?>
			<section class="tab_contents" id="tab_<?php echo $month["slug"]; ?>">
			<?php echo get_events($month["slug"]); ?>
			</section>
		<?php endforeach; endif; ?>
	</div>

	<aside class="contents m4_t show_smaller list_archives_past_smaller">
		<h3>過去のイベントはこちらから</h3>
	</aside>

</div>

<?php get_footer(); ?>

<script>

	$(function(){

		$(".tab_contents").hide();
		$(".tab_contents:nth-of-type(1)").show();
		$(".tab:first").addClass("is_active");
		$(".show_contents").on("click", function(){
			var tabId = $(this).attr("data-tab");
			var contents = $("#" + tabId);
			var display = contents.css("display");
			if(display == "none"){
				$(".tab_contents").fadeOut();
				contents.fadeIn().slideDown();
				$(".show_contents").removeClass("is_active");
				$(this).addClass("is_active");
			}
		});

		var past_list = $(".list_archives_past").clone();
		past_list.addClass("border_on m2_t");
		past_list.appendTo($(".list_archives_past_smaller"));

	});

</script>
