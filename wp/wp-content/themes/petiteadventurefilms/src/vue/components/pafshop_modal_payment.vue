<template>
    <div class="modal-mask">
        <div class="modal-container">
            <div class="icon icon-close" @click="close"></div>
            <div class="confirm_btns">
            
                <div v-if="completed == false">
                    <div class="order_details _in_modal">
                        <div class="fee">
                            <span class="_fee_index">商品小計</span>
                            <span class="_fee_amount">{{convertYen(totalAmount)}}</span>
                        </div>
    
                        <div class="fee">
                            <span class="_fee_index">配送料</span>
                            <span class="_fee_amount">{{deliveryFee}}</span>
                        </div>
    
                        <div class="total subhead2">
                            <span class="_fee_index">合計</span>
                            <span class="_fee_amount">{{convertYen(totalAmount + deliveryFee)}}</span>
                        </div>
                    </div>          
                    <div
                        :class="[
                              'card_element m2_t'
                            , (isExecuting == true) ? 'disabled' : '']"
                        ref="cardElement"></div>
                </div>
                    
                <div
                v-if="completed == false && isExecuting == false"
                    @click="pay()"
                    :class="[
                          'btn priority1 al_c m1_t cursor_pointer'
                        , (isEntered == true) ? 'pay' : 'disabled'
                    ]"><span class="ele">お支払いする</span></div>
                
                <div
                v-if="completed == true && isExecuting == false"
                    @click="complete()"
                    class="btn shop m1_t al_c cursor_pointer"
                        ><span class="ele">注文を完了する</span></div>
                
                
                <p
                    :class="['al_c', (completed == true && isExecuting == false) ? '' : 'red' ]"
                    v-html="message"></p>
                    
                <div
                v-if="completed == false && isExecuting == false"
                    @click="close()"
                    class="m1_t al_c cursor_pointer">お支払い方法選択に戻る</div>
                </div>
                               
            </div>
        </div>
    </div>
</template>

<script>
import {loadStripe} from '@stripe/stripe-js';
import { mapState, mapGetters } from 'vuex'

export default{

    data()
    {
        return{
            stripe: null
            , cardElement: null
            , message: ''
            , completed: false
            , isEntered: false
            , isExecuting: false
            , timer: 0
        }
    }
    
    , computed:
    {
        ...mapState(['orderID'])
        , ...mapGetters(['convertYen', 'totalAmount', 'deliveryFee'])
    }
    
    , methods:
    {
        async pay()
        {
        
            this.isExecuting = true;
            this.message = 'お支払い中です'

            try
            {
                let tokenResult = await this.stripe.createToken(this.cardElement)
                if (
                    !tokenResult ||
                    !tokenResult.token ||
                    !tokenResult.token.id ||
                    tokenResult.token.id == ''
                ) {
                    this.isExecuting = false;
                    throw new Error('トークン発行エラー');
                }
                

                let url = `${process.env.SITE_URL}charge.php`
                let params = {
                      token: tokenResult.token.id
                    , amount: (this.totalAmount + this.deliveryFee)
                    , orderID: this.orderID
                }

                let chargeResult = await this.$http.post(url, params);

                if (!chargeResult || chargeResult.data !== 'success') {
                    this.isExecuting = false;
                    throw new Error('お支払いエラー')
                }
                
                this.$store.commit('setPaymentCompleted', true);
                this.message = 'お支払いに成功しました。<br>注文を完了してください。<br>5秒後には自動的に移動します。'
                this.completed = true;
                this.isExecuting = false;
                
                
                this.timer = setTimeout(() => {
                    this.complete();
                }, 5000);

            }
            catch(error)
            {
                this.message = error.message
            }
            
        }
        
        ,complete()
        {
            clearTimeout(this.timer);
            this.$store.dispatch('complete', { paymentMethod: 2 });
        }
        
        , close()
        {
            this.$emit('close')
        }
        
        , input(e)
        {
            this.isEntered = false;
        }
        , change(e)
        {
            if(e.complete){
                this.isEntered = true;
                this.message = ''
            }
            else{
                this.isEntered = false;
                if(e.error)
                {
                    this.message = e.error.message
                }
            }
        }
    }

    , async created()
    {
        this.stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY);
        this.cardElement = this.stripe.elements().create('card', {
            hidePostalCode: true
            , style: {
                base: {
                    lineHeight: '44px'
                }
            }
        });
        this.cardElement.mount(this.$refs.cardElement);
        this.cardElement.addEventListener('input', this.input);
        this.cardElement.addEventListener('change', this.change);
    }
    
}
</script>