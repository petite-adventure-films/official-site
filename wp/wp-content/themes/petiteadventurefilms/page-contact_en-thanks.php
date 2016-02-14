<?php
/*
Template Name: Contact EN Thanks
*/
global $wpdb, $user_ID;

include (TEMPLATEPATH . "/_contact_post.php");

if($_POST){

	date_default_timezone_set("Asia/Tokyo");

	$post_type =  "contactform";

	$submit_date = date("mdH", time()); //送信タイム
	$post_title = cms_title($post_type, $submit_date, "E");

	$insert_arg = array(
		"post_status" => "pending",
		"post_title" => $post_title,
		"comment_status" => "closed",
		"post_type" => $post_type,
		"post_content" => $contact_contents
	);
	$insert_id = wp_insert_post($insert_arg);

	if($insert_id){

		add_post_meta($insert_id, "contact_info_01", $contact_name);
		add_post_meta($insert_id, "contact_info_02", $contact_email);
		add_post_meta($insert_id, "contact_info_03", $contact_kind);

		$contact_kind = $contact_kinds[$contact_kind];

		$contact_values = array(
			"contact_name" => $contact_name,
			"contact_email" => $contact_email,
			"contact_contents" => $contact_contents,
			"contact_id" => $post_title
		);

		contact_ntfct($contact_email, $contact_values);

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
				<a href="<?php echo get_permalink(get_page_by_path("contact_en")); ?>" itemprop="url">
					<span itemprop="title">Contact</span>
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
		<p>Thank you! Your information has been sent.</p>
		<p>We will be in touch within the next few days.</p>
		<p class="m4_t">Confirmation number : <?php echo $post_title; ?></p>
	</div>

</div>


<?php get_footer(); ?>