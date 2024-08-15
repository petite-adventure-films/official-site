<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    errorMessage?: string;
    inputMode?: 'number';
    type?: 'text' | 'number' | 'email' | 'tel' | 'url';
    disabled?: boolean;
  }>(),
  {
    name: '',
    label: '',
    required: false,
    placeholder: '',
    errorMessage: '',
    inputMode: undefined,
    type: 'text',
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
    <div
      class="w-4/5 h-10 mt-2 border border-black has-[input:disabled]:border-gray-100"
    >
      <input
        :id="name"
        v-model="model"
        :name="name"
        :type="props.type"
        :required="props.required"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        class="w-full h-full p-2"
        @change="$emit('change')"
      />
    </div>
    <p v-if="props.errorMessage" role="alert" class="mt-1 text-xs text-red-600">
      {{ props.errorMessage }}
    </p>
  </div>
</template>
