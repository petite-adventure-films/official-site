<template>
    <header>
        Petite Adventure Films<br>
        プチ・アドベンチャー・フィルムズ

        <v-btn
        v-if="isShop"
            outlined color="purple" :to="{name:'shop-cart'}">
            <v-icon>mdi-shop</v-icon>
            CART {{pafCartCount}}
        </v-btn>

        <v-btn
        v-if="!isShop"
            outlined color="purple" :to="{name:'shop'}">
                <v-icon>mdi-shop</v-icon>
                SHOP
        </v-btn>

    </header>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

export default{

    props: ['']

    , components: {
    }

    , data: function()
    {

        return{
              siteName: process.env.SITE_NAME
            , siteNameJP: process.env.SITE_NAME_JP
        }

    }

    , computed:
    {

        ...mapState(['pafCartCount'])
        , isShop: function()
        {
             return this.$route.name.match(/shop/) ? true : false
        }
    }

}
</script>

// SITE_NAME = Petite Adventure Films
// SITE_NAME_JP = プチ・アドベンチャー・フィルムズ
// SITE_DESCRIPTION = インディペンデントのドキュメンタリー監督、早川由美子の作品と上映情報を紹介するサイト。これまでに、反戦・平和運動、住宅・貧困問題、震災・原発問題など、マスメディアでは取り上げられにくいテーマを、独自の視点で表現。これまでの主な作品『ブライアンと仲間たち』、『さようならUR』、『木田さんと原発、そして日本』など。

