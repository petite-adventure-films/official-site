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

get_header('pafshop'); ?>

<div class="single_pafshop">

    <div class="col col_6 last">

        <div class="purchase_details">

            <div class="grid _1_1 subhead1 al_c">
                <span :class="[
                      'step_icon icon-check'
                    , (step == 1) ? '_processing' : ''
                    , (step > 1) ? '_completed' : ''
                ]"></span>
            </div>
            <div class="grid _1_2 subhead1">
                {{(step == 1) ? '注文内容を確認してください' : '注文内容'}}
            </div>

            <div class="order_details grid _2_2 m1_t">

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
                                <span v-if="pafCartTypes[`film_${item.prod_key}`][key] == 2">
                                    (ブルーレイ)
                                </span>
                            </div>
                            <div class="__detail_unit_amount_sum">
                                <div class="cell __amount al_r">{{convertYen(item.price_info[key].amount)}}</div>
                                <div class="cell __unit al_c">{{unit}}</div>
                                <div class="cell __sum al_r">{{convertYen(item.price_info[key].amount * unit)}}</div>
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

                <div v-if="step == 1">
                    <div class="m2_t">注文内容に問題なければ、次へお進みください。</div>
                    <div class="btn shop cursor_pointer" @click="completeCheckOrder">
                        <span class="ele">次へすすむ</span>
                    </div>
                </div>

            </div>

            <div class="grid _3_1 subhead1 al_c m4_t">
                <span :class="[
                      'step_icon'
                    , (step == 2) ? '_processing icon-edit' : 'icon-edit'
                    , (step > 2) ? '_completed icon-check' : ''
                ]"></span>
            </div>
            <div class="grid _3_2 subhead1 m4_t">
                <span class="inline_block">{{(step == 2) ? '注文者情報を入力してください' : '注文者情報'}}</span>
                <div
                v-if="step > 2"
                    @click="step = 2"
                    class="btn_edit_user_info cursor_pointer"><span class="ele">編集する</span></div>
            </div>

            <div class="grid _4_2 m1_t">
                <div v-if="step == 2">
                    <?php include (TEMPLATEPATH . "/_order_jp_form_2.php"); ?>
                </div>
                <div v-if="step > 2">
                    <dl class="list_definition">
                        <dt>名前</dt><dd>{{user.name}}</dd>
                        <dt>住所</dt><dd>{{user.zipcode}} {{user.prefecture}}{{user.city}}{{user.address1}}{{user.address2}}</dd>
                        <dt>電話番号</dt><dd>{{user.tel}}</dd>
                        <dt>メールアドレス</dt><dd>{{user.email}}</dd>
                        <dt>領収書</dt><dd>{{(user.receipt == true) ? '必要' : '不要'}}</dd>
                        <div v-if="user.receipt == true">
                        <dt>領収書宛名</dt><dd>{{(user.receiptName) ? user.receiptName : '-'}}</dd>
                        <dt>領収書但し書き</dt><dd>{{user.receiptDescription ? user.receiptDescription : '-'}}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div class="grid _5_1 subhead1 al_c m4_t">
                <span :class="[
                      'step_icon'
                    , (step == 3) ? '_processing icon-edit' : 'icon-edit'
                ]"></span>
            </div>
            <div class="grid _5_2 subhead1 m4_t">
                {{(step == 3) ? 'お支払い方法を選択してください' : 'お支払い方法の選択'}}
            </div>

            <div class="grid _6_2 m1_t">
                <div v-if="step == 3">

                        <div class="_method" v-if="paymentMethod != 2">
                            <div class="">
                                <input type="radio" v-model="paymentMethod" value="1" id="paymentMethod1">
                            </div>
                            <div class="">
                                <label for="paymentMethod1">銀行振込</label>
                                <div class="__logo"><img src="<?php echo bloginfo("template_url"); ?>/assets/img/pafshop/bank_logo_yucho.png"></div>
                                <div class="__logo"><img src="<?php echo bloginfo("template_url"); ?>/assets/img/pafshop/bank_logo_mufg.png"> <span class="">三菱UFJ銀行</span></div>
                                <div class="__logo _japannet"><img src="<?php echo bloginfo("template_url"); ?>/assets/img/pafshop/bank_logo_japannet.png"></div>
                                <p class="m1_t">振込先情報は注文完了後の確認メールに記載されております。振込手数料はご負担下さい。</p>
                            </div>
                        </div>

                        <div class="_method m2_t" v-if="paymentMethod != 1">
                            <div class="">
                                <input type="radio" v-model="paymentMethod" value="2" id="paymentMethod2">
                            </div>
                            <div class="">
                                <label for="paymentMethod2">クレジットカード</label>
                                <div>
                                    <div class="__logo _credit_card inline_block"><img src="<?php echo bloginfo("template_url"); ?>/assets/img/pafshop/card_logo_visa.gif"></div>
                                    <div class="__logo _credit_card inline_block"> <img src="<?php echo bloginfo("template_url"); ?>/assets/img/pafshop/card_logo_mastercard.gif"></div>
                                </div>
                                <p class="m1_t">注文完了後、お支払い画面へ移動します。</p>
                            </div>
                        </div>

                    <div
                    v-if="paymentMethod != 0"
                        :class="['m2_t cursor_pointer', (paymentMethod > 0) ? 'shop' : 'disabled']"
                        @click="execPayment()" class="btn">
                        <span class="ele">{{(paymentMethod == 1) ? '注文を完了する' : 'お支払いへ進む'}}</span>
                    </div>

                    <div v-if="paymentMethod != 0" @click="paymentMethod = 0" class="m1_t btn cursor_pointer">
                        <span class="ele">選びなおす</span>
                    </div>

                </div>
            </div>

    </div>

</div><!--.single-->

<?php get_footer('scripts'); ?>

<modal-payment
v-if="modalPayment === true"
    :subtotal="convertYen(getTotal())"
    :total="convertYen(getTotal(true))"
    :fee="convertYen(deliveryFee)"
    :orderid="orderID"
    :amount="getTotal(true)"
    @complete="completePayment()"
    @close="closeModalPayment()"></modal-payment>

<modal-execution
v-if="modalExecution === true"></modal-execution>

<script type="text/x-template" id="template-modal-payment">
    <div class="modal-mask">
        <div class="modal-container">

            <div
            v-if="paymentCompleted === false && isExecuting == false"
                class="icon icon-close" @click="close()"></div>
            <div class="confirm_btns">

                <div v-if="paymentCompleted == false">
                    <div class="order_details _in_modal">
                        <div class="fee">
                            <span class="_fee_index">商品小計</span>
                            <span class="_fee_amount" v-html="subtotal"></span>
                        </div>

                        <div class="fee">
                            <span class="_fee_index">配送料</span>
                            <span class="_fee_amount" v-html="fee"></span>
                        </div>

                        <div class="total subhead2">
                            <span class="_fee_index">合計</span>
                            <span class="_fee_amount" v-html="total"></span>
                        </div>
                    </div>
                    <div
                    :class="[
                          'card_element m2_t'
                        , (isExecuting == true) ? 'disabled' : '']"
                    ref="cardElement"></div>
                </div>

                <div
                v-if="paymentCompleted === false && isExecuting == false"
                    @click="pay()"
                    :class="[
                          'btn priority1 al_c m1_t cursor_pointer'
                        , (isEntered == true) ? 'pay' : 'disabled'
                    ]"><span class="ele">お支払いする</span></div>
                <div
                v-if="paymentCompleted === true && isExecuting == false"
                    @click="complete()"
                    class="btn shop m1_t al_c cursor_pointer"
                        ><span class="ele">注文を完了する</span></div>
                <p
                :class="['al_c', (paymentCompleted === true && isExecuting == false) ? '' : 'red' ]"
                v-html="paymentMessage"></p>
                <div
                v-if="paymentCompleted === false && isExecuting == false"
                    @click="close()"
                    class="m1_t al_c cursor_pointer">お支払い方法選択に戻る</div>
                </div>
            </div>
        </div>
    </div>
</script>

<script type="text/x-template" id="template-modal-execution">
    <div class="modal-mask">
        <div class="modal-container">
            <p>処理中です...</p>
            <div class="loading_ring"></div>
        </div>
    </div>
</script>

<script type="text/javascript">

    Vue.config.devtools = true;

    // var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
    // var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);


    var strgPafOrderID = localStorage.getItem('pafOrderID') || localStorage.setItem('pafOrderID', '<? echo $orderID; ?>');
    var strgPafCart = JSON.parse(localStorage.getItem('pafCart'));
    var strgPafCartTypes = JSON.parse(localStorage.getItem('pafCartTypes')) || localStorage.setItem('pafCartTypes', JSON.stringify({}));
    var strgPafCartCount = localStorage.getItem('pafCartCount');

    if(!strgPafOrderID && strgPafCartCount < 1)
    {
        window.location.href = `<? echo get_permalink(get_page_by_path('cashier/error')); ?>?_error=001`;
    }
    
    if(strgPafOrderID && strgPafCartCount < 1)
    {
        window.location.href = `<? echo get_permalink(get_page_by_path('cashier/error')); ?>?_error=002&_order=${strgPafOrderID}`;
    }
    

    var products = <? echo json_encode($products); ?>;
    var orderID = localStorage.getItem('pafOrderID');

    Vue.component('modal-payment', {
        template: '#template-modal-payment'
        , props: ['orderid', 'total', 'subtotal', 'fee', 'amount']
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

                this.isExecuting = true;
                this.paymentMessage = 'お支払い中です'

                try {
                    var tokenResult = await this.stripe.createToken(this.card)
                    if (
                        !tokenResult ||
                        !tokenResult.token ||
                        !tokenResult.token.id ||
                        tokenResult.token.id === ''
                    ) {
                        this.isExecuting = false;
                        throw new Error('トークン発行エラー');
                    }

                    var url = '/charge.php'
                    var params = {
                          token: tokenResult.token.id
                        , amount: this.amount
                        , orderID: this.orderid
                    }

                    var chargeResult = await axios.post(url, params);

                    if (!chargeResult || chargeResult.data !== 'success') {
                        this.isExecuting = false;
                        throw new Error('お支払いエラー')
                    }


                    localStorage.removeItem('pafCart');
                    localStorage.removeItem('pafCartTypes')
                    localStorage.removeItem('pafCartCount');

                    this.paymentMessage = 'お支払いに成功しました。<br>注文を完了してください。<br>5秒後には自動的に移動します。'
                    this.paymentCompleted = true;
                    this.isExecuting = false;
                    
                    setTimeout(() => {
                        this.$emit('complete');
                    }, 5000);

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
            , pafCartTypes : strgPafCartTypes || {}
            , pafCartCount : strgPafCartCount || 0
            , deliveryFee: 0
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

            , helpers:{
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
                if(this.pafCartCount > 0){
                    Object.keys(this.pafCart).forEach(k => {
                        var filmID = k.replace('film_', '')
                        var film = this.products.find(a => a.prod_key == filmID);
                        if(film)
                        {
                            film.cart = this.pafCart[k];
                            film.types = this.pafCartTypes[k];
                            arg.push(film)
                        }
                    })
                }
                return arg;
            }

            , order: function()
            {
                var self = this;
                var arg = []
                this.addedItems.forEach(a => {
                    a.cart.forEach((v, k) => {
                        if(v > 0){
                            var type = '';
                            if(a.types)
                            {
                                type = (a.types[k] > 0) ? `【${self.discTypes[v]}】` : type;
                            }
                            arg.push(`${a.basic_info.post_title}${type}【${a.price_info[k].index}】 : ${v}`)
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
            , getTotal: function(includeDeliveryFee)
            {

                var sum1 = 0;
                if(this.pafCartCount > 0)
                {
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
                }

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
                params.deliveryFee = this.deliveryFee;
                params.total = this.convertYen(this.getTotal(true));
                params.paymentMethod = (this.paymentMethod == 1) ? '銀行振込' : 'クレジットカード';

                if(this.user.receipt == true)
                {
                    params.receiptName = this.user.receiptName ? this.user.receiptName : '(記載なし)'
                    params.receiptDescription = this.user.receiptDescription ? this.user.receiptDescription : '(記載なし)'
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
                        localStorage.removeItem('pafCartTypes')
                        localStorage.removeItem('pafCartCount');
                        window.location.href = `<? echo get_permalink(get_page_by_path('cashier/thanks')); ?>?method=${this.paymentMethod}&orderID=${this.orderID}`;
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
                    this.errors['zipcode'] = '正しい郵便番号を入力ください 半角数字のみ 例)1000005'
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
                    this.errors['tel'] = '正しい電話番号を入力ください 半角数字のみ 例)0123456791'
                }

            }
            , checkEmail: function()
            {
                this.errors['email'] = false;
                // this.helpers['email'] = 'ex'
                if(this.user.email === '')
                {
                    this.errors['email'] = 'メールアドレスを入力してください'
                }
                else if(!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.user.email))
                {
                    this.errors['email'] = '正しいメールアドレスを入力ください 例)test@mail.com'
                }
            }
            , checkEmailConfirm: function()
            {
                this.errors['emailConfirm'] = false
                if(this.user.emailConfirm === '')
                {
                    this.errors['emailConfirm'] = 'メールアドレスを入力してください'
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

</body>
</html>