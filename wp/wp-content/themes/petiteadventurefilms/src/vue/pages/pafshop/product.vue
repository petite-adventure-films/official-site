<template>
    <div class="single" v-if="product">
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>
            
        <div class="col col_4">
            <Carousel
                :items   = 1
                :navText = "['','']">
                <img :src="product.filmData[0]['custom_fields']['dvd_jacket_jp_front']">
                <img :src="product.filmData[0]['custom_fields']['dvd_jacket_jp_back']">
                <img v-if="product.filmData[0]['custom_fields']['dvd_jacket_en_front']" :src="product.filmData[0]['custom_fields']['dvd_jacket_en_front']">
                <img v-if="product.filmData[0]['custom_fields']['dvd_jacket_en_back']" :src="product.filmData[0]['custom_fields']['dvd_jacket_en_back']">
                <img v-if="product.filmData[0]['custom_fields']['dvd_specials']" :src="product.filmData[0]['custom_fields']['dvd_specials']">
            </Carousel>
        </div>
        <div class="col col_5 last">
            <p class="subhead2 pink m1_b" v-html="product.catch"></p>
            <dl class="_disc_details">
                <dt class="grid _1_1">構成</dt>
                <dd class="grid _1_2">
                    <span
                    v-for="(val, key) in product.disc_indexs"
                    :key="`disc_index_${key}`">
                        <span v-if="key > 0">、または</span>
                        {{val}}{{product.disc_numbers[key]}}枚組
                    </span>
                </dd>
                <dt class="grid _2_1">ディスク種類</dt>
                <dd class="grid _2_2">
                    <span
                    v-for="(val, key) in product.disc_indexs"
                    :key="`disc_type_${key}`"
                        class="block">
                        <span v-if="product.disc_indexs.length > 1">{{product.disc_indexs[key]}}</span>
                        {{product.disc_types[key]}}
                    </span>
                </dd>
                <dt class="grid _3_1">収録内容</dt>
                <dd class="grid _3_2" v-html="product.disc_contents"></dd>
            </dl>
        
            <div class="price_systems m1_t">    
                <div
                v-for = "(val, key) in product.price_indexs"
                :key="'price' + key"
                    class="m1_t _system">
                    
                    <span class="__index">
                        {{val}}
                        
                        <select
                        v-if="thisBasket.type[key] != 999"
                            v-model="thisBasket.type[key]"
                            @change="checkBasket">
                            <option
                            v-for="(val2, key2) in diskTypes"
                            :key="`productType${key}${key2}`"
                                :value="key2">{{val2}}</option>
                        </select>
                        
                        <span v-else>(DVD)</span>
                        
                    </span>
                    
                    <span class="__price al_r">{{convertYen(product.price_contents[key])}}</span>
                    
                    <select
                        v-model="thisBasket.unit[key]"
                        @change="checkBasket"
                        class="__unit">
                        <option value=0 selected>個数</option>
                        <option
                        v-for="index in 10"
                        :key="`productUnit${key}${index}`"
                            :value="index">{{index}}</option>
                    </select>

                </div>
            </div>
            
            <div :class="['btn m1_t cursor_pointer', (isBasketActive) ? 'shop' : 'disabled']">
                <span class="ele" @click="addBasket">買い物かごに追加</span>
            </div>
            
            <div v-if="errorMessages.length > 0">
                <p
                v-for="(val, key) in errorMessages"
                :key="`message_${key}`"
                class="red">{{val}}</p>
            </div>
            
            <p v-if="isAlreadyAdded" class="red">この商品は買い物かごに追加されています</p>
                
            <p class="m1_t footnotes caption1">
                <small>※こちらの価格には消費税が含まれています</small><br>
                <small>※1回のご注文ごとに送料300円が掛かります<br>
                <span class="pink">3,000円以上のお買い上げで送料無料！</span></small>
            </p>
            
        </div>
        <div class="clear"></div>
    
        <div class="col col_9 last">
            <div class="tabs m4_t al_c">
                <div @click="displayTab = 1" :class="['_tab cursor_pointer', (displayTab == 1) ? '_selected' : '']">概要</div>
                <div @click="displayTab = 2" :class="['_tab cursor_pointer', (displayTab == 2) ? '_selected' : '']">{{dvd_no_specials ? '本編' : '特典'}}</div>
                <div @click="displayTab = 3" :class="['_tab cursor_pointer', (displayTab == 3) ? '_selected' : '']">制作クレジット</div>
            </div>
        </div>
        <div class="clear"></div>
        
        <div
        v-if="displayTab == 1"
            class="m2_t col col_9 last">
        
            <div
            v-for="data in product.filmData"
            :key="`filmDataInfo${data.id}`">
                <div v-if="product.filmData.length > 1" class="subhead2">{{data.title.rendered}}</div>
                <dl class="list_definition">
                    <dt>監督</dt><dd>早川由美子</dd>
                </dl>
                <div class="clear"></div>
                <p v-if="data.custom_fields.basic_info">{{data.custom_fields.basic_info.join(' / ')}}</p>
            </div>
            
            <p v-if="product.intro" v-html="product.intro" class="_intro"></p>
            
        </div>
        <div class="clear"></div>
        
        <div
        v-if="displayTab == 2"
            class="m2_t col col_9 last _specials"
            v-html="product.contents">
        </div>
        <div class="clear"></div>
        
        <div
        v-if="displayTab == 3"
            class="m2_t">
            
            <div
            v-for="(data, key) in product.filmData"
            :key="`filmDataCredits${data.id}`">
                <div :class="['p1_l', key > 0 ? 'm2_t': '']">
                    {{data.title.rendered}}
                    <span class="caption2">(敬称略)</span>
                </div>
            
                <div v-masonry :item-selector="`._credit_${key}`">
                    <div
                    v-masonry-tile
                    v-for="(val2, key2) in data.custom_fields.credits_indexs"
                    :key="`filmDataCredit${key2}`"
                    :class="`col col_3 _credit _credit_${key}`">
                        <p class="bold">{{val2}}</p>
                        <div class="m1_t" v-html="data.custom_fields.credits_contents[key2]"></div>
                    </div>
                </div>            
            </div>
            
        </div>
        <div class="clear"></div>
        
        <div class="contents col col_9 last">
            <ContactUs></ContactUs>
        </div>
        <div class="clear"></div>
    
    </div>
</template>

<script>
import Vue from 'vue'

import { mapState, mapGetters } from 'vuex'

import Carousel from 'vue-owl-carousel'
import VueLazyload from 'vue-lazyload'
import {VueMasonryPlugin} from 'vue-masonry';
Vue.use(VueLazyload)
Vue.use(VueMasonryPlugin)

import ArticleHeader from 'VUE/components/article_header.vue'
import ContactUs from 'VUE/components/contact_us.vue'

export default {

    components: { ArticleHeader, ContactUs, Carousel }
    
    , data()
    {
        return{
              diskTypes : ['ディスク選択', 'DVD', 'ブルーレイ']          
            , isBasketActive: false
            , errorMessages: []
            , displayTab: 1
        }
    }
    
    , computed:
    {
          ...mapState(['products', 'baskets']) 
        , ...mapGetters(['convertYen'])
        
        , isAlreadyAdded()
        {
            return this.baskets.find(a => a.id == this.product.id) ? true : false;
        }
        
        , product()
        {
            return (this.$route.params.data)
                ? this.$route.params.data
                : this.products.find(a => a.title == this.$route.params.title) 
        }
        
        , breadCrumbs()
        {
            return [
                  { name: 'top', title: 'ショップ' }
                , { title: this.product.title }
            ]
        }
        
        , thisBasket()
        {
            let arr = {};
            
            arr.id = this.product.id;
            arr.unit = [];
            arr.type = [];
            
            let thisBasket = this.baskets.find(a => a.id == this.product.id);
            if(thisBasket)
            {
                thisBasket.unit.forEach((v) => arr.unit.push(v));
                thisBasket.type.forEach((v) => arr.type.push(v));
            }
            else
            {
                this.product.price_indexs.forEach((v) => arr.unit.push(0));
                this.product.price_indexs.forEach((v, k) => {
                
                    if(this.product.type_indexs)
                    {
                        var key = this.product.type_indexs.findIndex(v2 => v2 == v);
                        arr.type.push((key > -1 ) ? 0 : 999);
                    }
                    
                    else
                    {
                        arr.type.push(999);
                    }
                    
                })
                
            }
            return arr;
        }
        
    }
    
    , methods:
    {
    
        checkBasket()
        {
            
            this.errorMessages = [];
            this.isBasketActive = false;
            
            var errors = [];
            
            try
            {
            
                if(this.product.type_contents)
                {
                    this.checkItemHasType();
                    this.checkItemHasUnit();
                }
                
                this.checkItemsCount();  
                
                this.isBasketActive = true;
                
            }
            catch(error)
            {
                this.errorMessages.push(error.message);
            }
        }
        
        , checkItemsCount()
        {
            let count = 0;
            this.thisBasket.unit.forEach(v => count = count + parseInt(v));
            if(count < 1)
            {
                throw new Error('個数を入力してください')
            }
            else
            {
                this.isBasketActive = true;
            }
        }
            
        , checkItemHasType()
        {
            for(var k=0; k<this.thisBasket.unit.length; k++)
            {
                var v = this.thisBasket.unit[k];
                if(v > 0 && this.thisBasket.type[k] < 1)
                {
                    throw new Error('ディスク種類の入力がない箇所があります')
                }
            }
        }
            
        , checkItemHasUnit: function()
        {
            for(var k=0; k<this.thisBasket.type.length; k++)
            {
                var v = this.thisBasket.type[k];
                if((v > 0 && v < 999) && this.thisBasket.unit[k] < 1)
                {
                    throw new Error('個数の入力が箇所があります')
                }
            }
        }
            
        , addBasket()
        {
            this.errorMessage = '';
            if(this.isBasketActive)
            {
                if(this.isAlreadyAdded)
                {
                    this.$store.commit('updateBasket', this.thisBasket);
                }
                else
                {
                    this.$store.commit('setBasket', this.thisBasket);
                }
                
                this.$store.commit('updateBasketCount');
                
                this.$emit('display-modal-check-basket');
        
            }
            else
            {
                this.errorMessages.push('個数を入力してください');
            }
        }
        
    }
    
    , async created()
    {
        this.$store.dispatch('getPafshopData');
    }
    
}
</script>
