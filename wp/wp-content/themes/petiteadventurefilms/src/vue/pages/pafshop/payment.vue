<template>
    <div class="modal-mask">
        <div class="modal-container">
            <slot name="close"></slot>
            <div class="confirm_btns">
            payment
            </div>
        </div>
    </div>
</template>

<script>

export default {

    components: {  }
    
    , data()
    {
        return{
        }
    }
    
    , computed:
    {
        
    }
    
}
</script>