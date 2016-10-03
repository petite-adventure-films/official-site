<?php
/*
Template Name: Order EN Thanks
*/
global $wpdb, $user_ID;

include (TEMPLATEPATH . "/_order_post.php");

if($_POST){

	date_default_timezone_set("Asia/Tokyo");

	$post_type =  "dvdorder";

	$submit_date = date("mdH", time()); //送信タイム
	$post_title = cms_title($post_type, $submit_date, "E");

	$insert_arg = array(
		"post_status" => "pending",
		"post_title" => $post_title,
		"comment_status" => "closed",
		"post_type" => $post_type
	);
	$insert_id = wp_insert_post($insert_arg);

	if($insert_id){

		add_post_meta($insert_id, "order_info_01", $contact_name);
		add_post_meta($insert_id, "order_info_03", $contact_zipcode);
		add_post_meta($insert_id, "order_info_04", $contact_address1);
		add_post_meta($insert_id, "order_info_05", $contact_address2);
		add_post_meta($insert_id, "order_info_17", $contact_country);
		add_post_meta($insert_id, "order_info_06", $contact_email);
		add_post_meta($insert_id, "order_info_18", $contact_tel);
		add_post_meta($insert_id, "order_info_07", $contact_film1_unit);
		add_post_meta($insert_id, "order_info_08", $contact_film2_unit);
		add_post_meta($insert_id, "order_info_09", $contact_film3_unit);
		add_post_meta($insert_id, "order_info_10", $contact_film4_unit);
		add_post_meta($insert_id, "order_info_11", $contact_film5_unit);
		add_post_meta($insert_id, "order_info_12", $contact_film6_unit);
		add_post_meta($insert_id, "order_info_21", $contact_film1_kind);
		add_post_meta($insert_id, "order_info_22", $contact_film2_kind);
		add_post_meta($insert_id, "order_info_23", $contact_film3_kind);
		add_post_meta($insert_id, "order_info_24", $contact_film4_kind);
		add_post_meta($insert_id, "order_info_25", $contact_film5_kind);
		add_post_meta($insert_id, "order_info_26", $contact_film6_kind);
		add_post_meta($insert_id, "order_info_19", $contact_shipping);
		add_post_meta($insert_id, "order_info_13", $contact_pay_way);
		add_post_meta($insert_id, "order_info_14", $contact_receipt);
		add_post_meta($insert_id, "order_info_15", $contact_receipt_name);
		add_post_meta($insert_id, "order_info_16", $contact_receipt_proviso);
		add_post_meta($insert_id, "order_info_20", $contact_contents);

		$contact_kinds = array("", "Home", "Library");
		$contact_film1_kind = ($contact_film1_kind) ? $contact_kinds[$contact_film1_kind] : "-";
		$contact_film2_kind = ($contact_film2_kind) ? $contact_kinds[$contact_film2_kind] : "-";
		$contact_film3_kind = ($contact_film3_kind) ? $contact_kinds[$contact_film3_kind] : "-";
		$contact_film4_kind = ($contact_film4_kind) ? $contact_kinds[$contact_film4_kind] : "-";
		$contact_film5_kind = ($contact_film5_kind) ? $contact_kinds[$contact_film5_kind] : "-";
		$contact_film6_kind = ($contact_film6_kind) ? $contact_kinds[$contact_film6_kind] : "-";
		$contact_film7_kind = ($contact_film7_kind) ? $contact_kinds[$contact_film7_kind] : "-";

		$contact_film1_unit = ($contact_film1_unit) ? $contact_film1_unit : "-";
		$contact_film2_unit = ($contact_film2_unit) ? $contact_film2_unit : "-";
		$contact_film3_unit = ($contact_film3_unit) ? $contact_film3_unit : "-";
		$contact_film4_unit = ($contact_film4_unit) ? $contact_film4_unit : "-";
		$contact_film5_unit = ($contact_film5_unit) ? $contact_film5_unit : "-";
		$contact_film6_unit = ($contact_film6_unit) ? $contact_film6_unit : "-";
		$contact_film7_unit = ($contact_film7_unit) ? $contact_film7_unit : "-";

		$contact_receipt = ($contact_receipt) ? "必要" : "不要";
		$contact_pay_way = ($contact_pay_way) ? "銀行振込" : "クレジットカード";
		$contact_shipping = ($contact_shipping) ? "Registered" : "Registered express";

		$order_values = array(
			"contact_name" => $contact_name,
			"contact_cstm_type" => $contact_cstm_type,
			"contact_zipcode" => $contact_zipcode,
			"contact_country" => $contact_country,
			"contact_address1" => $contact_address1,
			"contact_address2" => $contact_address2,
			"contact_email" => $contact_email,
			"contact_tel" => $contact_tel,
			"contact_film1_unit" => $contact_film1_unit,
			"contact_film2_unit" => $contact_film2_unit,
			"contact_film3_unit" => $contact_film3_unit,
			"contact_film4_unit" => $contact_film4_unit,
			"contact_film5_unit" => $contact_film5_unit,
			"contact_film6_unit" => $contact_film6_unit,
			"contact_film7_unit" => $contact_film7_unit,
			"contact_film1_kind" => $contact_film1_kind,
			"contact_film2_kind" => $contact_film2_kind,
			"contact_film3_kind" => $contact_film3_kind,
			"contact_film4_kind" => $contact_film4_kind,
			"contact_film5_kind" => $contact_film5_kind,
			"contact_film6_kind" => $contact_film6_kind,
			"contact_film7_kind" => $contact_film7_kind,
			"contact_pay_way" => $contact_pay_way,
			"contact_shipping" => $contact_shipping,
			"contact_receipt" => $contact_receipt,
			"contact_receipt_name" => $contact_receipt_name,
			"contact_receipt_proviso" => $contact_receipt_proviso,
			"contact_contents" => $contact_contents,
			"contact_id" => $post_title,
			"contact_lang" => "EN"
		);

		order_ntfct($contact_email, $order_values);

	}

}else{

	$error = 1;

}
wp_reset_query(); wp_reset_postdata();

get_header(); ?>

<div class="single">
<div class="col col_9 last">

	<header class="header_page">
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>" itemprop="url">
					<span itemprop="title">DVD Shop</span>
				</a>
			</div>
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
					<span itemprop="title"><?php echo $post->post_title; ?></span>
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

	<div class="m7_t" id="confirm">
		<p>Thanks for your order!</p>
		<p>Your DVD order information has been sent.<br />
			We will be in touch within the next few days.</p>
		<p class="m4_t">Order confirmation number：<?php echo $post_title; ?></p>
	</div>

</div>


<?php get_footer(); ?>