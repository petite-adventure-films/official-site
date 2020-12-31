<template>
    <div class="modal-mask">
        <div class="modal-container">
            <slot name="close"></slot>
            <div class="confirm_btns">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default{
}
</script>