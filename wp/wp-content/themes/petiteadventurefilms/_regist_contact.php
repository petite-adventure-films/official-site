<?php

require_once("../../../wp-config.php");

if($_POST){

	date_default_timezone_set('Asia/Tokyo');

	$contact_kind = $_POST["contact_kind"];
	$contact_name = $_POST["contact_name"];
	$contact_email = $_POST["contact_email"];
	$contact_contents = $_POST["contact_contents"];

	$submitdate = date("mdH", time());
	$post_type = "inquiry";
	$post_title = cms_title($post_type, $submitdate);

	$insert = array(
		'post_status' => 'pending',
		'post_title' => $post_title,
		'post_content' => $contact_contents,
		'comment_status' => 'closed',
		'post_type' => $post_type
	);
	$insert_id = wp_insert_post($insert);

	if($insert_id){

		add_post_meta($insert_id, 'contactInfo1', $contact_name);
		add_post_meta($insert_id, 'contactInfo2', $contact_email);
		wp_set_object_terms($insert_id, $contact_kind, 'contactkinds', $append = true);

		switch ($contact_kind) {
			case 'kind3':
				$contact_kind = "商品について";
				break;
			case 'kind2':
				$contact_kind = "各種サービスについて";
				break;
			case 'kind1':
				$contact_kind = "展示会について";
				break;
			case 'kind0':
				$contact_kind = "その他";
				break;
			default:
				break;
		}

		$values = array(
			'contact_kind' => $contact_kind,
			'contact_name' => $contact_name,
			'contact_email' => $contact_email,
			'contact_contents' => $contact_contents
		);
		contact_ntfct($contact_email, $values);

	}

	$msg = <<<EOF
<p class="success">お問い合わせありがとうございました。 <br />
担当者より折り返しご連絡を差し上げますので、しばらくお待ちください。 </p>
EOF;

}else{

	$msg = <<<EOF
<p class="error">予期せぬエラーが発生したため、処理を中止しました。<br />
しばらくしてからもう一度お試しください。</p>
EOF;

}

$returnObj = array(
	"msg" => $msg
);
$returnObj = json_encode($returnObj);
echo $returnObj;
?>