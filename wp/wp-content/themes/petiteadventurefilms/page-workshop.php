<?php

$contents = apply_filters('the_content', $post->post_content);

$contents_titles = get_post_meta_arr($post->ID, "contents_info_01");
$contents_contents = get_post_meta_arr($post->ID, "contents_info_02");
$contents_appendixs = get_post_meta_arr($post->ID, "contents_info_03");

$gallery_imgs = get_post_meta($post->ID, "workshop_info_00", FALSE);

$movie_india_diary = 4455;
$movie_brian_co = 2161;
$movie_goodbye_ur = 16;

get_header(); ?>

<div class="single">
<div class="col col_9 last">

    <header class="header_page">
        <nav class="crumbs" aria-label="Breadcrumb">
            <div class="crumb">
                <a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
                    <span itemprop="title">HOME</span>
                </a>
            </div>
            <div class="crumb" aria-current="page">
                <a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
                    <span itemprop="title">ワークショップ</span>
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

    <p class="m7_t">ビデオカメラが小型化し、値段も手ごろとなり、スマホでも簡単に動画が撮影できる時代になりました。それに伴い、「映像制作に興味がある」、「自分たちの活動を映像で紹介したい」、「スマホで撮った映像を編集したい」、「オンライン配信をしたい」等々、映像制作を学びたい方が増えています。プチ・アドベンチャー・フィルムズでは、初心者～中級者を対象に、ニーズに合わせた映像ワークショップを承っております。ご興味のある方は、<a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>よりご連絡ください。</p>
    <div class="slides m2_t">
        <div class="owl-carousel">
            <?php foreach($gallery_imgs as $img):?>
                <div class="slide"><?php echo get_post_meta_img($img, "large", "preload"); ?></div>
            <?php endforeach; ?>
        </div>
    </div>
    <div class="last"></div>
    <div class="inline_block m2_t btn priority1">
        <a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
    </div>

</div>

    <section class="contents">
        <div class="col col_9 last">
            <h2 class="contents_title">映像ワークショップで学べる内容（例）</h2>
            <p>ワークショップで学ぶ内容は、受講者のレベルや目的、受講期間（講座の回数）等により、カスタマイズが可能です。ご相談ください。</p>
        </div>
        <div class="col col_3 m2_t">
            <h3>撮影</h3>
            <p class="m2_t">カメラの使い方、三脚やマイクの使い方、「見せる」撮り方のコツ、企画・構成の考え方、取材・インタビュー、著作権・肖像権、撮影時のトラブル回避など、基礎から応用まで対応。</p>
        </div>
        <div class="col col_3 m2_t">
            <h3>編集</h3>
            <p class="m2_t">編集ソフトの使い方、スライドショーの作成、動画の編集、ナレーション・テロップの作成、音楽の使用、「伝える」ための編集の工夫など、基礎から応用まで対応。</p>
        </div>
        <div class="col col_3 last m2_t">
            <h3>公開</h3>
            <p class="m2_t">YouTube等インターネットでの作品公開、映画祭への応募、自主上映開催など、完成作品を発表し広める方法を学ぶ。</p>
        </div>
        <div class="col col_9 last">
            <p class="m2_t footnotes caption1"><small>
            ※撮影の基礎から作品の公開までをひと通り学び、講座修了時までに3分間の映像作品を制作するコースの例は、<a href="http://civiltachikawa.sakura.ne.jp/shimin-koza-n35.html" rel="nofollow" target="_blank">こちら</a>をご覧ください。</small></p>
        </div>
    </section>

<div class="col col_9 last">

    <section class="contents">
        <h2 class="contents_title">受講対象</h2>
        <p>初級または中級の団体および個人<br>（これまでに、小学生～80代の方が受講されました♬）</p>
    </section>

    <section class="contents">
        <h2 class="contents_title">必要な機材（応相談）</h2>
        <p class="m2_t">カメラ（市販のビデオカメラ、デジカメ、スマホなど、動画が撮影できるもの）<br>
        Windowsノートパソコン（Windows 10以降）</p>
        <p class="m2_t footnotes caption1"><small>
        ※講座の内容により、必要な機材は変わります。<br>
        ※団体での受講の場合、プロジェクター、スクリーン、スピーカーなどが必要な場合があります。<br>
        ※講座で使用する機材は、1人1台ではなく、数人で1台のカメラとパソコンを共有する形でも可能です。<br>
        ※講座では、Windows10搭載の「フォト」アプリ（無料）を使って、動画の編集をします。<br>
        </small></p>
    </section>

    <section class="contents">
        <h2 class="contents_title">ワークショップの費用</h2>
        <p>講座の内容、開催場所、受講期間（講座の回数）、受講者数などによって変わります。<br>
        詳細は<a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>ください。</p>
    </section>

    <section class="contents">
        <h2 class="contents_title">これまでの主なワークショップ開催実績</h2>
        <dl class="list_definition">
            <dt>市民の学習・活動・交流センター シビル</dt><dd>2015年＆2017年＆2020年 / 一般対象、全6～8回コース</dd>
            <dt>川崎市麻生市民館</dt><dd>2019年/ 一般対象、全3回コース</dd>
            <dt>東京女子大学</dt><dd>2016年 / 大学生対象、全2回コース</dd>
            <dt>環境まちづくりNPO エコメッセ</dt><dd>2015年 / 会員対象、1日コース</dd>
            <dt>Dislocate</dt><dd>2013年 / 小学生親子対象、全2回コース、映画監督コーム･チャンラズマイさんと共同担当</dd>
            <dt>日本ジャーナリスト会議・ジャーナリスト養成講座</dt><dd>2012年 / 学生＆一般対象、1日コース</dd>
            <dt>市民メディアセンター MediR</dt><dd>2011年 / 一般対象、全6回コース、映画監督根来祐さんと共同担当</dd>
        </dl>
    </section>

    <div class="inline_block m7_t btn priority1">
        <a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
    </div>

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