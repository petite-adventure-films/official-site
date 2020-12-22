<?php get_header();?>

<div class="single">
<?
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

?>
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


    <router-view
    ></router-view>
    <div class="clear"></div>

<!-- .single --></div>

<?php get_footer('vue'); ?>  

<!-- #app --></div>

<?php wp_footer(); ?>
<script type="text/javascript" src="<?php echo get_template_directory_uri().'/dist/events.js?'.filemtime(get_stylesheet_directory().'/dist/pafshop.js'); ?>"></script>

</body>
</html>
