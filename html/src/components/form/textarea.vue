<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    errorMessage?: string;
    inputMode?: 'number';
    disabled?: boolean;
  }>(),
  {
    name: '',
    label: '',
    required: false,
    placeholder: '',
    errorMessage: '',
    inputMode: undefined,
    disabled: false,
  },
);

const model = defineModel<string>();
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
    <div class="w-full mt-2">
      <textarea
        :id="name"
        v-model="model"
        :name="name"
        :required="props.required"
        :placeholder="props.placeholder"
        class="w-full h-32 rounded-none border border-black block p-2 disabled:border-gray-100 disabled:opacity-100 disabled:bg-gray-50"
        :disabled="props.disabled"
        @change="$emit('change')"
      />
      <span
        v-if="props.errorMessage"
        role="alert"
        class="text-xs text-red-600"
        >{{ props.errorMessage }}</span
      >
    </div>
  </div>
</template>
