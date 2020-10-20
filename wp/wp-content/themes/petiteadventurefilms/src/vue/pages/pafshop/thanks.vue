<template>
    <div class="single_pafshop">
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>
    
         <div class="col col_9 m7_t">
            <p>ご注文、誠にありがとうございます。</p>
            <p>
                <span v-if="paymentMethod == 1">ご注文内容の確認と、代金のお支払いについてご連絡を差し上げます。</span>
                <span v-else>ご注文内容の確認についてご連絡を差し上げます。</span>
                <br />しばらくお待ちください。
            </p>
                
            <p class="m1_t">
                注文番号: {{orderID}}
            </p>
                
            <p class="m2_t">
                <router-link :to="{ name: 'top' }">ショップ TOP</router-link><br>
                <a :href="siteUrl">サイトHOME</a>
            </p>
        </div>
        <div class="clear"></div>
        
    </div>
    
</template>

<script>
import ArticleHeader from 'VUE/components/article_header.vue'

export default {

    components: { ArticleHeader }
    
    , data()
    {
        return {
            siteUrl: process.env.SITE_URL
        }
    }
    
    , computed:
    {
        orderID()
        {
            return this.$route.params.orderID
        }
        
        , paymentMethod()
        {
            return this.$route.params.paymentMethod
        }
        
        , breadCrumbs()
        {
            return [
                  { name: 'top', title: 'ショップ' }
                , { title: '注文完了' }
            ]
        }
    }
    
    , created()
    {
    
        if(this.$store.state.basketsCount < 1)
        {
            this.$router.push({ name: 'error', params: { errorID: '001' }})
                return false;
        }
    
        
        this.$emit('display-modal-payment', false);
        this.$emit('display-modal-executing', false);
        this.$store.commit('init');
    
        
    }
    
}
</script>