<template>
    <div>
       <p class="form_ele _required error_message">必須</p>
        <div class="form_ele _required m1_t">
            <input type="text" v-model="user.name" name="name" @change="setUserInfo" placeholder="名前 例)山田花子"><br>
            <span class="error_message" v-if="errors.name !== false">{{errors.name}}</span>
        </div>
        <div class="form_ele _required m1_t">
            <input type="number" v-model="user.zipcode" name="zipcode" placeholder="郵便番号 例)1000005" @input="searchAddress()" @change="setUserInfo"><br>
            <span class="error_message" v-if="errors.zipcode !== false">{{errors.zipcode}}</span>
        </div>
        <div class="form_ele _required m1_t">
            <input type="text" v-model="user.prefecture" name="prefecture" @change="setUserInfo" placeholder="都道府県 例)東京都"><br>
            <span class="error_message" v-if="errors.prefecture !== false">{{errors.prefecture}}</span>
        </div>
        <div class="form_ele _required m1_t">
            <input type="text" v-model="user.city" name="city" @change="setUserInfo" placeholder="市区町村 例)千代田区丸の内"><br>
            <span class="error_message" v-if="errors.city !== false">{{errors.city}}</span>
        </div>
        <div class="form_ele _required m1_t">
            <input type="text" v-model="user.address1" name="address1" @change="setUserInfo" placeholder="番地 例)1-1-1"><br>
            <span class="error_message" v-if="errors.address1 !== false">{{errors.address1}}</span>
        </div>
        <div class="form_ele m1_t">
            <input type="text" v-model="user.address2" name="address2" @change="setUserInfo" placeholder="建物名・号室">
        </div>
        <div class="form_ele _required m1_t">
            <input type="number" v-model="user.tel" name="tel" @change="setUserInfo" placeholder="電話番号 例)0123456790"><br>
            <span class="error_message" v-if="errors.tel !== false">{{errors.tel}}</span>
        </div>
        <div class="form_ele _required m1_t">
            <input type="email" v-model="user.email" name="email" @change="setUserInfo" placeholder="メールアドレス"><br>
            <span class="error_message" v-if="errors.email !== false">{{errors.email}}</span>
        </div>
        <div class="form_ele _required m1_t">
            <input type="email" v-model="user.emailConfirm" name="emailConfirm" @change="setUserInfo" placeholder="メールアドレス確認"><br>
            <span class="error_message" v-if="errors.emailConfirm !== false">{{errors.emailConfirm}}</span>
        </div>
        
        <div class="form_ele m1_t">
            <input type="checkbox" v-model="user.receipt" name="receipt" @change="setUserInfo" id="receipt"><label for="receipt">領収書必要</label>
            <input class="block" v-if="user.receipt == true" type="text" v-model="user.receiptName" name="receiptName" @change="setUserInfo" placeholder="お宛名">
            <input class="m1_t block" v-if="user.receipt == true" type="text" v-model="user.receiptDescription" name="receiptDescription" @change="setUserInfo" placeholder="但し書き">
        </div>
        
        <div class="form_ele _required m1_t">
            個人情報の取扱について
            <div class="contents_law" v-html="pageForAgreeContents"></div>
            <input type="checkbox" v-model="user.agree" name="agree" @change="setUserInfo" id="agree"><label for="agree"><strong>上記個人情報の取扱について同意しました</strong></label><br>
            <span class="error_message" v-if="errors.agree !== false">{{errors.agree}}</span>
        </div>
        
        <div
        v-if="step == 2"
            class="btn shop m2_t cursor_pointer"
            @click="completeUserInfo">
            <span class="ele">次へすすむ</span>
        </div>

    </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

export default {
    
    props: ['step']
    
    , data()
    {
        return{
            
            pageForAgreeContents: ''
            , errors:{
                  agree: '必ずチェックしてください'
                , name: false
                , zipcode: false
                , prefecture: false
                , city: false
                , address1: false
                , tel: false
                , email: false
                , emailConfirm: false
            }

            , helpers:{
                  agree: '必ずチェックしてください'
                , name: false
                , zipcode: false
                , prefecture: false
                , city: false
                , address1: false
                , tel: false
                , email: false
                , emailConfirm: false
            }
            
        }
    }
    
    , computed:
    {
        ...mapState(['user'])
        , ...mapGetters(['convertYen', 'itemsInBasket', 'totalAmount', 'deliveryFee'])
    }
    
    , methods:
    {
        setUserInfo(e){
            let value = (e.target.type == 'checkbox') ? e.target.checked : e.target.value;
            this.$store.commit('setUser', { key: e.target.name, value: value})
        }
    
        , completeUserInfo()
        {
            try {

                this.checkName();
                this.checkZipcode();
                this.checkPrefecture();
                this.checkCity();
                this.checkAddress1();
                this.checkTel();
                this.checkEmail();
                this.checkEmailConfirm();
                this.checkAgree();

                Object.keys(this.errors).forEach(k => {
                    if(this.errors[k] !== false)
                    {
                        throw 'フォームの内容を確認してください'
                    }
                })

                this.$emit('complete');

            } catch (error) {
            }

        }
            
        , async searchAddress()
        {
            let url = '/zipsearch.php?zipcode=' + this.user.zipcode
            let res = await this.$http.get(url)
            if(res.status === 200)
            {
                var data = res.data.results
                if(data)
                {
                    this.$store.commit('setUser', { key: 'prefecture', value: data[0].address1})
                    this.$store.commit('setUser', { key: 'city', value: data[0].address2 + data[0].address3})
                }
            }
        }
            
        , checkName()
        {
            this.errors['name'] = false
            if(this.user.name === '')
            {
                this.errors['name'] = '名前がありません'
            }
        }
        , checkZipcode()
        {
            this.errors['zipcode'] = false
            if(this.user.zipcode === '')
            {
                this.errors['zipcode'] = '郵便番号がありません'
            }
            else if(!/^\d{7}$/.test(this.user.zipcode))
            {
                this.errors['zipcode'] = '正しい郵便番号を入力ください 半角数字のみ 例)1000005'
            }
        }
        , checkPrefecture()
        {
            this.errors['prefecture'] = false
            if(this.user.prefecture === '')
            {
                this.errors['prefecture'] = '都道府県を入力してください'
            }
        }
        , checkCity()
        {
            this.errors['city'] = false
            if(this.user.city === '')
            {
                this.errors['city'] = '市区町村を入力してください'
            }
        }
        , checkAddress1()
        {
            this.errors['address1'] = false
            if(this.user.address1 === '')
            {
                this.errors['address1'] = '番地を入力してください'
            }
        }
        , checkTel()
        {
            this.errors['tel'] = false
            if(this.user.tel === '')
            {
                this.errors['tel'] = '電話番号を入力してください'
            }
            else if(!/^\d{10,11}$/.test(this.user.tel))
            {
                this.errors['tel'] = '正しい電話番号を入力ください 半角数字のみ 例)0123456790'
            }

        }
        , checkEmail()
        {
            this.errors['email'] = false;
            if(this.user.email === '')
            {
                this.errors['email'] = 'メールアドレスを入力してください'
            }
            else if(!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.user.email))
            {
                this.errors['email'] = '正しいメールアドレスを入力ください 例)test@mail.com'
            }
        }
        , checkEmailConfirm()
        {
            this.errors['emailConfirm'] = false
            if(this.user.emailConfirm === '')
            {
                this.errors['emailConfirm'] = 'メールアドレスを入力してください'
            }
            else if(this.user.email != this.user.emailConfirm)
            {
                this.errors['emailConfirm'] = 'メールアドレスが一致しません'
            }
        }
        , checkAgree()
        {
            this.errors['agree'] = false
            if(this.user.agree === false)
            {
                this.errors['agree'] = '必ずチェックしてください'
            }
        }
        
    }
    
    , watch:
    {
          'user.name'         : function(n, o){ this.checkName() }
        , 'user.zipcode'      : function(n, o){ this.checkZipcode() }
        , 'user.prefecture'   : function(n, o){ this.checkPrefecture() }
        , 'user.city'         : function(n, o){ this.checkCity() }
        , 'user.address1'     : function(n, o){ this.checkAddress1() }
        , 'user.tel'          : function(n, o){ this.checkTel() }
        , 'user.email'        : function(n, o){ this.checkEmail() }
        , 'user.emailConfirm' : function(n, o){ this.checkEmailConfirm() }
        , 'user.agree'        : function(n, o){ this.checkAgree() }
    }
    
    , async created()
    {
        const pageURI = `${process.env.SITE_URL}wp-json/wp/v2/pages/4058`;
        const response = await this.$http.get(pageURI);
        this.pageForAgreeContents = response.data.content.rendered;
        
    }
    
}
</script>