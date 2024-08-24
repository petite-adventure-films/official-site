<script lang="ts" setup>
import { VPdfViewer, VPVBaseProps } from '@vue-pdf-viewer/viewer';
const props = defineProps({ ...VPVBaseProps });
</script>
<template>
  <div class="w-full h-96">
    <VPdfViewer v-bind="$props" />
  </div>
</template>
