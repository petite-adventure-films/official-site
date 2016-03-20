<?php

//header cleaner
/*remove_action( 'wp_head', 'feed_links_extra');
remove_action( 'wp_head', 'feed_links');
remove_action( 'wp_head', 'rsd_link');
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'index_rel_link' );
remove_action( 'wp_head', 'parent_post_rel_link', 10);
remove_action( 'wp_head', 'start_post_rel_link', 10);
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10);
remove_action( 'wp_head', 'wp_generator');*/

//スマートフォンキャリア判別
function is_smartphone(){
	$useragents_s = array(
		'iPhone',		 // Apple iPhone
		'iPod',			 // Apple iPod touch
		'Android',		// 1.5+ Android
		'dream',			// Pre 1.5 Android
		'CUPCAKE',		// 1.5+ Android
		'blackberry9500', // Storm
		'blackberry9530', // Storm
		'blackberry9520', // Storm v2
		'blackberry9550', // Storm v2
		'blackberry9800', // Torch
		'webOS',			// Palm Pre Experimental
		'incognito',		// Other iPhone browser
		'webmate'		 // Other iPhone browser
	);
	$pattern_s = '/'.implode('|', $useragents_s).'/i';
	$ua_mobile = preg_match( '/Mobile/', $_SERVER['HTTP_USER_AGENT'] );
	if($ua_mobile == 1){
		return preg_match($pattern_s, $_SERVER['HTTP_USER_AGENT']);
	}
}

function IEbrowserVer(){
	$ver = "";
	$agent = getenv( "HTTP_USER_AGENT" );

	if(strstr($agent,"MSIE")){
		$ver .= "msie ";
		if(strstr($agent, "MSIE 6.0")) $ver .= "ie6";
		if(strstr($agent, "MSIE 7.0")) $ver .= "ie7";
		if(strstr($agent, "MSIE 8.0")) $ver .= "ie8";
		if(strstr($agent, "MSIE 9.0")) $ver .= "ie9";
	}
	return $ver;
}

function get_post_meta_arr($post, $meta){

	global $wpdb;
	$query = "SELECT meta_id, post_id,meta_key,meta_value FROM $wpdb->postmeta WHERE post_id = $post ORDER BY meta_id ASC";
	$cf = $wpdb->get_results($query, ARRAY_A);
	foreach( $cf as $row ){
		if($row['meta_key'] == $meta){
			if(!empty($row['meta_value'])) $vars[] = $row['meta_value'];
		}
	}
	return $vars;

}

function get_post_meta_img($attached, $size="medium", $class=NULL, $data_src=NULL){

	$image = wp_get_attachment_image_src($attached, $size);
	list($src, $width, $height) = $image;
	$attrs = array(
		"src" => $src,
		"width" => $width,
		"height" => $height,
		"id" => $id,
		"class" => $class,
		"alt" => $alt
	);
	if($data_src) $attrs["data-src"] = $src;
	if($src){
		$html = "<img";
		foreach($attrs as $key=>$value){
			if($value) $html .= ' '.$key.'="'.$value.'"';
		}
		$html .= " />";
	}
	return ($html) ? $html : FALSE;

}

function get_post_meta_img_arr($post, $meta, $size){

	global $wpdb;
	$query = "SELECT meta_id, post_id,meta_key,meta_value FROM $wpdb->postmeta WHERE post_id = $post ORDER BY meta_id ASC";
	$cf = $wpdb->get_results($query, ARRAY_A);
	foreach($cf as $row){
		if($row['meta_key'] == $meta){
			var_dump($row);
			$html[] = get_post_meta_img($post, $meta, $size);
			var_dump($html);
		}
	}
	if($html){
		$html = array_filter($html, "strlen");
		$html = array_values($html);
	}
	return ($html) ? $html : FALSE;

}

function get_film($term, $index=NULL){

	if($term){
		$args = array(
			"post_type" => "films",
			"filmtags" => $term[0]->slug
		);
		$films = query_posts($args);
		if($films){
			foreach($films as $film){
				switch ($index) {
					case "label":
						$value = get_the_title($film->ID);
						break;
					case "link":
						$value = get_permalink($film->ID);
						break;
					default:
						break;
				}
			}
		}else{
			switch ($index){
				case "label":
					$value = $term[0]->name;
					break;
				case "link":
					$value = NULL;
					break;
				default:
					break;
			}
		}
		return $value;
	}else{
		return false;
	}

}

function get_news($post){

	$title = $post->post_title;
	$contents = apply_filters("the_content", $post->post_content);

	$filmtags = get_the_terms($post->ID, "filmtags");
	$film_label = get_film($filmtags, "label");
	$film_link = get_film($filmtags, "link");
	$eventtags = get_the_terms($post->ID, "eventtags");
	if($film_label){
		$film_info = '<li class="index film">';
		if($film_link){
			$film_info .= '<a href="'.$film_link.'">'.$film_label.'</a>';
		}else{
			$film_info .= $film_label;
		}
		$film_info .= '</li>';
	}
	if($eventtags){
		foreach($eventtags as $event){
			$event_info = '<li class="index label">';
			$event_info .= $event->name;
			$event_info .= '</li>';
		}
	}
	if($film_info || $event_info){
		$list_post_info = '<ul class="list_post_info">';
		$list_post_info .= $film_info.$event_info;
		$list_post_info .= '</ul>';
	}

	$time = '<time  datetime="'.get_the_date("Y-m-d h:i:s A", $post->ID).'" class="list_post_time">'.get_the_date("", $post->ID).'</time>';

	$html .= <<<EOF
	<h2 class="title">{$title}</h2>
	{$list_post_info}
	<div class="list_post_contents">
	{$contents}
	</div>
	{$time}
EOF;
	wp_reset_query();
	return $html;

}

function get_post_number($post) {
	global $wpdb;
	$number = $wpdb->get_var("
		SELECT COUNT( * )
		FROM $wpdb->posts
		WHERE post_date <= '{$post->post_date}'
		AND post_status = 'publish'
		AND post_type = ('{$post->post_type}')
	");
	return $number;
}

function set_body_class(){
	$uri = $_SERVER["REQUEST_URI"];
	$args = explode("/", $uri);
	$args = array_filter($args, "strlen");
	if(($key = array_search("wp", $args)) !== false){
		unset($args[$key]);
	}
	$args = array_values($args);
	return ($args[0]) ? $args[0] : "home";
	//return ($args[0] != "wp") ? $args[1] : "home";
}

function future_events($term){

	$args = array(
		"orderby" => "name",
		"order" => "DESC"
	);
	$eventsdates = get_terms("eventsdate", $args);
	foreach($eventsdates as $date){
		if($date->slug >= $term){
			$future[] = $date->slug;
		}
	}
	return $future;

}

function get_event_info($post){
	$eventtags = get_the_terms($post->ID, "eventtags");
	if($eventtags){
		$eventtags_count = count($eventtags);
		$count = 0;
		$event_info = '<span class="inline_block index label">';
		foreach($eventtags as $event){
			$count++;
			$event_info .= $event->name;
			if($count != $eventtags_count) $event_info .= ",";
		}
		$event_info .= '</span>';
	}else{
		$event_info = NULL;
	}
	if($event_info){
		$list_post_info =  ($event_info) ? '<li>'.$event_info.'</li>' : "";
	}else{
		$list_post_info = NULL;
	}
	return $list_post_info;
}

function get_place_info($post){
	$place = get_post_meta($post->ID, "events_info_01", TRUE);
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
	return $place_list;
}

function get_date_info($post){
	$dates_details = get_post_meta($post->ID, "events_info_09", TRUE);
	$dates_details = explode("<br />", $dates_details);
	if($dates_details) $dates = '<li class="index date">'.$dates_details[0].'</li>';
	else $dates = NULL;
	return $dates;
}

function get_events($date, $init=FALSE){
	if($init){
		$init_args = array(
			"tax_query" => array(
				array(
					"taxonomy" => "eventsdate",
					"field" => "slug",
					"terms" => future_events($date)
				)
			)
		);
	}else{
		$init_args = array("eventsdate" => $date);
	}
	$args = array(
		"post_type" => "events",
		"posts_per_page" => -1,
	);
	$posts = query_posts(array_merge($args, $init_args));
	if($posts){
	$html = '<ul class="list_posts list_events">';
		foreach($posts as $post){
			$post_number = get_post_number($post);
			$post_title = get_the_title($post->ID);
			$event_info = get_event_info($post);
			$place_info = get_place_info($post);
			$date_info = get_date_info($post);
			$permalink = get_permalink($post->ID);
			$html .= <<<EOF
	<li>
		<a href="{$permalink}">
			<h2 class="title"><span class="block caption2">No.{$post_number}</span>{$post_title}</h2>
			<ul class="list_post_info">
				{$place_info}
				{$date_info}
				{$event_info}
			</ul>
		</a>
	</li>
EOF;
		}
	$html .= "</ul>";

	}else{
		$html = <<<EOF
		<div class="m4_t">
			<p> ただ今、予定の上映会・イベントがありません。</p>
		</div>
EOF;
	}

	wp_reset_query();
	return $html;

}


function cms_title($post_type, $submitdate, $lng){

	date_default_timezone_set('Asia/Tokyo');
	$today = getdate();
	$todayposts = query_posts(
		array(
			"posts_per_page" => -1,
			"post_type" => $post_type,
			"post_status" => array("pending", "publish", "draft"),
			"year" => $today["year"],
			"monthnum" => $today["mon"],
			"day" => $today["mday"]
		)
	);

	//post_type判別
	if($post_type == "contactform"){
		$typeid = "C";
	}elseif($post_type == "dvdorder"){
		$typeid = "O";
	}

	//ユーザーエージェント
	$agent = getenv("HTTP_USER_AGENT");
	if(is_smartphone()){
		$ua = "-SP";
	}else{
		$brow = IEbrowserVer();
		if($brow == "msie ie6" || $brow == "msie ie7" || $brow == "msie ie8") $ua = "-LE";
		else $ua = "-PC";
	}

	$postcount = count($todayposts) + 1;
	$postcount = sprintf("%03d", $postcount);
	$cmstitle = $typeid.$today["year"].$ua."-".$lng."-".$submitdate.$postcount;
	return $cmstitle;

}

function mail_header($from = NULL){
	$headers .= "X-Mailer: myphpMail".phpversion()."\n";
	if($from){
		$headers .= "From: ".$from."\r\n";
		$headers .= "Reply-To: ".$from."\r\n";
		$headers .= "Return-Path: ".$from."\r\n";
	}
	return $headers;
}

function mail_footer(){
	$mail_footer = '

Copyright (C) Petite Adventure Films. All Rights Reserved.

';

return $mail_footer;
}

/* お問い合わせフォーム
*****************************************************************************************/

function order_ntfct($email, $values){
	$subject = "【PAF DVD注文 : ".$values['contact_lang']."】".$values['contact_name']."様";
	$message = $values['contact_name'].'様

ご注文をいただき誠にありがとうございます。
ご注文いただきました内容は下記の通りです。ご確認ください。';
$message .= '

------------

DVD 注文内容

●踊る善福寺/ホームレスごっこ
Dancing Zempukuji/The Apprentice Homeless
種別 : '.$values['contact_film1_kind'].'
個数 : '.$values['contact_film1_unit'].'

●木田さんと原発、そして日本（日本語版）
種別 : '.$values['contact_film2_kind'].'
個数 : '.$values['contact_film2_unit'].'

●木田さんと原発、そして日本（英語字幕版）
A Woman From Fukushima
種別 : '.$values['contact_film3_kind'].'
個数 : '.$values['contact_film3_unit'].'

●乙女ハウス
Otome House
種別 : '.$values['contact_film4_kind'].'
個数 : '.$values['contact_film4_unit'].'

●さようならUR
Goodbye UR - The Japanese Social Housing Crisis
種別 : '.$values['contact_film5_kind'].'
個数 : '.$values['contact_film5_unit'].'

●ブライアンと仲間たち
Brian & Co. Parliament Square SW1
種別 : '.$values['contact_film6_kind'].'
個数 : '.$values['contact_film6_unit'].'

------------

Shipping

'.$values['contact_shipping'].'

------------

支払い方法

'.$values['contact_pay_way'].'

------------

届け先

'.$values['contact_country'].'
'.$values['contact_zipcode'].'
'.$values['contact_address1'].'
'.$values['contact_address2'].'

------------

電話番号

'.$values['contact_tel'].'

------------

領収書

'.$values['contact_receipt'].'
'.$values['contact_receipt_name'].'
'.$values['contact_receipt_proviso'].'

------------

Comments

'.$values['contact_contents'].'

------------';

$message .= '

受付番号: '.$values['contact_id'].'

担当者より後ほどご連絡をさせていただきます。
この度はご注文誠にありがとうございました。

'.
mail_footer();

	//mail($email, $subject, $message, mail_header());
	mail(get_bloginfo("admin_email"), $subject, $message, mail_header($email));
	mail("petiteadventurefilms@gmail.com", $subject, $message, mail_header($email));

}

function contact_ntfct($email, $values){
	$subject = "【PAF お問い合わせ : ".$values['contact_lang']."】".$values['contact_name']."様";
	$message = $values['contact_name'].'様

お問合せをいただき誠にありがとうございます。
お問合せいただきました内容は下記の通りです。ご確認ください。';
$message .= '

------------

お問い合わせ内容

'.$values['contact_contents'];
$message .= '

------------';

$message .= '

受付番号: '.$values['contact_id'].'

担当者より後ほどご連絡をさせていただきます。
この度はお問合わせいただき誠にありがとうございました。

'.
mail_footer();

	//mail($email, $subject, $message, mail_header());
	mail(get_bloginfo("admin_email"), $subject, $message, mail_header($email));
	mail("petiteadventurefilms@gmail.com", $subject, $message, mail_header($email));

}?>