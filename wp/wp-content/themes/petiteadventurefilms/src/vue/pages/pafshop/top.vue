<template>
    <div class="">
        <ul
        v-if="isLoaded()"
            class="single list_films">
            <li
            v-for="arr in products"
            :key="`product${arr.id}`"
                class="col col_3">
                <router-link :to="{ name: 'product', params: genRouterParams(arr) }">
                    <div class="film_poster">
                        <img :src="arr.filmData[0]['custom_fields']['dvd_jacket_jp_front']" clas>
                    </div>
                    <p class="film_title">{{arr.title}}</p>
                </router-link>
            </li>
        </ul>
        <div
        v-else
            class="single"><p class="col col_9">読み込み中</p></div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'

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
        
        , isLoaded()
        {
            return (this.products.length > 0) ? true : false;
        }
        
    }

    , async created()
    {
        this.$store.dispatch('getPafshopData');
    }
}
</script>