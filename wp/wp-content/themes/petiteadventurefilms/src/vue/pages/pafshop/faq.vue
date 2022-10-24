<template>
    <div class="single_pafshop col col_9">
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>
    
         <div class="m7_t">
            <dl class="list_faq">
                <dt>商品はどのくらいで届きますか？</dt>
                <dd>お支払い確認後、3～5日以内に発送します。</dd>
                
                <dt class="m4_t">どのような支払方法がありますか？</dt>
                <dd>クレジットカード（Visa、Master）、銀行振込（三菱UFJ銀行、ゆうちょ銀行、PayPay銀行）からお選びいただけます。</dd>
                
                <dt class="m4_t">送料はいくらですか？</dt>
                <dd>1回のお申込につき、同一住所宛なら何枚でも300円です。3,000円以上のお買い上げで送料無料となります。</dd>
                
                <dt class="m4_t">後払いはできますか？</dt>
                <dd>「先払い」でお願いしていますが、図書館や学校法人などは、請求書による後払いも可能です。その場合はご相談ください。</dd>
                
                <dt class="m4_t">「団体・ライブラリー価格」とは何ですか？</dt>
                <dd>学校・団体や図書館など、不特定多数の方への無料貸出を目的としたご購入の場合は、「団体・ライブラリー価格」でお買い求め下さい。有料貸出の場合は、別途ご相談下さい。</dd>
                
                <dt class="m4_t">購入したDVDで、上映会を開催することはできますか？</dt>
                <dd>DVD・ブルーレイには上映権はついていません。上映をご希望の場合は、<a :href="fourwallingUrl">上映会について</a>をご覧ください。</dd>
                
                <dt class="m4_t">ディスクの規格は？</dt>
                <dd>DVDの規格は、NTSC、DVD-Rディスク（DVD-R対応機器にて再生可能）です。ブルーレイの規格は、NTSC、BD-Rディスク（BD-R対応機器にて再生可能）です。</dd>
                
                <dt class="m4_t">ディスクが再生されません。</dt>
                <dd>DVD及びブルーレイディスクは、再生機器との相性により、まれにディスクが読み込まれなかったり、メニュー画面が表示されなかったり、再生が途中で止まってしまうことがあります。その場合は、他機器での再生をお試しください。それでも再生されない場合は、ご連絡を頂ければ、パソコン再生専用のディスクと交換いたします。</dd>
                
                <dt class="m4_t">返品はできますか？</dt>
                <dd>商品に不具合があった場合にのみ、交換の対応をさせていただいております。お客様都合での返品・交換は承れません。あらかじめご了承ください。</dd>
            </dl>
        </div>
        
        <div class="contents">
            <ContactUs :message="contactMessage"></ContactUs>
        </div>
        
        <div class="clear"></div>
        
    </div>
    
</template>

<script>
import ArticleHeader from 'VUE/components/article_header.vue'
import ContactUs from 'VUE/components/contact_us.vue'

export default {

    components: { ArticleHeader, ContactUs }
    
    , data()
    {
        return{
            contactMessage: 'その他の質問などがありましたら<br>下記からお問い合わせください。'
            , fourwallingUrl: `${process.env.SITE_URL}four-walling`
        }
    }
    
    , computed:
    {
        
        breadCrumbs()
        {
            return [
                  { name: 'top', title: 'ショップ' }
                , { title: 'よくある質問' }
            ]
        }
        
    }
    
    , created()
    {
    }
    
}
</script>