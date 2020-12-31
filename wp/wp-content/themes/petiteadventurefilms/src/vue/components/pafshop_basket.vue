<template>
    <div>
        <div class="order_details">
            <div
            v-for = "item in itemsInBasket"
            :key  = "'film_' + item.info.id"
                class="_item">
                <div class="_name subhead2">{{item.info.title}}</div>
                <div
                v-for = "(unit, key) in item.basket.unit"
                :key = "'film_' + item.info.id + 'price' + key">
                    <div
                    v-if="unit > 0"
                        class="_details">
                        <div class="cell __index">
                            {{item.info.price_indexs[key]}}
                            <span class="inline_block">
                                (<span v-if="item.basket.type[key] == 2">ブルーレイ</span>
                                <span v-else>DVD</span>)
                            </span>
                        </div>
                        <div class="__detail_unit_amount_sum">
                            <div class="cell __unit al_r">
                                {{convertYen(item.info.price_contents[key])}}
                            </div>
                            <div
                            v-if="inCashier"
                                class="cell __amount al_c">
                                {{item.basket.unit[key]}}
                            </div>
                            <div
                            v-else
                                class="cell __amount al_c">
                                <select
                                v-model="item.basket.unit[key]"
                                @change="updateBasket(item.basket)"
                                class="__unit">
                                    <option
                                    v-for="index in 10"
                                    :key="`productUnit${key}${index}`"
                                        :value="index">{{index}}</option>
                                </select>
                                <span
                                class="___btn_delete cursor_pointer"
                                @click="deleteItem(item, key)">削除</span>
                            </div>
                            <div class="cell __sum al_r">
                                {{convertYen(item.info.price_contents[key] * unit)}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="fee">
            <span class="_fee_index">商品小計</span>
            <span class="_fee_amount">{{convertYen(totalAmount)}}</span>
        </div>

        <div class="fee">
            <span class="_fee_index">配送料</span>
            <span class="_fee_amount">{{convertYen(deliveryFee)}}</span>
        </div>
        
        <div class="total subhead2">
            <span class="_fee_index">合計</span>
            <span class="_fee_amount">{{convertYen(totalAmount + deliveryFee)}}</span>
        </div>
               
        
    </div>
</template>

<script>

import { mapGetters } from 'vuex'


export default {
    
    props: ['inCashier']
    
    
    , data()
    {
        return{
            
        }
    }
    
    , computed:
    {
        ...mapGetters(['convertYen', 'itemsInBasket', 'totalAmount', 'deliveryFee'])
    }
    
    , methods:
    {
    
        updateBasket(data)
        {
            this.$store.commit('updateBasket', data);
            this.$store.commit('updateBasketCount')
        }
        
        , deleteItem(data, key){
            this.$emit('triggerModalDeleteItem', data, key)
        }
        
    }
    
}
</script>