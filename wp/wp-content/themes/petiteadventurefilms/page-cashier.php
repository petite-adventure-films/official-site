<?php get_header('pafshop'); ?>

<div class="single_pafshop">

    <header class="col col_6 last header_page">
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

    <div class="col col_6 last">

        <div
        v-if="pafCartCount > 0">
        
            <div class="order_details">
                <div
                v-for = "item in addedItems"
                :key  = "'film_' + item.prod_key"
                    class="_item">
                    <div class="_name subhead2">{{item.basic_info.post_title}}</div>
                    <div
                    v-for = "(unit, key) in item.cart"
                    :key = "'film_' + item.ID + 'price' + key"
                        v-if="unit > 0"
                        class="_details">
                            <div class="cell __index">
                                {{item.price_info[key].index}}
                                <span v-if="pafCartTypes[`film_${item.prod_key}`][key] == 2" class="inline_block">
                                    (ブルーレイ)
                                </span>
                            </div>
                            <div class="__detail_unit_amount_sum">
                                <div class="cell __unit al_r">
                                    {{convertYen(item.price_info[key].amount)}}
                                </div>
                                <div class="cell __amount al_c">
                                    <select
                                    v-model = "pafCart['film_' + item.prod_key][key]"
                                    @change = "updateCart(item.prod_key)">
                                        <option
                                        v-for="(val2, key2) in purchaseLimit"
                                        :key="'film_' + item.ID + 'price' + key + '_' + key2"
                                            :value="val2"
                                            >{{val2}}</option>
                                    </select>
                                    <span class="___btn_delete cursor_pointer" @click="showModalDelete(item.prod_key, key)">削除</span>
                                </div>
                                <div class="cell __sum al_r">
                                    {{convertYen(item.price_info[key].amount * unit)}}
                                </div>
                            </div>
                    </div>
                </div>
            </div>
    
            <div class="fee">
                <span class="_fee_index">商品小計</span>
                <span class="_fee_amount">{{convertYen(getTotal())}}</span>
            </div>
    
            <div class="fee">
                <span class="_fee_index">配送料</span>
                <span class="_fee_amount">{{convertYen(deliveryFee)}}</span>
            </div>
            
            <div class="total subhead2">
                <span class="_fee_index">合計</span>
                <span class="_fee_amount">{{convertYen(getTotal(true))}}</span>
            </div>
            <p class="m1_t footnotes caption1">
                <small>※DISC種類の記載がない場合はDVDです</small><br>
                <small>※価格には消費税が含まれています</small><br>
                <small>※1回のご注文ごとに送料300円が掛かります</small><br>
                <span class="pink">3,000円以上のお買い上げで送料無料！</span></small>
            </p>
    
            <div class="btn shop m2_t">
                <a href="<?php echo get_permalink(get_page_by_path("cashier/purchase")); ?>">注文する</a>
            </div>
    
        </div>
    
        <div v-else>
            <p>お客様の買い物かごに商品はありません。</p>
        </div>

    </div>

</div><!--.single-->

<?php get_footer('scripts'); ?>

<modal
v-if="showModal == true"
    :data="deleteData"
    :products="products"
    @exec="deleteFromCart"
    @close="closeModalDelete"></modal>


<script type="text/x-template" id="modal-template">
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-container">
                <div class="icon icon-close" @click="close()"></div>
                <div class="confirm_btns">
                    <span v-html="`${item.name} [${item.index}]を削除してもよろしいでしょうか`"></span>
                    <div class="btn cursor_pointer m2_t" @click="close()">
                        <span class="ele">キャンセル</span>
                    </div>
                    <div class="btn priority1 cursor_pointer m1_t" @click="update()">
                        <span class="ele">削除</span>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</script>

<script type="text/javascript">

    Vue.config.devtools = true;

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
    var strgPafCartTypes = JSON.parse(localStorage.getItem('pafCartTypes')) || localStorage.setItem('pafCartTypes', JSON.stringify({}));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

    var products = <? echo json_encode(get_products()); ?>;

    Vue.component('modal', {
        template: '#modal-template'
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
            , pafCart : strgPafCart || {}
            , pafCartTypes : strgPafCartTypes || {}
            , pafCartCount: strgPafCartCount || 0
            , purchaseLimit : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            , showModal: false
            , deleteData: {}
            , deliveryFee: 0
        }
        , computed:
        {
            //カートに追加されている商品情報
            addedItems: function()
            {
                var arg = [];
                if(Object.keys(this.pafCart).length > 0){
                    Object.keys(this.pafCart).forEach(k => {
                        var filmID = k.replace('film_', '')
                        var film = this.products.find(a => a.prod_key == filmID);
                        if(film)
                        {
                            film.cart = this.pafCart[k]
                            arg.push(film)
                        }
                    })
                }
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
                        count = count + parseInt(v)
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

            , getTotal: function(includeDeliveryFee)
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
                
                this.deliveryFee = (sum1 >= 3000) ? 0 : 300;

                if(includeDeliveryFee) sum1 = sum1 + this.deliveryFee;

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

</body>
</html>