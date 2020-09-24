<?php
// phpinfo();
get_header('pafshop');

$post_type = get_post_type_object( get_query_var( 'post_type' ));
$term_link = get_post_type_archive_link($post_type->name);
$term_name = $post_type->label;

$price_indexs = get_post_meta_arr($post->ID, "product_info_01");
$price_contents = get_post_meta_arr($post->ID, "product_info_02");
$dvd_specials = get_post_meta($post->ID, "product_info_04", TRUE);
// $poster_img = get_post_meta($post->ID, "product_info_03", TRUE);

$film_terms = get_the_terms($post, 'filmtags');
$film_id = $film_terms[0]->term_id;

$film_query = new WP_Query([
      'post_type' => 'films'
    , 'tax_query' => array(
        array(
              'taxonomy' => 'filmtags'
            , 'field'    => 'term_id'
            , 'terms'    => $film_id
        )
    )
]);

$film_posts = $film_query->posts;
$film_post = $film_posts[0];
$film_post_id = $film_posts[0]->ID;

$poster_img = get_post_meta($film_post_id, "films_info_00", TRUE);
$gallery_imgs = get_post_meta($film_post_id, "films_info_09", FALSE);

$catch = get_post_meta($film_post_id, "films_info_21", TRUE);
$prizes = get_post_meta($film_post_id, "films_info_07", FALSE);

$genre = get_post_meta($film_post_id, "films_info_01", TRUE);
$country = get_post_meta($film_post_id, "films_info_02", TRUE);
$year = get_post_meta($film_post_id, "films_info_03", TRUE);
$running_time = get_post_meta($film_post_id, "films_info_04", TRUE);
$basic_info = array($genre, $country, $year, $running_time);
$basic_info = array_filter($basic_info, "strlen");

$recommend_by = get_post_meta_arr($film_post_id, "films_info_12");
$recommends = get_post_meta_arr($film_post_id, "films_info_13");

$detail_indexs = get_post_meta_arr($film_post_id, "films_info_05");
$detail_contents = get_post_meta_arr($film_post_id, "films_info_06");

$teaser = get_post_meta($film_post_id, "films_info_08", TRUE);
$movie = get_post_meta($film_post_id, "films_info_17", TRUE);

$excerpt = apply_filters('the_content', $film_post->post_excerpt);

$national_screenings = get_post_meta($film_post_id, "films_info_14");
$global_screenings = get_post_meta($film_post_id, "films_info_15");
$media_screenings = get_post_meta($film_post_id, "films_info_27");

$related_infomation = get_post_meta($film_post_id, "films_info_16");

$credits_indexs = get_post_meta_arr($film_post_id, "films_info_10");
$credits_contents = get_post_meta_arr($film_post_id, "films_info_11");

$sell_dvd = get_post_meta($film_post_id, "films_info_20");
$sell_dvd_appendix = get_post_meta($film_post_id, "films_info_22", TRUE);
?>

<div class="single">

    <header class="col col_9 last header_page">
        <nav class="crumbs">
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
                    <span itemprop="title">HOME</span>
                </a>
            </div>
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<?php echo $term_link; ?>" itemprop="url">
                    <span itemprop="title"><?php echo $term_name; ?></span>
                </a>
            </div>
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
                    <span itemprop="title"><?php echo $post->post_title; ?></span>
                </a>
            </div>
        </nav>
        <h1 class="m5_b">
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

    <div class="col col_5">
        <? echo get_post_meta_img($poster_img, "large"); ?>
    </div>

    <div class="col col_4 last">
        
        <?php if($prizes): ?>
            <div class="subhead1 m2_b">
            <?php foreach($prizes as $prize): ?>
                <p><?php echo $prize; ?></p>
            <?php endforeach; ?>
            </div>
        <?php endif; ?>
    
        <div
        v-for = "(val, key) in priceIndexs"
        :key="'price' + key">
            {{val}} {{convertYen(priceContents[key])}}
            
            <select v-model="pafCart[key]">
                <option value=0 selected>個数</option>
                <option
                v-for="(val2, key2) in purchaseLimit"
                :key="'price' + key + key2"
                    :value="val2">{{val2}}</option>
            </select>
        </div>

        <div
        :class="['btn m1_t cursor_pointer', addCartActive]">
            <span class="ele" @click="addCart">買い物かごに追加</span>
        </div>
        
        <span v-if="errorMessage" class="red">{{errorMessage}}</span>
        <p class="m1_t footnotes caption1">
            <small>※こちらの価格には消費税が含まれています</small><br>
            <small>※1回のご注文ごとに送料300円が掛かります<br>
            <span class="pink">3,000円以上のお買い上げで送料無料！</span></small>
        </p>

    </div>
    
    <div class="col col_9 last">
        <div class="tabs m4_t al_c">
            <div @click="displayTab = 1" :class="['_tab cursor_pointer', (displayTab == 1) ? '_selected' : '']">DVDの構成</div>
            <div @click="displayTab = 2" :class="['_tab cursor_pointer', (displayTab == 2) ? '_selected' : '']">特典の詳細</div>
            <div @click="displayTab = 3" :class="['_tab cursor_pointer', (displayTab == 3) ? '_selected' : '']">制作クレジット</div>
        </div>
    </div>
    
    <div v-if="displayTab == 1" class="m2_t">
        
        <div class="col col_9 last">
        
            <?php if($detail_indexs): ?>
                <dl class="list_definition">
                <?php for($i=0; $i<count($detail_indexs); $i++): ?>
                    <?php echo $detail_indexs[$i] ? "<dt>".$detail_indexs[$i]."</dt>" : ""; ?>
                    <?php echo $detail_contents[$i] ? "<dd>".$detail_contents[$i]."</dd>" : ""; ?>
                <?php endfor; ?>
                </dl>
                <div class="clear"></div>
            <?php endif;?>
            
            <?php if($excerpt): ?>
                <div class="m1_t">
                    <?php echo $excerpt; ?>
                </div>
            <?php endif; ?>
            
            <div class="m1_t">
                <?php echo apply_filters('the_content', $post->post_content); ?>
            </div>
            
            <p class="m2_t">DVD購入や上映についてのお問い合わせはこちらから</p>
            <div class="inline_block btn priority1">
                <a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
            </div>
            
        </div>
        
    </div>
    
    <div v-if="displayTab == 2" class="m2_t">
        
        <div class="col col_9 last">
    
            <p>特典映像</p>
            <?php if($dvd_specials): ?>
                <?php echo $dvd_specials; ?>
            <?php endif; ?>
            
            <p class="m2_t">フォトギャラリー</p>
            <p class="m2_t">予告編</p>
        
        </div>
        
    </div>
    
    <div v-if="displayTab == 3">
        
        <?php if($credits_indexs): ?>
            <div v-masonry item-selector="._credit">
            <?php for($i=0; $i<count($credits_indexs); $i++): ?>
                <div class="col col_3 _credit m2_t" v-masonry-tile>
                    <p><?php echo $credits_indexs[$i]; ?></p>
                    <?php echo $credits_contents[$i]; ?>
                </div>
            <?php endfor; ?>
            </div>
        <?php endif;?>
    
    </div>
    <div class="clear"></div>

</div><!--.single-->

<?php get_footer('scripts'); ?>

<modal
v-if="showModal == true"
@close="closeModaltoCashier"></modal>
            
<script type="text/x-template" id="modal-template">
    <div class="modal-mask">
        <div class="modal-container _pafshop">
            <div class="icon icon-close" @click="close()"></div>
            <div class="confirm_btns">
                <div class="btn cursor_pointer" @click="close()">
                    <span class="ele">買い物を続ける</span>
                </div>
                <div class="btn shop m1_t">
                    <a href="<?php echo get_permalink(get_page_by_path("cashier")); ?>">買い物かごを見る</span>
                </div>
            </div>
        </div>
    </div>
</script>

<script type="text/javascript">

    Vue.config.devtools = true;

    // masonry レイアウト
    var VueMasonryPlugin = window['vue-masonry-plugin'].VueMasonryPlugin;
    Vue.use(VueMasonryPlugin);

    var price_indexs = <? echo json_encode($price_indexs) ?>;
    var price_contents = <? echo json_encode($price_contents) ?>;
    var film_id = 'film_<? echo $film_id ?>';

    if(!JSON.parse(localStorage.getItem('pafCart'))){
        localStorage.setItem('pafCart', JSON.stringify({}));
    }

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart'));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

    Vue.component('modal', {
        template: '#modal-template'
        , methods: {
            close: function(){ this.$emit('close') }
        }
    });

    var app = new Vue({
        el: '#app'
        , data: {
              filmID : film_id
            , priceIndexs   : price_indexs
            , priceContents : price_contents
            , purchaseLimit : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            , strgPafCart : strgPafCart
            , pafCart : (strgPafCart && strgPafCart[film_id]) ? strgPafCart[film_id] : [0, 0]
            , pafCartCount : strgPafCartCount || 0
            , errorMessage: ''
            
            , showModal: false
            , displayTab: 1
        }
        , computed: {
            addCartActive : function()
            {
                var count = 0
                this.pafCart.forEach(v => { count = count + parseInt(v) })
                //this.errorMessage = ''
                return count > 0 ? 'shop' : 'disabled'
            }
        }
        , methods: {      
            convertYen: function(number)
            {
                return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
            }
            , addCart: function()
            {
                this.errorMessage = ''
                if(this.addCartActive == 'shop')
                {

                    if(this.strgPafCart[this.film] === undefined)
                    {
                        this.strgPafCart[this.filmID] = [];
                    }
                    this.pafCart.forEach(v => {
                        this.strgPafCart[this.filmID].push(v || 0)
                    })

                    localStorage.setItem('pafCart', JSON.stringify(this.strgPafCart))
                    this.setPafCartCount();

                    this.showModal = true;
                    
                }
                else
                {
                    this.errorMessage = '個数を入力してください'
                }
            }
            , setPafCartCount: function()
            {
                var count = 0;
                Object.keys(this.strgPafCart).forEach(k => {
                    this.strgPafCart[k].forEach(v => {
                        count = count + parseInt(v)
                    })
                })
                localStorage.setItem('pafCartCount', parseInt(count));
                this.pafCartCount = count;
                console.log(this.pafCartCount);
            }

            , closeModaltoCashier: function()
            {
                this.showModal = false
            }
        }
        , created: function()
        {
            var count = 0;
            this.pafCart.forEach(v => {
                count = count + parseInt(v)
            })
            if(count > 0){
                this.errorMessage = 'この商品は買い物かごに追加されています'
            }
        }
    })

    $(window).load(function(){

        $(".owl-carousel").owlCarousel({
            items: 1,
            autoHeight: true,
            lazyLoad:true,
            loop: true,
            dots: true,
            nav: true,
            navText: ["",""]
        });
    });

</script>

</body>
</html>