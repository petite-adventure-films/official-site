<template>
    <div>
        <header class="col col_9 header_page">
            <nav class="crumbs">
                <div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
                    <a :href="siteUrl" itemprop="url">
                        <span itemprop="title">HOME</span>
                    </a>
                </div>
                <div
                v-for="val in breadCrumbs"
                :key="`crumb${val.title}`"
                    itemscope
                    itemtype = "http://data-vocabulary.org/Breadcrumb"
                    class    = "crumb">
                    <router-link
                        :to="{ name: val.name, params: { title: val.title, year: (val.year) ? val.year : null } }">
                        {{val.title}}
                    </router-link>
                </div>
            </nav>
            <!-- <div class="labels">
                <span class="label _status">中止</span>
                <span class="label _eventtag">上映会</span>
            </div> -->
            <h1 class="m5_b">{{articleTitle}}</h1>
        <!--.header_page--></header>
        <div class="clear"></div>
    </div>
</template>

<script>

export default {

    props: ['breadCrumbs']
    
    , data()
    {
        return{
            siteUrl: process.env.SITE_URL
        }
    }
    
    , computed:
    {
        articleTitle()
        {
            let lastElement = this.breadCrumbs[this.breadCrumbs.length - 1];
            return lastElement.title;
        }
    }
    
}
</script>