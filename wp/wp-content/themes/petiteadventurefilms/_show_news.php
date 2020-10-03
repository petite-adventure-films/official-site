<?php
require_once("../../../wp-config.php");

$get_post_num = $_POST['getNum'];
$now_post_num = $_POST['nowNum'];

$next_now_post_num = $now_post_num + $get_post_num;
$next_get_post_num = $get_post_num + $get_post_num;

$args = array(
	"post_type" => "news",
	"post_status" => "publish",
	"orderby" => DATE,
	"order" => DESC,
	"posts_per_page" => $get_post_num,
	"offset" => $now_post_num,
);
$results = query_posts($args);

$args = array(
	"post_type" => "news",
	"post_status" => "publish",
	"orderby" => DATE,
	"order" => DESC,
	"posts_per_page" => $next_get_post_num,
	"offset" => $next_now_post_num
);
$next_results = query_posts($args);

$noDataFlg = 0;
if (count($results) < $get_post_num || !count($next_results)){
	$noDataFlg = 1;
}

$html = "";

foreach ($results as $result){
	$html .= "<li>".get_news($result)."</li>";
}

$returnObj = array(
	"html" => $html,
	"flg" => $noDataFlg
);
$returnObj = json_encode($returnObj);
echo $returnObj;
?>