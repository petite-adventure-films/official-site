<?php get_header(); ?>
<?php
$file = get_bloginfo("template_url")."/assets/csv/ScreeningExport.csv";
$fp = fopen($file, "r");
while (($data = fgetcsv($fp, 0, ",")) !== FALSE) {
	$csv[] = $data;
}
fclose($fp);

foreach($csv as $arr){

	var_dump($arr);

	$postarr = array(
		"post_type" => "events",
		"post_title" => $arr[3],
		"post_date" => $arr[4],
		"post_status" => "publish"
	);
	$post = wp_insert_post($postarr);
	update_post_meta($post, "events_info_01", $arr[5]); //開催地
	update_post_meta($post, "events_info_09", $arr[0]."<br />".$arr[7]); //日程について
	update_post_meta($post, "events_info_13", $arr[8]); //入場料について
	update_post_meta($post, "events_info_06", $arr[9]); //備考

	wp_set_object_terms($post, $arr[1], "eventsdate", $append = true);
	wp_set_object_terms($post, $arr[2], "eventsdate", $append = true);
}

//var_dump($csv);

/*$postarr = array(
	"post_type" => "news",
	"post_title" => "test",
	"post_date" => "2016-01-03",
	'post_status'   => 'publish',
	'post_author'   => 1,
	"post_content" => "test"
);
var_dump(wp_insert_post($postarr, true));*/

?>

<?php get_footer(); ?>