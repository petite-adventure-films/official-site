<?php get_header('pafshop');?>

<router-view
    @display-modal-check-basket = "modalCheckBasket = true"
    @display-modal-delete-item  = "confirmDeleteItem"
    @display-modal-payment      = "modalPayment = true"
    @hide-modal-payment = "modalPayment = false"
    ></router-view>
<div class="clear"></div>
    
<?php get_footer('vue'); ?>    

<!-- //////////////////////////////////////
// 確認 -->
<modal
v-if="modalCheckBasket == true">
    <template v-slot:close>
        <div class="icon icon-close" @click="modalCheckBasket = false"></div>
    </template>
    <div class="btn cursor_pointer" @click="modalCheckBasket = false">
        <span class="ele">買い物を続ける</span>
    </div>
    <router-link
        @click.native="modalCheckBasket = false"
        :to="{ name: 'basket' }"
        class="block btn shop m1_t">
        <span class="ele">買い物かごを見る</span>
    </router-link>
</modal>

<!-- //////////////////////////////////////
// 削除 -->
<modal
v-if="modalDeleteItem == true">
    <template v-slot:close>
        <div class="icon icon-close" @click="modalDeleteItem = false"></div>
    </template>
    <p>
        {{toDeleteItem.info.title}}
        【{{toDeleteItem.info.price_indexs[toDeleteItemKey]}}】を
        削除してもよろしいでしょうか
    </p>
    <div class="btn cursor_pointer m2_t" @click="modalDeleteItem = false">
        <span class="ele">キャンセル</span>
    </div>
    <div class="btn priority1 cursor_pointer m1_t" @click="deleteItem()">
        <span class="ele">削除</span>
    </div>
</modal>


<!-- //////////////////////////////////////
// カード決済 -->
<modal_payment
v-if="modalPayment == true"
    @close="modalPayment = false"></modal_payment>

<!-- #app --></div>

<?php wp_footer(); ?>
<script type="text/javascript" src="<?php echo get_template_directory_uri().'/dist/pafshop.js?'.filemtime(get_stylesheet_directory().'/dist/pafshop.js'); ?>"></script>

</body>
</html>
