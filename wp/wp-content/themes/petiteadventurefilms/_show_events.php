<?php
require_once("../../../wp-config.php");

$term = $_POST["date"];

$html = get_events($term);
$returnObj = array(
	"html" => $html
);
$returnObj = json_encode($returnObj);
echo $returnObj;
?>