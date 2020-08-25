<template>
    <v-card
        :to = "{ name: 'slug', params: { slug: fields.slug } }"
        outlined
        class="mt-4"
        >
        <v-img
        v-if="fields.thumbnail"
            class="white--text align-end"
            height="200px"
            :src="getThumbImg(fields.thumbnail.fields.file.url)"
            ><v-card-title>
                <v-chip v-if="thisCategory">{{thisCategory.fields.titleAbbr}}</v-chip>
                <v-chip v-if="thisFilm">{{thisFilm.fields.titleAbbr}}</v-chip>
                <v-chip v-if="thisSeries">#{{thisSeries.fields.titleAbbr}}</v-chip>
                <div>{{fields.title}}</div>
            </v-card-title>
        </v-img>

        <v-card-title v-else>
            <v-chip v-if="thisCategory">{{thisCategory.fields.titleAbbr}}</v-chip>
            <v-chip v-if="thisFilm">{{thisFilm.fields.titleAbbr}}</v-chip>
            <v-chip v-if="thisSeries">#{{thisSeries.fields.titleAbbr}}</v-chip>
            <div>{{fields.title}}</div>
        </v-card-title>
    </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default{

    props: ['post']

    , components: {
    }

    , data: function()
    {
        return{
        }
    }

    , computed: {
        ...mapGetters(['linkTo', 'dateFormat'])
        , fields: function(){ return (this.post) ? this.post.fields : {} }
        , thisCategory: function()
        {
            return (this.fields.category && this.fields.category.fields)
                ? this.fields.category : undefined
        }
        , thisFilm: function()
        {
            return (this.fields.realtedFilm && this.fields.realtedFilm.fields)
                ? this.fields.realtedFilm : undefined
        }
        , thisSeries: function()
        {
            return (this.fields.relatedSeries && this.fields.relatedSeries.fields) 
                ? this.fields.relatedSeries : undefined
        }

    }

    , methods: {
        getThumbImg(path)
        {
            return path + '?fit=thumb';
        }
    }

    , mounted: function()
    {
    }

    , created()
    {
    }

}
</script>