<p class="form_ele _required error_message">必須</p>
<div class="form_ele _required m1_t">
    <input type="text" v-model="user.name" placeholder="名前 例)山田花子"><br>
    <span class="error_message" v-if="errors.name !== false">{{errors.name}}</span>
</div>
<div class="form_ele _required m1_t">
    <input type="number" v-model="user.zipcode" placeholder="郵便番号 例)1000005" @input="searchAddress()"><br>
    <span class="error_message" v-if="errors.zipcode !== false">{{errors.zipcode}}</span>
</div>
<div class="form_ele _required m1_t">
    <input type="text" v-model="user.prefecture" placeholder="都道府県 例)東京都"><br>
    <span class="error_message" v-if="errors.prefecture !== false">{{errors.prefecture}}</span>
</div>
<div class="form_ele _required m1_t">
    <input type="text" v-model="user.city" placeholder="市区町村 例)千代田区丸の内"><br>
    <span class="error_message" v-if="errors.city !== false">{{errors.city}}</span>
</div>
<div class="form_ele _required m1_t">
    <input type="text" v-model="user.address1" placeholder="番地 例)1-1-1"><br>
    <span class="error_message" v-if="errors.address1 !== false">{{errors.address1}}</span>
</div>
<div class="form_ele m1_t">
    <input type="text" v-model="user.address2" placeholder="建物名・号室">
</div>
<div class="form_ele _required m1_t">
    <input type="number" v-model="user.tel" placeholder="電話番号 例)0123456791"><br>
    <span class="error_message" v-if="errors.tel !== false">{{errors.tel}}</span>
</div>
<div class="form_ele _required m1_t">
    <input type="email" v-model="user.email" placeholder="メールアドレス"><br>
    <span class="error_message" v-if="errors.email !== false">{{errors.email}}</span>
</div>
<div class="form_ele _required m1_t">
    <input type="email" v-model="user.emailConfirm" placeholder="メールアドレス確認"><br>
    <span class="error_message" v-if="errors.emailConfirm !== false">{{errors.emailConfirm}}</span>
</div>

<div class="form_ele m1_t">
    <input type="checkbox" v-model="user.receipt" id="receipt"><label for="receipt">領収書必要</label>
    <input class="block" v-if="user.receipt == true" type="text" v-model="user.receiptName" placeholder="お宛名">
    <input class="m1_t block" v-if="user.receipt == true" type="text" v-model="user.receiptDescription" placeholder="但し書き">
</div>

<div class="form_ele _required m1_t">
    個人情報の取扱について
    <div class="contents_law">
        <?
        $contents_law = get_post(4058);
        $_contents_law = $contents_law->post_content;
        echo $_contents_law;
        ?>
    </div>
    <input type="checkbox" v-model="user.agree" id="agree"><label for="agree"><strong>上記個人情報の取扱について同意しました</strong></label><br>
    <span class="error_message" v-if="errors.agree !== false">{{errors.agree}}</span>
</div>

<div v-if="step == 2" class="btn shop m2_t cursor_pointer" @click="completeUserInfo">
    <span class="ele">次へすすむ</span>
</div>
