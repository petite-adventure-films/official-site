<?php

$contents = apply_filters('the_content', $post->post_content);

$contents_titles = get_post_meta_arr($post->ID, "contents_info_01");
$contents_contents = get_post_meta_arr($post->ID, "contents_info_02");
$contents_appendixs = get_post_meta_arr($post->ID, "contents_info_03");

$gallery_imgs = get_post_meta($post->ID, "four-walling_info_00", FALSE);

$movie_india_diary = 4455;
$movie_brian_co = 2161;
$movie_goodbye_ur = 16;

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

	<p class="m7_t">自主上映会サポーター募集！　お住まいの地域、学校、グループで、映画を上映しませんか？</p>
	<div class="slides m2_t">
		<div class="owl-carousel">
			<?php foreach($gallery_imgs as $img):?>
				<div class="slide"><?php echo get_post_meta_img($img, "large", "preload"); ?></div>
			<?php endforeach; ?>
		</div>
	</div>
	<div class="last"></div>
	<p class="m7_t">自主上映会を開催してくださるサポーターの方を、大募集中です！<br />
	地域で、職場で、学校で、グループで…など、自主上映会開催に興味のある方は、以下「お問い合わせ」よりご連絡ください。</p>
	<div class="inline_block m2_t btn priority1">
		<a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
	</div>

	<section class="contents">
		<h2 class="contents_title">上映料（全作品共通）</h2>
		<p>完全自主制作作品のため、制作支援として上映料のカンパをお願いしています。</p>
		<p>1回の上映につき、入場者20名以下の場合、上映料は1万円となります。<br />
		20名を超える場合は、入場者数×500円です。
		（例えば入場者40人の場合、上映料は2万円となります）</p>
		<p class="m2_t footnotes caption1"><small>※上映料についてご相談に応じます。<br />
		※上映の条件は予告なく変更する場合があります。最新の上映条件は、常にこのウェブサイト上で公開しています。<br />
		※講演などのご依頼も歓迎いたします。<br />
		※入場料の設定は自由です。<br />
		※商業的な上映や、映画館などでの上映については、別途ご連絡ください。</small></p>
	</section>

</div>

<section class="contents">
	<div class="col col_9 last">
		<h2 class="contents_title">宣伝資材</h2>
		<p class="m2_t">上映作品のスチール写真やテキストは、無償でご提供します。
		『ブライアンと仲間たち』、『さようならUR』、『インド日記』は、チラシとポスターもご用意しています。</p>
	</div>

	<div class="m4_t">
		<div class="col col_9 last">
			<h3>映画のチラシ</h3>
			<p class="m2_t">1枚5円（50枚単位）＋送料実費<br />
			B5両面、フルカラー、裏面に上映会情報印刷用の余白あり</p>
		</div>
		<div class="m2_t lightbox">
			<div class="col col_2">
				<?php $poster_img = get_post_meta($movie_india_diary, "films_info_19", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
				<div class="m1_t">
				<?php $poster_img = get_post_meta($movie_india_diary, "films_info_18", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
				</div>
			</div>
			<div class="col col_2">
				<?php $poster_img = get_post_meta($movie_goodbye_ur, "films_info_19", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
				<div class="m1_t">
				<?php $poster_img = get_post_meta($movie_goodbye_ur, "films_info_18", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
				</div>
			</div>
			<div class="col col_2">
				<?php $poster_img = get_post_meta($movie_brian_co, "films_info_19", TRUE);
				echo get_post_meta_img($poster_img, "large");?>
				<div class="m1_t">
				<?php $poster_img = get_post_meta($movie_brian_co, "films_info_18", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
				</div>
			</div>
			<div class="last"></div>
		</div>
	</div>

	<div class="m4_t">
		<div class="col col_9 last">
			<h3>映画のポスター</h3>
			<p class="m2_t">1枚300円（1枚単位）＋送料実費</p>
			<p>『インド日記』=B2片面、フルカラー</p>
			<p>『さようならUR』= B2片面、フルカラー</p>
			<p>『ブライアンと仲間たち』= A1片面、フルカラー</p>
		</div>
		<div class="m2_t lightbox">
			<div class="col col_2">
				<?php $poster_img = get_post_meta($movie_india_diary, "films_info_24", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>
			<div class="col col_2">
				<?php $poster_img = get_post_meta($movie_goodbye_ur, "films_info_24", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>
			<div class="col col_2">
				<?php $poster_img = get_post_meta($movie_brian_co, "films_info_24", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>
			<div class="last"></div>
		</div>
	</div>

	<div class="m4_t">
		<div class="col col_9 last">
			<h3>JASRACへの楽曲使用料 <span class="caption1">（『ブライアンと仲間たち』、『さようならUR』のみ）</span></h3>
			<p class="m2_t">入場料が有料の場合は、日本音楽著作権協会（JASRAC）への楽曲使用料支払い義務が発生します。主催者様の名義で、上映日の5日前までにJASRACへ手続きをお願いします。</p>
			<p>JASRACへの手続きと使用料計算方法の目安は<a href="http://www.jasrac.or.jp/info/event/movie.html" target="_blank">こちら</a> </p>
			<p>JASRACの楽曲使用料（ビデオ上映使用料）の目安：座席数、入場料等により異なりますが、100名収容の会場で入場料500円の場合、1回の上映につき約300～400円です。</p>
		</div>
	</div>


	<div class="inline_block m2_t btn priority1">
		<a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
	</div>

</section>
</div>

<script type="text/javascript">

	$(window).load(function(){

		$(".owl-carousel").owlCarousel({
			items: 1,
			autoHeight: true,
			lazyLoad : true,
			loop: true,
			dots: true,
			nav: true,
			navText: ["",""]
		});

	});

</script>


<?php get_footer(); ?>