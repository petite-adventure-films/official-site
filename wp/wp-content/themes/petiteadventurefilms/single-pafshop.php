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

$disc_indexs  = get_post_meta_arr($post->ID, "product_info_09");
$disc_numbers = get_post_meta_arr($post->ID, "product_info_10");
$disc_types    = get_post_meta_arr($post->ID, "product_info_11");
$disc_contents = get_post_meta($post->ID, "product_info_12", TRUE);

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

    $film_posts[$key]['dvd_front'] = get_post_meta($_post_id, 'films_info_00', TRUE);
    $film_posts[$key]['dvd_back'] = get_post_meta($_post_id, 'films_info_31', TRUE);
    $film_posts[$key]['dvd_front_en'] = get_post_meta($_post_id, 'films_info_23', TRUE);
    $film_posts[$key]['dvd_back_en'] = get_post_meta($_post_id, 'films_info_33', TRUE);
    $film_posts[$key]['dvd_specials'] = get_post_meta($_post_id, 'films_info_32', TRUE);
    
    $film_posts[$key]['prizes'] = get_post_meta($_post_id, 'films_info_07', FALSE);
    
    $genre = get_post_meta($_post_id, 'films_info_01', TRUE);
    $country = get_post_meta($_post_id, 'films_info_02', TRUE);
    $year = get_post_meta($_post_id, 'films_info_03', TRUE);
    $running_time = get_post_meta($_post_id, 'films_info_04', TRUE);
    $basic_info = array($genre, $country, $year, $running_time);
    $film_posts[$key]['basic_info'] = array_filter($basic_info, "strlen");
    
    $film_posts[$key]['detail_indexs'] = get_post_meta_arr($_post_id, 'films_info_05');
    $film_posts[$key]['detail_contents'] = get_post_meta_arr($_post_id, 'films_info_06');
    
    $film_posts[$key]['credits_indexs'] = get_post_meta_arr($_post_id, 'films_info_10');
    $film_posts[$key]['credits_contents'] = get_post_meta_arr($_post_id, 'films_info_11');
    
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
        
        <div class="owl-carousel">
            <div class="slide"><? echo get_post_meta_img($film_posts[0]['dvd_front'], 'large', 'preload'); ?></div>
            <div class="slide"><? echo get_post_meta_img($film_posts[0]['dvd_back'], 'large', 'preload'); ?></div>
            <? if($film_posts[0]['dvd_front_en']): ?>
                <div class="slide"><? echo get_post_meta_img($film_posts[0]['dvd_front_en'], 'large', 'preload'); ?></div>
            <? endif; ?>
            <? if($film_posts[0]['dvd_back_en']): ?>
                <div class="slide"><? echo get_post_meta_img($film_posts[0]['dvd_back_en'], 'large', 'preload'); ?></div>
            <? endif; ?>
            <? if($film_posts[0]['dvd_specials']): ?>
                <div class="slide"><? echo get_post_meta_img($film_posts[0]['dvd_specials'], 'large', 'preload'); ?></div>
            <? endif; ?>
        </div>
				
    </div>

    <div class="col col_5 last">
        
        <? if($film_posts[0]['prizes']): ?>
            <div class="subhead2 pink m1_b">
            <? foreach($film_posts[0]['prizes'] as $prize): ?>
                <? echo $prize; ?></p>
            <? endforeach; ?>
            </div>
        <? endif; ?>
        
        <? if($dvd_catch): ?>
            <div class="subhead2 pink m1_b">
                <? echo $dvd_catch; ?>
            </div>
        <? endif; ?>
        
        <dl class="_disc_details">
            <dt class="grid _1_1">構成</dt>
            <dd class="grid _1_2">
                <? foreach($disc_indexs as $key => $disc): ?><? if($key > 0): ?>､または<? endif;?><? echo $disc_indexs[$key]; ?><? echo $disc_numbers[$key]; ?>枚組<? endforeach; ?>
            </dd>
            <dt class="grid _2_1">ディスク種類</dt>
            <dd class="grid _2_2">
                <? foreach($disc_indexs as $key => $disc): ?>
                    <span class="block"><? if(count($disc_indexs) > 1): ?><? echo $disc_indexs[$key]; ?>: <? endif; ?><? echo $disc_types[$key]; ?></span>
                <? endforeach; ?>
            </dd>
            <dt class="grid _3_1">収録内容</dt>
            <dd class="grid _3_2"><? echo $disc_contents; ?></dd>
        </dl>

        <div class="price_systems m1_t">    
            <div
            v-for = "(val, key) in priceIndexs"
            :key="'price' + key"
                class="m1_t _system">
                
                <span class="__index">
                    {{val}}
                    <span v-if="typeContents.length > 0">
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
                </span>
                
                <span class="__price al_r">{{convertYen(priceContents[key])}}</span>
                
                <select class="__unit" v-model="pafCart[key]">
                    <option value=0 selected>個数</option>
                    <option
                    v-for="(val2, key2) in purchaseLimit"
                    :key="'price' + key + key2"
                        :value="val2">{{val2}}</option>
                </select>
            </div>
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
            <div @click="displayTab = 1" :class="['_tab cursor_pointer', (displayTab == 1) ? '_selected' : '']">概要</div>
            <div @click="displayTab = 2" :class="['_tab cursor_pointer', (displayTab == 2) ? '_selected' : '']">
                <? echo ($dvd＿no_specials) ? '本編' : '特典'; ?></div>
            <div @click="displayTab = 3" :class="['_tab cursor_pointer', (displayTab == 3) ? '_selected' : '']">制作クレジット</div>
        </div>
    </div>
    
    <div v-if="displayTab == 1" class="m2_t">
        
        <div class="col col_9 last">
        
            <? foreach($film_posts as $key => $_post): ?>
                <? if(count($film_posts) > 1): ?>
                    <div class="<? echo ($key > 0) ? ' m1_t': ''; ?>">
                        <span class="subhead2"><? echo $_post['title']; ?></span>
                    </div>
                <? endif; ?>
                <dl class="list_definition">
                    <dt>監督</dt><dd>早川由美子</dd>
                </dl>
                <div class="clear"></div>
                <? if($_post['basic_info']): ?>
                    <p><? echo implode(" / ", $_post['basic_info']); ?></p>
                <? endif; ?>
            <? endforeach; ?>
        
            <? if($dvd_intro): ?>
                <div class="_intro">
                    <? echo $dvd_intro; ?>
                </div>
            <? endif; ?>
            
        </div>
        
    </div>
    
    <div v-if="displayTab == 2" class="m2_t">
        
        <div class="col col_9 last _specials">
            <? echo apply_filters('the_content', $post->post_content); ?>
        </div>
        
    </div>
    
    <div v-if="displayTab == 3" class="m2_t">
    
        <? foreach($film_posts as $key => $_post): ?>
            <div class="p1_l <? echo ($key > 0) ? ' m2_t': ''; ?>">
                <span class="subhead2"><? echo $_post['title']; ?></span>
                <span class="caption2">(敬称略)</span>
            </div>
            <div v-masonry item-selector="._credit_<? echo $key; ?>">
                <? for($i=0; $i<count($_post['credits_indexs']); $i++): ?>
                    <div class="col col_3 _credit _credit_<? echo $key; ?>" v-masonry-tile>
                        <p class="bold"><? echo $_post['credits_indexs'][$i]; ?></p>
                        <div class="m1_t"><? echo $_post['credits_contents'][$i]; ?></div>
                    </div>
                <? endfor; ?>
            </div>
        <? endforeach; ?>
               
    </div>

    <div class="col col_9 last contents">
        <p class="m4_t">DVD購入や上映についてのお問い合わせはこちらから</p>
        <div class="inline_block btn priority1">
            <a href="<? echo get_permalink(get_page_by_path("contact_jp")); ?>">お問い合わせ</a>
        </div>
    </div>
    

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
    var _type_contents = [];
    if(type_contents)
    {
        price_indexs.forEach((v, k) => {
            var key = type_indexs.findIndex((v2, k2) => v2 == v);
            console.log('key', key);
            if(key > -1)
            {
                _type_contents[k] = type_contents[key].split(',');
            }
            else
            {
                _type_contents[k] = ['DVD'];
            }
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
            , typeContents : _type_contents || false
            
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