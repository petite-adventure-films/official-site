<template>
    <div>
        <p v-html="contactMessage"></p>
        <div class="inline_block btn priority1">
            <a :href="contactUrl">お問い合わせ</a>
        </div>
    </div>
</template>

<script>

export default {

    props: ['message']
    
    , data()
    {
        return {
            contactUrl : process.env.CONTACT_URL
        }
    }
    
    , computed:
    {
        contactMessage()
        {
            return this.message ? this.message : 'お問い合わせはこちらから'
        }
        
    }
    
}
</script>