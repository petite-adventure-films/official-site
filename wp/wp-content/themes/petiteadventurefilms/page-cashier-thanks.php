<?php
/*
Template Name: Cashier thanks
*/
get_header('pafshop'); ?>

<div class="single_pafshop">
<div class="col col_6 last">

    <header class="header_page">
        <nav class="crumbs">
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
                    <span itemprop="title">HOME</span>
                </a>
            </div>
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<?php echo get_post_type_archive_link("pafshop"); ?>" itemprop="url">
                    <span itemprop="title">ショップ TOP</span>
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
        <p>ご注文、誠にありがとうございます。</p>
        <p>
            <? if($_GET['method'] == 1): ?>
                ご注文内容の確認と、代金のお支払いについてご連絡を差し上げます。
            <? else: ?>
                ご注文内容の確認についてご連絡を差し上げます。
            <? endif; ?>
            <br />しばらくお待ちください。</p>
            
        <p class="m1_t">
            注文番号: <? echo $_GET['method']; ?>
        </p>
            
        <p class="m2_t">
            <a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">サイトHOME</a><br>
            <a href="<?php echo get_post_type_archive_link("pafshop"); ?>" itemprop="url">ショップ TOP</a>
        </p>
    </div>

</div><!--.single-->

<?php get_footer('scripts'); ?>

<script type="text/javascript">

    localStorage.removeItem('pafOrderID');

    var app = new Vue({
        el: '#app'
        , data: {
            pafCartCount: 0
        }
    })

</script>