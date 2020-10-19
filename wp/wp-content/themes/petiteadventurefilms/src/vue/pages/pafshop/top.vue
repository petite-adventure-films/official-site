<template>
    <ul
    v-if="products"
        class="single list_films">
        <li
        v-for="(arr, key) in products"
        :key="`product${arr.id}`"
            :class="['col col_3', ((key + 1) % 3) ? '' : 'last']">
            <router-link :to="{ name: 'product', params: genRouterParams(arr) }">
                <div class="film_poster">
                    <img v-lazy="arr.filmData[0]['custom_fields']['dvd_jacket_jp_front']">
                </div>
                <p class="film_title">{{arr.title}}</p>
            </router-link>
        </li>
    </ul>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload)

export default {

    data()
    {
        return{
        }
        
    }

    , computed:
    {
        ...mapState(['products'])
    }
    
    , methods:
    {
        genRouterParams(arr)
        {   
            return {
                  data: arr
                , title: arr.title
            }
        }
        
    }
    
}
</script>