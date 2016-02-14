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

$args = array(
	"orderby" => "slug",
	"order" => "DESC"
);
$eventsdates = get_terms("eventsdate", $args);
$eventsdates = (array)$eventsdates;

foreach($eventsdates as $k => $v){
	if($v->parent == 0){
		$dates[] = (array)$v;
	}
}

foreach($dates as $k => $v){
	$years[$k]["year"] = $v["name"];
	foreach($eventsdates as $sk => $sv){
		$sv = (array)$sv;
		if($v["term_id"] == $sv["parent"]){
			$years[$k]["months"][$sk] = $sv;
		}
	}
}


$now = date("Ym");
get_header(); ?>

<div class="single">

	<div class="col col_7">

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

		<ul class="list_posts" id="contents_events">
			<?php echo get_events($now, TRUE); ?>
		</ul>

	</div>

	<div class="col col_1 last al_r">
		<ul class="list_archives">
			<?php
			foreach($years as $term){
				echo '<li>';
				echo '<span class="inline_block open_contents">'.$term["year"].'</span>';
				$months = $term["months"];
				if($months){
					echo '<ul class="show_contents">';
					foreach ($months as $key => $value){
						$key_id[$key] = $value['slug'];
					}
					array_multisort($key_id , SORT_ASC , $months);
					foreach($months as $month){
						echo '<li class="archive" data-tab="'.$month["slug"].'">'.$month["name"]."</li>";
					}
					echo "</ul>";
				}
				echo "</li>";
				$key_id = array();
			}?>
		</ul>
	</div>

</div>

<script type="text/javascript">
$(document).ready(function(){
	$(".archive").on("click", function(){
		var term = $(this).attr("data-tab");
		$.ajax({
			type: 'post',
			url: '<?php echo bloginfo("template_url"); ?>/_show_events.php',
			data: {
				date: term
			},
			success: function(data){
				data = JSON.parse(data);
				$("#contents_events").hide().html(data["html"]).fadeIn();
			}
		});
	});
});
</script>

<?php get_footer(); ?>