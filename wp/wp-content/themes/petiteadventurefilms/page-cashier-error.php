<?php
/*
Template Name: Cashier error
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
    
        <? if($_GET['_error'] == '001'): ?>
        
            <p>不正なアクセスです。<br>
            お手数ですが、最初からご注文を行ってください。</p>
            
            <p class="m2_t">エラー番号 : <? echo $_GET['_error']; ?></p>
        
        <? else: ?>
        
            <p>注文手続中にエラーが発生しています。<br>
            お手数ですが、下記のエラー番号と注文番号でお問い合わせください。</p>
            
            <p class="m2_t">エラー番号 : <? echo $_GET['_error']; ?></p>
            <p>注文番号 : <? echo $_GET['_order']; ?></p>
            
        <? endif; ?>
           
        <div class="inline_block m2_t btn priority1">
            <a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
        </div>
        
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