<?php
get_header(); ?>

<div class="single">

    <div class="col col_9 last">


        <div class="btn">
            <a href="<?php echo get_post_type_archive_link('pafshop'); ?>">買い物を続ける</a>   
        </div>

        <br>

        <div id="app">

            <div
            v-if="addedItems">

                <h2>注文内容</h2>
            
                <div
                v-for = "item in addedItems"
                :key  = "'film_' + item.prod_key"
                    class="invoice">
                    <div class="product_name">{{item.basic_info.post_title}}</div>
                    <div
                    v-for = "(unit, key) in item.cart"
                    :key = "'film_' + item.ID + 'price' + key">
                        <div v-if="unit > 0" class="record">
                            <div class="cell index">
                                {{item.price_info[key].index}}
                            </div>
                            <div class="cell amount">
                                {{convertYen(item.price_info[key].amount)}}
                            </div>
                            <div class="cell unit">
                                <select
                                    v-model = "pafCart['film_' + item.prod_key][key]"
                                    @change = "updateCart(item.prod_key)">
                                    <option
                                    v-for="(val2, key2) in purchaseLimit"
                                    :key="'film_' + item.ID + 'price' + key + '_' + key2"
                                        :value="val2"
                                        >{{val2}}</option>
                                </select>
                            </div>
                            <div class="cell delete">
                                <a
                                @click="showModalDelete(item.prod_key, key)"
                                    >削除</a>
                            </div>
                            <div class="cell sum">
                                {{convertYen(item.price_info[key].amount * unit)}}
                            </div>
                        </div>
                    </div>
                    <div class="subtotal">
                        小計 {{convertYen(getSubtotal(item.prod_key))}}<br>
                    </div>            
                </div>

                <div class="fee">
                    商品小計　{{convertYen(getTotal())}}
                </div>

                <div class="fee">
                    配送料　{{convertYen('500')}}
                </div>

                <div class="total">合計 {{convertYen(getTotal(true))}}</div>

                
                <div class="btn shop">
                    <a href="<?php echo get_permalink(get_page_by_path("cashier/purchase")); ?>">注文する</a>
                </div>

                <modal
                v-show="showModal == true"
                    :data="deleteData"
                    :products="products"
                    @exec="deleteFromCart"
                    @close="closeModalDelete"></modal>

            </div>

            <div v-else>
                カートに商品はまだありません
            </div>

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
    margin-left: -152px;
    margin-top: -140px; 
    box-sizing: border-box;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
    border: 1px solid #eeeeee;
}

.fee{
    margin-top: 8px;
    padding: 4px 8px;
    border: 1px solid #eeeeee;
    text-align: right;
}

.product{
    padding: 8px;
    border: 1px solid #eeeeee;
}

.total{
    margin-top: 8px;
    padding: 8px;
    background: #ffcce4;
    text-align: right;
}

.invoice{
    border: 1px solid #eeeeee;
}
.invoice:not(:nth-of-type(1)){
    margin-top: 8px;
}
.invoice .product_name{
    padding: 8px;
    border-bottom: 1px solid #eeeeee;
}
.invoice .subtotal{
    border-top: 1px solid #eeeeee;
    text-align: right;
    padding: 4px 8px;
    background: #efefef;
}
.invoice .record{
    display: table;
    padding: 4px 8px;
    width: 100%;
    box-sizing: border-box;
}
.invoice .record .cell{
    display: table-cell;
}
.invoice .record .index{ width: 156px; }
.invoice .record .amount{ width: 64px; text-align: right; }
.invoice .record .unit{ width: 56px; text-align: center; }
.invoice .record .delete{ width: 40px; text-align: center; }
.invoice .record .sum{ text-align: right; }

</style>

<script type="text/x-template" id="modal-template">
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-container">
                {{item.name}} - {{item.index}}を削除してもよろしいでしょうか
                <div class="btn" @click="close()">
                    <span class="ele">キャンセル</span>
                </div>
                <div class="btn" @click="update()">
                    <span class="ele">削除</span>
                </div>
            </div>
        </div>
    </transition>
</script>

<script type="text/javascript">

    Vue.config.devtools = true;

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
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

            , getTotal: function(deliveryFee)
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

                if(deliveryFee) sum1 = sum1 + 500;

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