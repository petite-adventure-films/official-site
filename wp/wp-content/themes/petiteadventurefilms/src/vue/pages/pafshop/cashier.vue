<template>
    <div class="single_pafshop">
    
        <div
        v-if="basketsCount > 0"
            class="col col_6">
        
            <div class="purchase_details">
            
                <!-- //////////////////////////////////////
                // STEP 1
                ////////////////////////////////////// -->
            
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
                    
                    <PafshopBasket
                        :inCashier="inCashier"></PafshopBasket>
                    
                    <div v-if="step == 1">
                        <div class="m2_t">注文内容に問題なければ、次へお進みください。</div>
                        <div class="btn shop cursor_pointer" @click="step = 2">
                            <span class="ele">次へすすむ</span>
                        </div>
                    </div>
                    
                </div>
                
                <!-- //////////////////////////////////////
                // STEP 2
                ////////////////////////////////////// -->
                
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
                
                    <PafshopUserform
                    v-if="step == 2"
                        :step     = step
                        :user     = user
                        @complete = "step = 3"></PafshopUserform>
                        
                    <div v-if="step > 2">
                        <dl class="list_definition">
                            <dt>名前</dt><dd>{{user.name}}</dd>
                            <dt>住所</dt><dd>{{user.zipcode}} {{user.prefecture}}{{user.city}}{{user.address1}}{{user.address2}}</dd>
                            <dt>電話番号</dt><dd>{{user.tel}}</dd>
                            <dt>メールアドレス</dt><dd>{{user.email}}</dd>
                            <dt>領収書</dt><dd>{{(user.receipt == true) ? '必要' : '不要'}}</dd>
                            <div v-if="user.receipt == true">
                            <dt>領収書宛名</dt><dd>{{(user.receiptName) ? user.receiptName : '(記載なし)'}}</dd>
                            <dt>領収書但し書き</dt><dd>{{user.receiptDescription ? user.receiptDescription : '(記載なし)'}}</dd>
                            </div>
                        </dl>
                    </div>
                    
                </div>
                
                <!-- //////////////////////////////////////
                // STEP 3
                ////////////////////////////////////// -->
                
                <div class="grid _5_1 subhead1 al_c m4_t">
                    <span :class="[
                          'step_icon'
                        , (step == 3) ? '_processing icon-edit' : 'icon-edit'
                    ]"></span>
                </div>
                <div class="grid _5_2 subhead1 m4_t">
                    {{(step == 3) ? 'お支払い方法を選択してください' : 'お支払い方法の選択'}}
                </div>
                
                <div
                v-if="step == 3"
                class="grid _6_2 m1_t">
                
                    <div class="_method" v-if="paymentMethod != 2">
                        <div class="">
                            <input type="radio" v-model="paymentMethod" value="1" id="paymentMethod1">
                        </div>
                        <div class="">
                            <label for="paymentMethod1">銀行振込</label>
                            <div class="">
                                <div class="__logo"><img :src="`${templateUrl}assets/img/pafshop/bank_logo_yucho.png`" title="ゆうちょう銀行"></div>
                                <div class="__logo"><img :src="`${templateUrl}assets/img/pafshop/bank_logo_mufg.png`"> <span class="">三菱UFJ銀行</span></div>
                                <div class="__logo _paypay"><img :src="`${templateUrl}assets/img/pafshop/bank_logo_paypay.png`" title="PayPay銀行"></div>
                                <p class="m1_t">振込先情報は注文完了後の確認メールに記載されております。振込手数料はご負担下さい。</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="_method m2_t" v-if="paymentMethod != 1">
                        <div class="">
                            <input type="radio" v-model="paymentMethod" value="2" id="paymentMethod2">
                        </div>
                        <div class="">
                            <label for="paymentMethod2">クレジットカード</label>
                            <div>
                                <div class="__logo _credit_card inline_block"><img :src="`${templateUrl}/assets/img/pafshop/card_logo_visa.gif`"></div>
                                <div class="__logo _credit_card inline_block"> <img :src="`${templateUrl}/assets/img/pafshop/card_logo_mastercard.gif`"></div>
                            </div>
                            <p class="m1_t">注文完了後、お支払い画面へ移動します。</p>
                        </div>
                    </div>

                    <div v-if="paymentMethod !== 0" class="m2_t">
                        <vue-recaptcha
                            @verify="onVerify"
                            @expired="onExpired"
                            :sitekey="reCaptchaSiteKey">
                        </vue-recaptcha>
                        
                        <div
                        v-if="isVerified === true"
                            @click="exec()" class="btn shop m2_t cursor_pointer">
                            <span class="ele">{{(paymentMethod == 1) ? '注文を完了する' : 'お支払いへ進む'}}</span>
                        </div>

                        <!-- <div
                        v-if="isVerified === true"
                            @click="paymentMethod = 0"
                            class="m1_t btn cursor_pointer">
                            <span class="ele">選びなおす</span>
                        </div> -->
                    </div>
                        
                </div>
                
                
            </div>
            
        </div>
        
        <div class="clear"></div>
    
    </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

import PafshopBasket from 'VUE/components/pafshop_basket.vue'
import PafshopUserform from 'VUE/components/pafshop_userform.vue'
import { VueRecaptcha } from 'vue-recaptcha'

export default{

    components: { PafshopBasket, PafshopUserform, VueRecaptcha }

    , data()
    {
        return{
              step: 1
            , inCashier: true
            , paymentMethod: 1
            , templateUrl: process.env.TEMPLATE_URL
            , isVerified: false
            , reCaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
        }
    }
    
    , computed:
    {
    
        ...mapState(['basketsCount', 'user'])
        , ...mapGetters([
              'convertYen'
            , 'itemsInBasket'
            , 'deliveryFee'
            , 'totalAmount'])
        
    }
    
    , methods:
    {
        exec()
        {
            if(this.paymentMethod == 1)
            {
                this.$emit('display-modal-executing', true);
                this.$store.commit('setPaymentCompleted', true);
                this.$store.dispatch('complete', {paymentMethod: 1});
            }

            else if(this.paymentMethod == 2)
            {
                this.$emit('display-modal-payment', true);
            }
        }

        , onVerify(response)
        {
            if(response !== '') {
                this.isVerified = true
            } else {
                return false
            }
        }
        
        , onExpired() {
            this.resetRecaptcha()
        }

        , resetRecaptcha() {
            this.isVerified = false
        }
        
    }
    
    , created()
    {
        
        if(this.$store.state.basketsCount < 1)
        {
            this.$router.push({ name: 'error', params: { errorID: '001' }})
                return false;
        }
    
        if(this.$store.state.paymentCompleted == true)
        {
            this.$router.push({ name: 'error', params: {
                  errorID: '002'
                , orderID: this.$store.state.orderID
            }})
            return false;
        }


        if(!this.$store.state.orderID)
        {
            this.$store.dispatch('setOrderID');
        }
    }
    
}
</script>
