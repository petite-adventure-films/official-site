<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    label: string;
    inputLabel: string;
    required?: boolean;
    errorMessage?: string;
  }>(),
  {
    name: '',
    inputLabel: '',
    required: false,
    errorMessage: '',
    label: '',
  },
);

const model = defineModel<boolean>();
defineEmits(['change']);

const requiredClass = computed(() =>
  props.required ? `before:content-['*'] before:text-red-600` : '',
);
</script>

<template>
  <div>
    <label
      :for="name"
      class="flex gap-1 text-xs text-gray-900"
      :class="requiredClass"
      >{{ props.label }}</label
    >
    <slot />
    <div
      class="flex items-center w-fit h-10 mt-2 border border-black disabled:border-gray-100"
    >
      <label
        :for="name"
        class="flex items-center gap-x-1 w-full h-full text-xs p-2"
      >
        <input
          :id="name"
          v-model="model"
          :name="name"
          type="checkbox"
          :required="props.required"
          @change="$emit('change')"
        />
        {{ props.inputLabel }}
      </label>
    </div>
    <p v-if="props.errorMessage" role="alert" class="mt-1 text-xs text-red-600">
      {{ props.errorMessage }}
    </p>
  </div>
</template>
