<template>
    <nav>
        <v-btn text :to = "{name:'news'}">新着情報</v-btn>
        <v-btn text :to = "{name:'events'}">上映会・イベント</v-btn>
        <v-btn text :to = "{name:'films'}">映画</v-btn>
        <!-- <v-btn text :to = "{name:'channel'}">チャンネル</v-btn>
        <v-btn text :to = "{name:'media'}">メディア紹介</v-btn> -->
        <v-btn text :to = "{name:'director'}">監督</v-btn>
        <v-btn text :to = "{name:'four_walling'}">自主上映</v-btn>
        <v-btn text :to = "{name:'workshop'}">ワークショップ</v-btn>
        <v-btn text :to = "{name:'kawaraban'}">かわら版</v-btn>

        <div v-if="isKawaraban" class="kawaraban_navi">
            <v-btn
            v-for = "item in category"
            :key = "'category' + item.sys.id"
                text class="mt-1" :to = "{name: 'category-slug', params: { slug: item.fields.slug }}">
                {{item.fields.titleAbbr}}</v-btn>
            <!-- <v-btn text :to="{name: 'series-recommend'}">おすすめ</v-btn> -->
            <v-btn text :to="{name: 'series'}">連載記事</v-btn>
        </div>

    </nav>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

    computed: {
        ...mapState(['category', 'series'])
        , ...mapGetters(['linkTo'])
        , isKawaraban: function()
		{
            return (this.$route.name.match(/kawaraban/)
                || this.$route.name.match(/series/)
                || this.$route.name.match(/category/)
                || this.$route.name === 'slug'
            ) ? true : false
        }
    }

    
}
</script>

<style>
    nav{
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eeeeee;
    }
    .kawaraban_navi{
        margin-top: 8px;
        border-top: 1px solid #eeeeee;
    }
</style>