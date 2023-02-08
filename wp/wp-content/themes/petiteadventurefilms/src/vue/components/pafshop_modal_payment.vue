<template>
    <div class="modal-mask">
        <div class="modal-container">
            
            <div class="icon icon-close"
                v-if="completed == false && isExecuting == false"
                @click="close"></div>
                
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
                        ref="paymentElement"></div>
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
                    class="m1_t al_c cursor_pointer">お支払い方法選択に戻る
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
            , paymentElement: null
            , elements: null
            , message: ''
            , completed: false
            , isEntered: false
            , isExecuting: false
            , timer: 0
        }
    }
    
    , computed:
    {
        ...mapState(['orderID', 'user'])
        , ...mapGetters(['convertYen', 'totalAmount', 'deliveryFee'])
    }
    
    , methods:
    {
        async pay()
        {
        
            this.isExecuting = true;
            this.message = 'お支払い中です'

            const { paymentIntent, error } = await this.stripe.confirmPayment({
                elements: this.elements,
                redirect: 'if_required',
                confirmParams: {
                    shipping: {
                        address: {
                            city: this.user.city,
                            line1: this.user.address1,
                            line2: this.user.address2,
                            postal_code: this.user.zipcode,
                            state: this.user.prefecture,
                            country: 'JP'
                        },
                        name: this.user.name,
                        phone: this.user.tel
                    }
                    , receipt_email: this.user.email
                    , payment_method_data: {
                        billing_details: {
                            email: this.user.email
                        }
                    }
                },
            });

            if (error && (error.type === 'card_error' || error.type === 'validation_error')) {
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
        
        ,complete()
        {
            clearTimeout(this.timer);
            this.$emit('display-modal-payment', false);
            this.$emit('display-modal-executing', true);
            this.$store.dispatch('complete', { paymentMethod: 2 });
        }
        
        , close()
        {
            this.$emit('display-modal-payment', false);
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

        const { clientSecret } = await fetch('/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: this.totalAmount + this.deliveryFee,
                receipt_email: this.user.email,
                order_id: this.orderID
            }),
        }).then((r) => r.json());

        this.elements = this.stripe.elements({ clientSecret });

        this.paymentElement = this.elements.create('payment', {
            hidePostalCode: true
            , style: {
                base: {
                    lineHeight: '44px'
                }
            }
        });
        this.paymentElement.mount(this.$refs.paymentElement);
        this.paymentElement.addEventListener('input', this.input);
        this.paymentElement.addEventListener('change', this.change);
    }
    
}
</script>