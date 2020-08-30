<?php
/*
Template Name: Cashier purchase
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


            <h2>購入内容</h2>
        
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
                        {{unit}}
                        {{convertYen(item.price_info[key].amount * unit)}}
                    </div>
                </div>
                小計 {{convertYen(getSubtotal(item.prod_key))}}

            </div>
            合計　{{convertYen(getTotal())}}


            <br>
            <h2>購入者情報</h2><div @click="step = 1">編集する</div>
            <div v-if="step == 1">
                <?php include (TEMPLATEPATH . "/_order_jp_form_2.php"); ?>
            </div>
            <div v-if="step > 1">
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
            <h2>決済</h2>
            <div v-if="step == 2">
                <input type="radio" v-model="paymentMethod" value="1" id="paymentMethod1"><label for="paymentMethod1">銀行振込</label>
                <div v-if="paymentMethod == 1">
                    銀行振込はこうです
                </div>
                <input type="radio" v-model="paymentMethod" value="2" id="paymentMethod2"><label for="paymentMethod2">クレジットカード</label><br>
                <div v-show="paymentMethod == 2">
                    <div ref="cardElement"></div>
                    <div @click="pay()">決済する</div>
                    {{paymenErrorMessage}}
                </div>
                    

                <div @click="completePayment()">決済終了</div>
            </div>

        </div>

    </div>

</div>


<script type="text/javascript">

    Vue.config.devtools = true;

    var strgPafCart = JSON.parse(localStorage.getItem('pafCart')) || localStorage.setItem('pafCart', JSON.stringify({}));
    var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

    var products = <? echo json_encode($products); ?>;


    var app = new Vue({
        el: '#app'
        , data: {
              products: products
            , pafCart : strgPafCart
            , step : 2
            , user:{
                //   name: ''
                // , zipcode: ''
                // , prefecture: ''
                // , city: ''
                // , address1: ''
                // , tel: ''
                // , email: ''
                // , emailConfirm: ''
                // , receipt: ''
                // , agree: false

                name: 'restard'
                , zipcode: '1500034'
                , prefecture: '東京都'
                , city: '渋谷区神山町'
                , address1: '41-7'
                , address2: 'エクティ神山町209'
                , tel: '08039118917'
                , email: 'drestard@gmail.com'
                , emailConfirm: 'drestard@gmail.com'
                , receipt: true
                , receiptName: 'お宛名'
                , receiptDescription: '但し書き'
                , agree: true
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
            , paymentMethod: 0
            , stripePK: 'pk_test_51H8OJOKluK1zP0j9cc4YOhcbQhCa8G31WAFcxruwZkvh9VIFNfFO11CFbY7tqQtTuqZqXvfOlEYtcKlQjzhFNbYi00EsaSxkXR'
            , paymenErrorMessage: ''
            , stripe: false
            , cardElement: false
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

            , async completePayment()
            {
                if(this.paymentMethod == 1)
                {

                    var params = this.user;
                    params.order = this.order;
                    params.total = this.convertYen(this.getTotal());

                    var url = '<? echo get_permalink(get_page_by_path('cashier/complete')); ?>'
                    var res = await axios.post(url, params)
                    if(res){
                        if(res.status === 200)
                        {
                            // window.location.href = '<? echo get_permalink(get_page_by_path('cashier/thanks')); ?>'
                        }
                    }
                }
            }

            , async pay()
            {
                try {
                    // 決済用トークン発行
                    var tokenResult = await this.stripe.createToken(this.card)
                    if (
                        !tokenResult ||
                        !tokenResult.token ||
                        !tokenResult.token.id ||
                        tokenResult.token.id === ''
                    ) {
                        throw new Error('トークン発行エラー')
                    }
                    console.log('ne', tokenResult)

                    var charge = await this.stripe.charges.create({
                        amount: 2000,
                        currency: 'jpy',
                        source: tokenResult.token.id
                    });
                    if (charge) {
                        console.log('charge', charge)
                    }
                }
                catch(error)
                {
                    this.paymenErrorMessage = error.message
                }

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

                    this.step = 2;

                } catch (error) {
                }

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

            this.stripe = Stripe('pk_test_51H8OJOKluK1zP0j9cc4YOhcbQhCa8G31WAFcxruwZkvh9VIFNfFO11CFbY7tqQtTuqZqXvfOlEYtcKlQjzhFNbYi00EsaSxkXR');
            this.card = this.stripe.elements().create('card', { hidePostalCode: true })
            this.card.mount(this.$refs.cardElement);
        }
    })
</script>



<? get_footer(); ?>