<?php
/*
Template Name: Cashier cart
*/
$film_query = new WP_Query(['post_type' => 'films', 'orderby'=>'ID','order'=>'ASC']);
$shop_query = new WP_Query(['post_type' => 'pafshop', 'orderby'=>'ID','order'=>'ASC']);

$products = [];
$terms = get_terms('filmtags', ['orderby'=>'term_id','order'=>'ASC']);

foreach($terms as $key => $term)
{

    $products[$key]['prod_key'] = $term->term_id;

    foreach($film_query->posts as $film)
    {
        $tags = get_the_terms($film, 'filmtags');
        $tag_id = $tags[0]->term_id;
        if($term->term_id == $tag_id)
        {
            $products[$key]['basic_info'] = $film;
        }
    }
    
    foreach($shop_query->posts as $shop)
    {
        $tags = get_the_terms($shop, 'filmtags');
        $tag_id = $tags[0]->term_id;
        if($term->term_id == $tag_id)
        {


            $price_indexs = get_post_meta_arr($shop->ID, "product_info_01");
            $price_contents = get_post_meta_arr($shop->ID, "product_info_02");
            foreach($price_indexs as $key2 => $index)
            {
                $products[$key]['price_info'][$key2]['index'] = $index;
                $products[$key]['price_info'][$key2]['amount'] = $price_contents[$key2];
            }


        }
    }
    
}


get_header(); ?>

<div class="single">

    <div class="col col_9 last">


        <div id="app">
        
            <div
            v-for = "item in addedItems"
            :key  = "'film_' + item.prod_key">
                {{item.basic_info.post_title}}
                <div
                v-for = "(unit, key) in item.cart"
                :key = "'film_' + item.ID + 'price' + key">
                    <div v-if="unit > 0">
                        {{item.price_info[key].index}}
                        {{convertYen(item.price_info[key].amount)}}
                        <select
                            v-model = "pafCart['film_' + item.prod_key][key]"
                            @change = "updateCart(item.prod_key)">
                            <option
                            v-for="(val2, key2) in purchaseLimit"
                            :key="'film_' + item.ID + 'price' + key + '_' + key2"
                                :value="val2"
                                >{{val2}}</option>
                        </select>
                        <span
                        @click="showModalDelete(item.prod_key, key)"
                            >削除</span>
                        {{convertYen(item.price_info[key].amount * unit)}}
                    </div>
                </div>
                小計 {{convertYen(getSubtotal(item.prod_key))}}

            </div>
            合計　{{convertYen(getTotal())}}

            <modal
            v-show="showModal == true"
                :data="deleteData"
                :products="products"
                @exec="deleteFromCart"
                @close="closeModalDelete"></modal>

        </div>

    </div>

</div>

<style>
.modal-mask {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 304px;
    height: 200px;
    margin-left: -152px;
    margin-top: -100px; 
    box-sizing: border-box;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
    border: 1px solid #eeeeee;
}

</style>

<script type="text/x-template" id="modal-template">
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-container">
                {{item.name}} - {{item.index}}を削除してもよろしいでしょうか
                <div @click="close()">[キャンセル]</div>
                <div @click="update()">[削除]</div>
            </div>
        </div>
    </transition>
</script>

<script type="text/javascript">

    Vue.config.devtools = true;

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

    var products = <? echo json_encode($products); ?>;


    Vue.component("modal", {
        template: "#modal-template"
        , props: ['data', 'products']
        , computed: {
            item: function()
            {
                var prod = this.products.find(a => a.prod_key == this.data.prodKey)
                if(prod)
                {
                    return {
                          name: prod.basic_info.post_title
                        , index: prod.price_info[this.data.key]['index']
                    }
                }

                else
                {
                    return {}
                }
            }
        }
        , methods: {
              update: function(){ this.$emit('exec') }
            , close: function(){ this.$emit('close') }
        }
    });
    
    var app = new Vue({
        el: '#app'
        , data: {
              products: products
            , pafCart : strgPafCart
            , purchaseLimit : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            , showModal: false
            , deleteData: {}
        }
        , computed:
        {
            //カートに追加されている商品情報
            addedItems: function()
            {
                var arg = [];
                Object.keys(this.pafCart).forEach(k => {
                    var filmID = k.replace('film_', '')
                    var film = this.products.find(a => a.prod_key == filmID);
                    if(film)
                    {
                        film.cart = this.pafCart[k]
                        arg.push(film)
                    }
                })
                return arg;
            }
        }
        , methods:
        {

            convertYen: function(number)
            {
                return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
            }

            , updateCart: function(prodKey)
            {
                localStorage.setItem('pafCart', JSON.stringify(this.pafCart))
                this.setPafCartCount();
            }
            , deleteFromCart: function()
            {
                var thisProd = this.deleteData;
                this.pafCart['film_' + thisProd.prodKey][thisProd.key] = 0;
                this.updateCart();
                this.showModal = false;
            }
            , setPafCartCount: function()
            {
                var count = 0;
                Object.keys(this.pafCart).forEach(k => {
                    this.pafCart[k].forEach(v => {
                        count = count + v
                    })
                })
                localStorage.setItem('pafCartCount', parseInt(count))
                $('.pafCartCount').text(count)
            }

            , getSubtotal: function(prodKey)
            {
                
                var prod = this.products.find(v => v.prod_key == prodKey)
                var prices = prod.price_info;

                var sum = 0;
                this.pafCart['film_' + prodKey].forEach((v, k) => {
                    sum = sum + v * (prices[k]['amount'])
                })

                return sum;

            }
            , getTotal: function()
            {


                var sum1 = 0;
                Object.keys(this.pafCart).forEach(k => {

                    var prod = this.products.find(v => v.prod_key == k.replace('film_', ''))
                    var prices = prod.price_info;

                    var sum2 = 0;
                    this.pafCart[k].forEach((v, k) => {
                        sum2 = sum2 + v * prices[k]['amount']
                    })

                    sum1 = sum1 + sum2;

                })

                return sum1;

            }
            , showModalDelete: function(prodKey, key)
            {
                this.showModal = true;
                this.deleteData = { prodKey, key };
            }
            , closeModalDelete: function()
            {
                this.showModal = false;
            }
        }

        , created: function()
        {
            $('.pafCartCount').text(strgPafCartCount);
        }
    })
</script>



<? get_footer(); ?>