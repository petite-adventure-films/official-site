<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    publishedDate: Date;
    updatedDate?: Date;
  }>(),
  {
    publishedDate: undefined,
    updatedDate: undefined,
  },
);

const isModifiedAfterADay = computed(() => {
  if (props.updatedDate) {
    const dateObj1 = new Date(props.publishedDate);
    const dateObj2 = new Date(props.updatedDate);
    const timeDifference = Math.abs(dateObj2.getTime() - dateObj1.getTime());
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
    return dayDifference > 1;
  }
  return 0;
});
</script>

<template>
  <div class="mt-2 text-xs text-gray-500">
    <time :date-time="props.publishedDate">
      {{ props.publishedDate }}
    </time>
    <time
      v-if="updatedDate && isModifiedAfterADay"
      class="pl-2"
      :date-time="props.updatedDate"
    >
      修正 : {{ props.updatedDate }}
    </time>
  </div>
</template>
