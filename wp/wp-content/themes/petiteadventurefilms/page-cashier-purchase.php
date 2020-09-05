<?php
/*
Template Name: Cashier purchase
*/
$film_query = new WP_Query(['post_type' => 'films', 'orderby'=>'ID','order'=>'ASC']);
$shop_query = new WP_Query(['post_type' => 'pafshop', 'orderby'=>'ID','order'=>'ASC']);

$products = [];
$terms = get_terms('filmtags', ['orderby'=>'term_id','order'=>'ASC']);


date_default_timezone_set('Asia/Tokyo');
$submit_date = date('mdH', time()); //送信タイム
$orderID = cms_title('dvdorder', $submit_date, 'J');

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


            <h2>step1. {{(step == 1) ? '注文内容を確認してください' : '注文内容'}}</h2>
        
            <div
            v-for = "item in addedItems"
            :key  = "'film_' + item.prod_key"
                class="invoice">
                <div class="product_name">{{item.basic_info.post_title}}</div>
                <div
                v-for = "(unit, key) in item.cart"
                :key = "'film_' + item.ID + 'price' + key">
                    <div v-if="unit > 0" class="record">
                        <div class="cell index">{{item.price_info[key].index}}</div>
                        <div class="cell amount">{{convertYen(item.price_info[key].amount)}}</div>
                        <div class="cell unit">{{unit}}</div>
                        <div class="cell sum">{{convertYen(item.price_info[key].amount * unit)}}</div>
                    </div>
                </div>
                <div class="subtotal">
                    小計 {{convertYen(getSubtotal(item.prod_key))}}
                </div>

            </div>
            
            <div class="fee">
                商品小計　{{convertYen(getTotal())}}
            </div>

            <div class="fee">
                配送料　{{convertYen('500')}}
            </div>

            <div class="total">合計 {{convertYen(getTotal(true))}}</div>

            <div v-if="step == 1">
                <div class="mt-2">注文内容に問題なければ、次へお進みください。</div>
                <div class="btn shop" @click="completeCheckOrder">
                    <span class="ele">次へすすむ</span>
                </div>
            </div>


            <br>
            <h2>step2. {{(step == 2) ? '注文者情報を入力してください' : '注文者情報の入力'}}</h2>
            <div v-if="step == 2">
                <?php include (TEMPLATEPATH . "/_order_jp_form_2.php"); ?>
            </div>
            <div v-if="step > 2">
                <div @click="step = 2" class="btn"><span class="ele">編集する</span></div>
                {{user.name}}<br>
                {{user.zipcode}}<br>
                {{user.prefecture}}{{user.city}}{{user.address1}}<br>
                {{user.address2}}<br>
                {{user.tel}}<br>
                {{user.email}}<br>
                領収書{{(user.receipt == true) ? '必要' : '不要'}}
                <div v-if="user.receipt == true">
                {{(user.receiptName) ? user.receiptName : '-'}}<br>
                {{user.receiptDescription ? user.receiptDescription : '-'}}
                </div>               
            </div>

            <br>
            <h2>step3. {{(step == 3) ? 'お支払い情報を選択してください' : 'お支払い方法の選択'}}</h2>
            <div v-if="step == 3">

                <div v-if="paymentMethod != 2">
                    <input type="radio" v-model="paymentMethod" value="1" id="paymentMethod1"><label for="paymentMethod1">銀行振込</label><br>
                    [銀行ロゴ]<br>
                    振込先情報は注文完了後の確認メールに記載されております。<br>振込手数料はご負担下さい。
                </div>

                <div v-if="paymentMethod != 1">
                    <input type="radio" v-model="paymentMethod" value="2" id="paymentMethod2"><label for="paymentMethod2">クレジットカード</label><br>
                    [クレジットカードロゴ]<br>
                    注文完了後、お支払い画面へ移動します。
                </div>
                
                <div
                v-if="paymentMethod != 0"
                    :class="(paymentMethod > 0) ? 'shop' : 'disabled'"
                    @click="execPayment()" class="btn">
                    <span class="ele">{{(paymentMethod == 1) ? '注文を完了する' : 'お支払いへ進む'}}</span>
                </div>
                
                <div v-if="paymentMethod != 0" @click="paymentMethod = 0">選びなおす</div>


                <modal-payment
                v-if="modalPayment === true"
                    :total="getTotal()" 
                    :orderid="orderID"
                    @complete="completePayment()"
                    @close="closeModalPayment()"></modal-payment>
            </div>


            <modal-execution
                v-if="modalExecution === true"></modal-execution>

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

<script type="text/x-template" id="template-modal-payment">
    <div class="modal-mask">
        <div class="modal-container">
            <div ref="cardElement"></div>
            {{paymentMessage}}
            <div
            v-if="paymentCompleted === false && isExecuting == false"
            @click="pay()" 
            :class="(isEntered == true) ? 'shop' : 'disabled'"
            class="btn"
                ><span class="ele">お支払いする</span></div>
            <div
            v-if="paymentCompleted === true && isExecuting == false"
            @click="complete()" 
            class="btn shop"
                ><span class="ele">注文を完了する</span></div>
            <div v-if="paymentCompleted === false && isExecuting == false" @click="close()">お支払い方法選択に戻る</div>
        </div>
    </div>
</script>

<script type="text/x-template" id="template-modal-execution">
    <div class="modal-mask">
        <div class="modal-container">
            処理中です。しばらくお待ちください。
        </div>
    </div>
</script>


<script type="text/javascript">

    Vue.config.devtools = true;

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

    var products = <? echo json_encode($products); ?>;
    var orderID = '<? echo $orderID; ?>'


    Vue.component('modal-payment', {
        template: '#template-modal-payment'
        , props: ['orderid', 'total']
        , data: function(){
            return {
                  paymentMessage: ''
                , paymentCompleted: false
                , isEntered: false
                , isExecuting: false
            }
        }
        , computed: {
            
        }
        , methods: {
            async pay()
            {

                this.isExecuting = true
                this.paymentMessage = 'お支払い中です'

                try {
                    var tokenResult = await this.stripe.createToken(this.card)
                    if (
                        !tokenResult ||
                        !tokenResult.token ||
                        !tokenResult.token.id ||
                        tokenResult.token.id === ''
                    ) {
                        throw new Error('トークン発行エラー')
                    }

                    var url = '/charge.php'
                    var params = {
                          token: tokenResult.token.id
                        , amount: this.total
                        , orderID: this.orderid
                    }
                    var chargeResult = await axios.post(url, params)
                    
                    if (!chargeResult || chargeResult.data !== 'success') {
                        throw new Error('お支払いエラー')
                    }

                    this.paymentMessage = 'お支払いに成功しました'
                    this.paymentCompleted = true
                    this.isExecuting = false

                }
                catch(error)
                {
                    this.paymentMessage = error.message
                }

            }


            , input: function(e)
            {
                this.isEntered = false;
            }
            , change: function(e)
            {
                if(e.complete){
                    this.isEntered = true;
                    this.paymentMessage = ''
                }
                else{
                    this.isEntered = false;
                    if(e.error)
                    {
                        this.paymentMessage = e.error.message
                    }
                }
            }
            , complete: function(){ this.$emit('complete') }
            , close: function(){ this.$emit('close') }
            
        }

        , mounted: function(){
            this.stripe = Stripe('pk_test_51H8OJOKluK1zP0j9cc4YOhcbQhCa8G31WAFcxruwZkvh9VIFNfFO11CFbY7tqQtTuqZqXvfOlEYtcKlQjzhFNbYi00EsaSxkXR');
            this.card = this.stripe.elements().create('card', {
                hidePostalCode: true
                , style: {
                    base: {
                        lineHeight: '44px'
                    }
                }
            })
            this.card.mount(this.$refs.cardElement);
            this.card.addEventListener('input', this.input);
            this.card.addEventListener('change', this.change);
        }
    });


    Vue.component('modal-execution', {
        template: '#template-modal-execution'
    })

    var app = new Vue({
        el: '#app'
        , data: {
              products: products
            , pafCart : strgPafCart
            , step : 1
            , user:{
                  name: ''
                , zipcode: ''
                , prefecture: ''
                , city: ''
                , address1: ''
                , tel: ''
                , email: ''
                , emailConfirm: ''
                , receipt: false
                , receiptName: ''
                , receiptDescription: ''
                , agree: false

                // name: 'restard'
                // , zipcode: '1500034'
                // , prefecture: '東京都'
                // , city: '渋谷区神山町'
                // , address1: '41-7'
                // , address2: 'エクティ神山町209'
                // , tel: '08039118917'
                // , email: 'drestard@gmail.com'
                // , emailConfirm: 'drestard@gmail.com'
                // , receipt: true
                // , receiptName: 'お宛名'
                // , receiptDescription: '但し書き'
                // , agree: true
            }
            , errors:{
                  agree: '必ずチェックしてください'
                , name: false
                , zipcode: false
                , prefecture: false
                , city: false
                , address1: false
                , tel: false
                , email: false
                , emailConfirm: false
            }

            , modalExecution: false
            , modalPayment: false
            , paymentMethod: 0
            , stripePK: 'pk_test_51H8OJOKluK1zP0j9cc4YOhcbQhCa8G31WAFcxruwZkvh9VIFNfFO11CFbY7tqQtTuqZqXvfOlEYtcKlQjzhFNbYi00EsaSxkXR'
            , paymenErrorMessage: ''
            , stripe: false
            , cardElement: false
            , orderID: orderID

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

            , order: function()
            {
                var arg = []
                this.addedItems.forEach(a => {
                    a.cart.forEach((v, k) => {
                        if(v > 0){
                            arg.push(`${a.basic_info.post_title }[${a.price_info[k].index}] : ${v}`)
                        }
                    })
                })
                return arg
            }
        }

        , methods:
        {

            convertYen: function(number)
            {
                return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
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

                if(deliveryFee) sum1 = sum1 + 500

                return sum1;

            }


            , async completePayment()
            {

                this.modalPayment = false;
                this.modalExecution = true;

                var params = this.user;
                params.order = this.order;
                params.orderID = this.orderID;
                params.subtotal = this.convertYen(this.getTotal());
                params.total = this.convertYen(this.getTotal(true));
                params.paymentMethod = (this.paymentMethod == 1) ? '銀行振込' : 'クレジットカード';

                if(this.user.receipt == true)
                {
                    params.receiptName = this.user.receiptName ? this.user.receiptName : '-'
                    params.receiptDescription = this.user.receiptDescription ? this.user.receiptDescription : '-'
                }
                else
                {
                    delete params.receiptName
                    delete params.receiptDescription
                }

                var url = '<? echo get_permalink(get_page_by_path('cashier/complete')); ?>'
                var res = await axios.post(url, params)
                if(res){
                    if(res.status === 200)
                    {
                        this.modalPayment = false;
                        localStorage.removeItem('pafCart');
                        localStorage.removeItem('pafCartCount');
                        window.location.href = '<? echo get_permalink(get_page_by_path('cashier/thanks')); ?>'
                    }
                }
            }

            , execPayment: function()
            {
                if(this.paymentMethod == 1)
                {
                    this.completePayment();
                }

                else if(this.paymentMethod == 2)
                {
                    this.modalPayment = true;
                }
            }

            , closeModalPayment: function()
            {
                this.modalPayment = false;
            }

            , async searchAddress()
            {
                let url = '/zipsearch.php?zipcode=' + this.user.zipcode
                let res = await axios.get(url)
                if(res.status === 200)
                {
                    var data = res.data.results
                    if(data)
                    {
                        this.user.prefecture = data[0].address1;
                        this.user.city = data[0].address2 + data[0].address3;
                    }
                }
            }

            , checkName: function()
            {
                this.errors['name'] = false
                if(this.user.name === '')
                {
                    this.errors['name'] = '名前がありません'
                }
            }
            , checkZipcode: function()
            {
                this.errors['zipcode'] = false
                if(this.user.zipcode === '')
                {
                    this.errors['zipcode'] = '郵便番号がありません'
                }
                else if(!/^\d{7}$/.test(this.user.zipcode))
                {
                    this.errors['zipcode'] = '正しい郵便番号を入力ください'
                }
            }
            , checkPrefecture: function()
            {
                this.errors['prefecture'] = false
                if(this.user.prefecture === '')
                {
                    this.errors['prefecture'] = '都道府県を入力してください'
                }
            }
            , checkCity: function()
            {
                this.errors['city'] = false
                if(this.user.city === '')
                {
                    this.errors['city'] = '市区町村を入力してください'
                }
            }
            , checkAddress1: function()
            {
                this.errors['address1'] = false
                if(this.user.address1 === '')
                {
                    this.errors['address1'] = '番地を入力してください'
                }
            }
            , checkTel: function()
            {
                this.errors['tel'] = false
                if(this.user.tel === '')
                {
                    this.errors['tel'] = '電話番号を入力してください'
                }
                else if(!/^\d{10,11}$/.test(this.user.tel))
                {
                    this.errors['tel'] = '正しい郵便番号を入力ください'
                }

            }
            , checkEmail: function()
            {
                this.errors['email'] = false
                if(this.user.email === '')
                {
                    this.errors['email'] = 'メールを入力してください'
                }
                else if(!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.user.email))
                {
                    this.errors['email'] = '正しいメールアドレスを入力ください'
                }
            }
            , checkEmailConfirm: function()
            {
                this.errors['emailConfirm'] = false
                if(this.user.emailConfirm === '')
                {
                    this.errors['emailConfirm'] = 'メールを入力してください'
                }
                else if(this.user.email != this.user.emailConfirm)
                {
                    this.errors['emailConfirm'] = 'メールアドレスが一致しません'
                }
            }
            , checkAgree: function()
            {
                this.errors['agree'] = false
                if(this.user.agree === false)
                {
                    this.errors['agree'] = '必ずチェックしてください'
                    // throw this.errors['agree']
                }
            }
            , completeUserInfo: function()
            {
                try {
                    
                    this.checkName();
                    this.checkZipcode();
                    this.checkPrefecture();
                    this.checkCity();
                    this.checkAddress1();
                    this.checkTel();
                    this.checkEmail();
                    this.checkEmailConfirm();
                    this.checkAgree();

                    Object.keys(this.errors).forEach(k => {
                        if(this.errors[k] !== false)
                        {
                            throw 'フォームの内容を確認してください'
                        }
                    })

                    this.step = 3;

                } catch (error) {
                }

            }

            , completeCheckOrder: function()
            {
                this.step = 2;
            }
        }

        , watch: {
              'user.name': function(n, o){ this.checkName() }
            , 'user.zipcode': function(n, o){ this.checkZipcode() }
            , 'user.prefecture': function(n, o){ this.checkPrefecture() }
            , 'user.city': function(n, o){ this.checkCity() }
            , 'user.address1': function(n, o){ this.checkAddress1() }
            , 'user.tel': function(n, o){ this.checkTel() }
            , 'user.email': function(n, o){ this.checkEmail() }
            , 'user.emailConfirm': function(n, o){ this.checkEmailConfirm() }
            , 'user.agree': function(n, o){ this.checkAgree() }
        }
        , created: function()
        {
            $('.pafCartCount').text(strgPafCartCount);

        }

        , mounted: function()
        {
        }
    })
</script>



<? get_footer(); ?>