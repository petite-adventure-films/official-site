<template>
    <div class="single_pafshop col col_9">
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>
    
         <div class="m7_t col col_9">
            <p v-html="message"></p>
            <p class="m2_t">エラー番号 : {{errorID}}</p>
            <p v-if="errorID == '002'">注文番号 : {{orderID}}</p>
        </div>
        <div class="clear"></div>
        
        <div class="contents">
            <ContactUs></ContactUs>
        </div>
        
    </div>
    
</template>

<script>
import ArticleHeader from 'VUE/components/article_header.vue'
import ContactUs from 'VUE/components/contact_us.vue'

export default {

    components: { ArticleHeader, ContactUs }
    
    , data()
    {
        return{
        }
    }
    
    , computed:
    {
        
        breadCrumbs()
        {
            return [
                  { name: 'top', title: 'ショップ' }
                , { title: 'エラーが発生しました' }
            ]
        }
        
        , errorID()
        {
            return this.$route.params.errorID
        }
        
        , orderID()
        {
            return this.$route.params.orderID
        }
        
        , message()
        {
            if(this.errorID == '002')
            {
                return '注文手続中にエラーが発生しています。<br>お手数ですが、下記のエラー番号と注文番号でお問い合わせください。'
            }
            return '不正なアクセスです。<br>お手数ですが、最初からご注文を行ってください。'
        }
        
        
    }
    
    , created()
    {
        this.$emit('display-modal-payment', false);
        this.$emit('display-modal-executing', false);
        this.$store.commit('init');
    }
    
}
</script>