<?php
include (TEMPLATEPATH . '/_order_post.php');
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

	<div class="m7_t">

		<p>DVDのご購入は、以下の注文書に記入・送信してください。折り返しご連絡いたします。</p>

		<dl class="m2_t list_definition">
			<dt>DVDの規格</dt><dd>NTSC、DVD-Rディスク（DVD-R対応機器にて再生可能）</dd>
			<dt>お支払い</dt><dd>先払い（但し、図書館や学校などは後払いも可能。ご相談ください）</dd>
			<dt>お支払い方法</dt><dd>銀行振り込み、クレジットカード（PayPal）</dd>
		</dl>

		<p class="m2_t">団体(学校含む)・ライブラリー価格<br />
		学校・団体や図書館など、不特定多数の方への無料貸出を目的としたご購入の場合は、「団体・ライブラリー価格」でお買い求め下さい。有料貸出の場合は、別途ご相談下さい。</>
		<p class="m2_t">送料<br />
		180 円（1回のお申込につき、同一住所宛なら何枚でも180円）
		<br /><span class="pink">3,000円以上のお買い上げで送料無料!</span></p>


		<p class="m4_t pink">* 必須<br />
		<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("order_jp/confirm")); ?>" id="order" class="m1_t">
			<?php include (TEMPLATEPATH . "/_order_jp_form.php"); ?>
			<div class="form_btns m4_t"><div class="btn priority1"><input type="submit" id="send" value="内容を確認する" /></div></div>
		</form>

	</div>

</div>
</div>

<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/assets/js/form_order.js"></script>
<?php get_footer(); ?>