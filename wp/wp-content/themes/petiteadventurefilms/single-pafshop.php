<?php
get_header();

$post_type = get_post_type_object( get_query_var( 'post_type' ));
$term_link = get_post_type_archive_link($post_type->name);
$term_name = $post_type->label;

$price_indexs = get_post_meta_arr($post->ID, "product_info_01");
$price_contents = get_post_meta_arr($post->ID, "product_info_02");

$film_terms = get_the_terms($post, 'filmtags');
$film_id = $film_terms[0]->term_id;

$poster_img = get_post_meta($post->ID, "films_info_00", TRUE);
$gallery_imgs = get_post_meta($post->ID, "films_info_09", FALSE);

$catch = get_post_meta($post->ID, "films_info_21", TRUE);
$prizes = get_post_meta($post->ID, "films_info_07", FALSE);

$genre = get_post_meta($post->ID, "films_info_01", TRUE);
$country = get_post_meta($post->ID, "films_info_02", TRUE);
$year = get_post_meta($post->ID, "films_info_03", TRUE);
$running_time = get_post_meta($post->ID, "films_info_04", TRUE);
$basic_info = array($genre, $country, $year, $running_time);
$basic_info = array_filter($basic_info, "strlen");

$recommend_by = get_post_meta_arr($post->ID, "films_info_12");
$recommends = get_post_meta_arr($post->ID, "films_info_13");

$detail_indexs = get_post_meta_arr($post->ID, "films_info_05");
$detail_contents = get_post_meta_arr($post->ID, "films_info_06");

$teaser = get_post_meta($post->ID, "films_info_08", TRUE);
$movie = get_post_meta($post->ID, "films_info_17", TRUE);

$excerpt = apply_filters('the_content', $post->post_excerpt);

$national_screenings = get_post_meta($post->ID, "films_info_14");
$global_screenings = get_post_meta($post->ID, "films_info_15");
$media_screenings = get_post_meta($post->ID, "films_info_27");

$related_infomation = get_post_meta($post->ID, "films_info_16");

$sell_dvd = get_post_meta($post->ID, "films_info_20");
$sell_dvd_appendix = get_post_meta($post->ID, "films_info_22", TRUE);
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

    <div class="col col_6">
    

        <div id="app">

            <div
            v-for = "(val, key) in priceIndexs"
            :key="'price' + key">
                {{val}} {{convertYen(priceContents[key])}}
                <select v-model="pafCart[key]">
                    <option value="0" selected>個数</option>
                    <option
                    v-for="(val2, key2) in purchaseLimit"
                    :key="'price' + key + key2"
                        :value="val2">{{val2}}</option>
                </select>
            </div>

            <div class="btn priority1">
                <span @click="addCart">カートに追加</span>
            </div>

        </div>

    </div>

    <div class="col col_3 last">
    </div>


</div>

<script type="text/javascript">

    Vue.config.devtools = true;

    var price_indexs = <? echo json_encode($price_indexs) ?>;
    var price_contents = <? echo json_encode($price_contents) ?>;
    var film_id = 'film_<? echo $film_id ?>';

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

    var app = new Vue({
        el: '#app'
      , data: {
            filmID : film_id
          , priceIndexs   : price_indexs
          , priceContents : price_contents
          , purchaseLimit : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
      , computed: {
            pafCart: function()
            {
                return (strgPafCart && strgPafCart[this.filmID]) ? strgPafCart[this.filmID] : [0, 0]
            }
          , pafCartCount: function()
            {
                return strgPafCartCount || 0
            }
        }
      , methods: {      
            convertYen: function(number)
            {
                return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
            }
          , addCart: function()
            {
                var obj = strgPafCart;
                if(obj[this.film] === undefined)
                {
                    obj[this.filmID] = [];
                }
                this.pafCart.forEach(v => {
                    obj[this.filmID].push(v || 0)
                })

                localStorage.setItem('pafCart', JSON.stringify(obj))
                this.setPafCartCount();
            }
          , setPafCartCount: function()
            {
                var count = 0;
                Object.keys(strgPafCart).forEach(k => {
                    strgPafCart[k].forEach(v => {
                        count = count + v
                    })
                })
                localStorage.setItem('pafCartCount', parseInt(count))
                $('.pafCartCount').text(count)
            }
        }
      , created: function()
        {
            $('.pafCartCount').text(strgPafCartCount);
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
<?php get_footer(); ?>