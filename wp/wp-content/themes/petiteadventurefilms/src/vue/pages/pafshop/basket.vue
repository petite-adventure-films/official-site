<template>
    <div class="single_pafshop">
        <ArticleHeader
            :breadCrumbs="breadCrumbs"
            :article="{title: pageTitle}"></ArticleHeader>
            
        <div v-if="basketsCount > 0">
        
            <PafshopBasket
            @triggerModalDeleteItem="triggerModalDeleteItem"></PafshopBasket>
            
            <p class="m1_t footnotes caption1">
                <small>※価格には消費税が含まれています</small><br>
                <small>※1回のご注文ごとに送料300円が掛かります</small><br>
                <span class="pink">3,000円以上のお買い上げで送料無料！</span>
            </p>
            
            <router-link
                :to="{ name: 'cashier' }"
                class="block btn shop m2_t">
                <span class="ele">注文する</span>
            </router-link>
            
        </div>
        
        <div v-else>
            <p>お客様の買い物かごに商品はありません。</p>
        </div>
        
    </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

import ArticleHeader from 'VUE/components/article_header.vue'
import PafshopBasket from 'VUE/components/pafshop_basket.vue'

export default {

    components: { ArticleHeader, PafshopBasket }
    
    , data()
    {
        return{
              diskTypes : ['ディスク選択', 'DVD', 'ブルーレイ']
            , pageTitle: '注文内容'
        }
    }
    
    , computed:
    {
          ...mapState(['basketsCount']) 
        
        , breadCrumbs()
        {
            return [
                  { name: 'top', title: 'ショップ' }
                , { title: this.pageTitle }
            ]
        }
        
    }
    
    , methods:
    {
        
        triggerModalDeleteItem(data, key)
        {
            this.$emit('display-modal-delete-item', data, key);
        }

    }
    
    
    , async created()
    {
        
    }
    
}
</script>
