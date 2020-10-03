<?php
$zipcode = $_GET['zipcode'] ?? '';
$zipcode = str_replace('-', '', $zipcode);

if (!is_numeric($zipcode)) {
	$zipcode = '';
}

header("Content-Type: text/plain; charset=utf-8");
echo file_get_contents('https://zipcloud.ibsnet.co.jp/api/search?zipcode=' . $zipcode);
