<?
// phpinfo();
get_header('pafshop');

$post_type = get_post_type_object( get_query_var( 'post_type' ));
$term_link = get_post_type_archive_link($post_type->name);
$term_name = $post_type->label;

$price_indexs = get_post_meta_arr($post->ID, "product_info_01");
$price_contents = get_post_meta_arr($post->ID, "product_info_02");

$type_indexs = get_post_meta_arr($post->ID, "product_info_07");
$type_contents = get_post_meta_arr($post->ID, "product_info_08");

$dvd_catch = get_post_meta($post->ID, 'product_info_05', TRUE);
$dvd_intro = get_post_meta($post->ID, "product_info_03", TRUE);
$dvd＿configuration = get_post_meta($post->ID, "product_info_04", TRUE);

$dvd＿no_specials = get_post_meta($post->ID, "product_info_06", TRUE);

$film_terms = get_the_terms($post, 'filmtags');
$film_posts = [];

foreach(array_reverse($film_terms) as $key => $term)
{
    $film_id = $term->term_id;

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
    
    $_posts = $film_query->posts;
    $_post = $_posts[0];
    $_post_id = $_post->ID;
    
    $film_posts[$key]['title'] = $_post->post_title;

    $film_posts[$key]['poster_img'] = get_post_meta($_post_id, "films_info_00", TRUE);
    $film_posts[$key]['prizes'] = get_post_meta($_post_id, "films_info_07", FALSE);
    
    $genre = get_post_meta($_post_id, "films_info_01", TRUE);
    $country = get_post_meta($_post_id, "films_info_02", TRUE);
    $year = get_post_meta($_post_id, "films_info_03", TRUE);
    $running_time = get_post_meta($_post_id, "films_info_04", TRUE);
    $basic_info = array($genre, $country, $year, $running_time);
    $film_posts[$key]['basic_info'] = array_filter($basic_info, "strlen");
    
    $film_posts[$key]['detail_indexs'] = get_post_meta_arr($_post_id, "films_info_05");
    $film_posts[$key]['detail_contents'] = get_post_meta_arr($_post_id, "films_info_06");
    
    $film_posts[$key]['credits_indexs'] = get_post_meta_arr($_post_id, "films_info_10");
    $film_posts[$key]['credits_contents'] = get_post_meta_arr($_post_id, "films_info_11");
    
}

?>

<div class="single">

    <header class="col col_9 last header_page">
        <nav class="crumbs">
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<? echo get_bloginfo("url"); ?>" itemprop="url">
                    <span itemprop="title">HOME</span>
                </a>
            </div>
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<? echo $term_link; ?>" itemprop="url">
                    <span itemprop="title"><? echo $term_name; ?></span>
                </a>
            </div>
            <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                <a href="<? echo get_permalink($post->ID); ?>" itemprop="url">
                    <span itemprop="title"><? echo $post->post_title; ?></span>
                </a>
            </div>
        </nav>
        <h1 class="m5_b">
            <? if(is_day()){
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

    <div class="col col_4">
        <? echo get_post_meta_img($poster_img, "large"); ?>
    </div>

    <div class="col col_5 last">
        
        <? if($film_posts[0]['prizes']): ?>
            <div class="subhead1 m2_b">
            <? foreach($film_posts[0]['prizes'] as $prize): ?>
                <p><? echo $prize; ?></p>
            <? endforeach; ?>
            </div>
        <? endif; ?>
        
        <? if($dvd_catch): ?>
            <div class="subhead1 m2_b">
                <p><? echo $dvd_catch; ?></p>
            </div>
        <? endif; ?>
    
        <div
        v-for = "(val, key) in priceIndexs"
        :key="'price' + key"
            class="m1_t">
            
            {{val}}
            
            <span v-if="typeContents">
                <select
                v-if="typeContents[key].length > 1"
                    v-model="pafCartTypes[key]">
                    <option
                    v-for="(val3, key3) in typeContents[key]"
                    :key="'type' + key + key3"
                        :value="key3">{{val3}}</option>
                </select>
                <span v-else>
                    {{typeContents[key][0]}}
                </span>
            </span>
            
            {{convertYen(priceContents[key])}}
            
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
            <div @click="displayTab = 2" :class="['_tab cursor_pointer', (displayTab == 2) ? '_selected' : '']">
                <? echo ($dvd＿no_specials) ? '本編の詳細' : '特典の詳細'; ?></div>
            <div @click="displayTab = 3" :class="['_tab cursor_pointer', (displayTab == 3) ? '_selected' : '']">制作クレジット</div>
        </div>
    </div>
    
    <div v-if="displayTab == 1" class="m2_t">
        
        <div class="col col_9 last">
        
            <? foreach($film_posts as $key => $_post): ?>
            
                <? if($_post['detail_indexs']):?>
                    <? if(count($film_posts) > 1): ?>
                        <div class="<? echo ($key > 0) ? 'm1_t' : ''; ?>"><? echo $_post['title']; ?></div>
                    <? endif; ?>
                    <dl class="list_definition">
                    <? for($i=0; $i<count($_post['detail_indexs']); $i++): ?>
                        <? if(mb_strpos($_post['detail_indexs'][$i],'監督') !== false): ?>
                            <? echo $_post['detail_indexs'][$i] ? "<dt>".$_post['detail_indexs'][$i]."</dt>" : ""; ?>
                            <? echo $_post['detail_contents'][$i] ? "<dd>".$_post['detail_contents'][$i]."</dd>" : ""; ?>
                        <? endif; ?>
                    <? endfor; ?>
                    </dl>
                    <div class="clear"></div>
                <? endif;?>
                <? if($_post['basic_info']): ?>
                    <p><? echo implode(" / ", $_post['basic_info']); ?></p>
                <? endif; ?>
            <? endforeach; ?>
            
            
            <? if($dvd＿configuration): ?>
                <div class="m1_t">
                    <? echo $dvd＿configuration; ?>
                </div>
            <? endif; ?>
            
            <? if($dvd_intro): ?>
                <div class="m1_t">
                    <? echo $dvd_intro; ?>
                </div>
            <? endif; ?>
            
            <p class="m2_t">DVD購入や上映についてのお問い合わせはこちらから</p>
            <div class="inline_block btn priority1">
                <a href="<? echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
            </div>
            
        </div>
        
    </div>
    
    <div v-if="displayTab == 2" class="m2_t">
        
        <div class="col col_9 last _specials">
            <? echo apply_filters('the_content', $post->post_content); ?>
        </div>
        
    </div>
    
    <div v-if="displayTab == 3">
        
        <div class="m2_t">
            <? foreach($film_posts as $key => $_post): ?>
                <? if($_post['credits_indexs']): ?>
                    <? if(count($film_posts) > 1): ?>
                        <div class="col col_9 last<? echo ($key > 0) ? ' m2_t': ''; ?>"><? echo $_post['title']; ?></div>
                    <? endif; ?>
                    <div v-masonry item-selector="._credit_<? echo $i; ?>">
                        <? for($i=0; $i<count($_post['credits_indexs']); $i++): ?>
                            <div class="col col_3 _credit _credit__<? echo $i; ?> m1_t" v-masonry-tile>
                                <p><? echo $_post['credits_indexs'][$i]; ?></p>
                                <? echo $_post['credits_contents'][$i]; ?>
                            </div>
                        <? endfor; ?>
                    </div>
                </div>
                <? endif;?>
            <? endforeach; ?>
        </div>
    
    </div>
    <div class="clear"></div>

</div><!--.single-->

<? get_footer('scripts'); ?>

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
                    <a href="<? echo get_permalink(get_page_by_path("cashier")); ?>">買い物かごを見る</span>
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
    
    var has_types = <? echo json_encode($type_contents) ?> || false;
    var type_indexs = <? echo json_encode($type_indexs) ?>;
    var type_contents = <? echo json_encode($type_contents) ?>;
    if(type_contents){
        type_contents.forEach((v, k) => {
            type_contents[k] = v.split(',');
        })
    }
    
    var film_id = 'film_<? echo $film_id ?>';
    
    var emptyPafCart = [];
    var emptyPafCartTypes = [];
    for(var i of price_indexs){
        emptyPafCart.push(0);
        emptyPafCartTypes.push(0);
    }

    if(!JSON.parse(localStorage.getItem('pafCart'))){
        localStorage.setItem('pafCart', JSON.stringify({}));
    }
    
    if(!JSON.parse(localStorage.getItem('pafCartTypes'))){
        localStorage.setItem('pafCartTypes', JSON.stringify({}));
    }

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart'));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);
    var strgPafCartTypes = (has_types) ? JSON.parse(localStorage.getItem('pafCartTypes')) : false;
    

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
            
            , typeIndexs : type_indexs || false
            , typeContents : type_contents || false
            
            , purchaseLimit : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            , strgPafCart : strgPafCart
            , strgPafCartTypes: strgPafCartTypes
            , pafCart : (strgPafCart && strgPafCart[film_id]) ? strgPafCart[film_id] : emptyPafCart
            , pafCartTypes : (strgPafCartTypes && strgPafCartTypes[film_id]) ? strgPafCartTypes[film_id] : emptyPafCartTypes
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
                    
                    if(strgPafCartTypes)
                    {
                        if(this.strgPafCartTypes[this.film] === undefined)
                        {
                            this.strgPafCartTypes[this.filmID] = [];
                        }
                        this.pafCartTypes.forEach(v => {
                            this.strgPafCartTypes[this.filmID].push(v || 0)
                        })
                        localStorage.setItem('pafCartTypes', JSON.stringify(this.strgPafCartTypes))
                    
                    }

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
        console.log('pafCart', this.pafCart);
        console.log('pafCartTypes', this.pafCartTypes)
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