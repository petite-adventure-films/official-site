<?php
include (TEMPLATEPATH . '/_order_post.php');
get_header(); ?>

<div class="col col_8">
	<header class="header_page">
		<nav class="crumbs">
			<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
				<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
					<span itemprop="title">HOME</span>
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

	<p class="m7_t">DVDのご購入は、以下の注文書に記入・送信してください。<br />折り返しご連絡いたします。</p>
	<dl class="m2_t list_definition">
		<dt>DVDの規格</dt><dd>NTSC、DVD-Rディスク（DVD-R対応機器にて再生可能）</dd>
		<dt>お支払い</dt><dd>先払い（但し、図書館や学校などは後払いも可能。ご相談ください）</dd>
		<dt>お支払い方法</dt><dd>銀行振り込み、クレジットカード（PayPal）</dd>
	</dl>

	<p class="m2_t">団体(学校含む)・ライブラリー価格<br />
	学校・団体や図書館など、不特定多数の方への無料貸出を目的としたご購入の場合は、「団体・ライブラリー価格」でお買い求め下さい。有料貸出の場合は、別途ご相談下さい。</p>

	<p class="m2_t">DVD上映権<br />
	DVDに上映権はついていません。上映をご希望の場合は<a href="<?php echo get_permalink(get_page_by_path("four-walling")); ?>">こちら</a>をご覧ください。 </p>

	<p class="m2_t">送料<br />
	180 円（1回のお申込につき、同一住所宛なら何枚でも180円）
	<br /><span class="pink">3,000円以上のお買い上げで送料無料!</span></p>

	<?php
	$i = 1;
	$args = array(
		"post_type" => "films",
		"posts_per_page" => -1
	);
	$posts = query_posts($args);
	if($posts): ?>
		<?php foreach($posts as $post):
			$sell_dvd = get_post_meta($post->ID, "films_info_20");
			$poster_img = get_post_meta($post->ID, "films_info_00", TRUE);
			$dvd_lead = get_post_meta($post->ID, "films_info_30", TRUE);
			$dvd_price_title = get_post_meta_arr($post->ID, "films_info_25");
			$dvd_price = get_post_meta_arr($post->ID, "films_info_26");
			$dvd_contents_title = get_post_meta_arr($post->ID, "films_info_28");
			$dvd_contents = get_post_meta_arr($post->ID, "films_info_29");
			?>
			<?php if(!$sell_dvd && $post->ID != 2183): ?>
				<section class="dvd_contents">
					<div class="dvd_img show_wider">
						<?php echo get_post_meta_img($poster_img, "medium"); ?>
					</div>
					<div class="dvd_info last show_wider">
						<h3 class="dvd_title">
							<?php echo get_the_title($post->ID); ?>
							<?php if($post->ID == 2173) echo "/ ".get_the_title(2183); ?>
						</h3>
						<div class="dvd_lead">
							<?php echo $dvd_lead; ?>
						</div>
						<dl class="list_definition dvd_price">
							<?php for($i=0; $i<count($dvd_price); $i++): ?>
								<dt class="bold"><?php echo $dvd_price_title[$i]; ?>価額</dt>
								<dd>¥<?php echo number_format($dvd_price[$i]); ?></dd>
							<?php endfor; ?>
						</dl>
						<div class="dvd_details">
							<?php for($i=0; $i<count($dvd_contents); $i++): ?>
								<h4 class="bold"><?php echo $dvd_contents_title[$i]; ?></h4>
								<?php echo $dvd_contents[$i]; ?>
							<?php endfor; ?>
						</div>
					</div>
					<div class="show_smaller dvd_title_price"></div>
					<div class="show_smaller dvd_info_details"></div>
				</section>
			<?php endif; ?>
		<?php endforeach; ?>
	<?php endif; ?>
</div>

<div class="col col_4 last order_form">
	<h3>注文書</h3>
	<p class="pink">* 必須<br />
	<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("order_jp/confirm")); ?>" id="order" class="m1_t">
		<?php include (TEMPLATEPATH . "/_order_jp_form.php"); ?>
		<div class="form_btns m4_t"><div class="btn priority1"><input type="submit" id="send" value="内容を確認する" /></div></div>
	</form>
</div>

<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/assets/js/form_order.js"></script>
<script type="text/javascript">
	$(function(){

		$(".dvd_info_details").hide();
		$(".dvd_contents").append('<div class="show_smaller more_details">もっと詳しく</div>');

		$(".dvd_title_price").each(function(){
			var dvdImg = $(this).parent().find(".dvd_img");
			var dvdImgClone = dvdImg.clone();
			var dvdImgClone = dvdImgClone.removeClass("show_wider");
			var dvdTitle = $(this).parent().find(".dvd_title");
			var dvdTitleClone = dvdTitle.clone();
			var dvdPrice = $(this).parent().find(".dvd_price");
			var dvdPriceClone = $(this).parent().find(".dvd_price").clone();
			dvdImgClone.appendTo($(this));
			dvdTitleClone.appendTo($(this));
			dvdPriceClone.appendTo($(this));
			$('<div class="clear"></div>').appendTo($(this));
		});

		$(".dvd_info_details").each(function(){
			var dvdLead = $(this).parent().find(".dvd_lead");
			var dvdLeadClone = dvdLead.clone();
			var dvdDetails = $(this).parent().find(".dvd_details");
			var dvdDetailsClone = dvdDetails.clone();
			dvdLeadClone.appendTo($(this));
			dvdDetailsClone.appendTo($(this));
		});

		$(".more_details").click(function(){
			var dvdInfoDetails = $(this).prev(".dvd_info_details");
			if(dvdInfoDetails.css("display") == "none"){
				dvdInfoDetails.slideDown();
				$(this).addClass("close");
			}else{
				dvdInfoDetails.slideUp();
				$(this).removeClass("close");
			}
		});

	});
</script>
<?php get_footer(); ?>