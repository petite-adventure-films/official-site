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
            
            <div
            v-if="labels"
                class="labels">
                <span
                v-for="(item, key) in labels"
                :key="`${key}${item}`"
                    :class="`inline-block body1 label _${item.class}`">
                    {{item.label}}
                </span>
            </div>
            
            <h1 class="m5_b">{{articleTitle}}</h1>
        <!--.header_page--></header>
        <div class="clear"></div>
    </div>
</template>

<script>

export default {

    props: ['breadCrumbs', 'labels']
    
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