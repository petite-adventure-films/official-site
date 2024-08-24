<script setup lang="ts">
import { Stage } from '~/types/pafshop-stage';

const stage = useState<Stage>('stage');

const props = withDefaults(
  defineProps<{
    currentStage: Stage;
  }>(),
  {
    currentStage: Stage.CONFIRM,
  },
);

const steps = [
  { name: '注文内容', verb: 'を確認してください', stage: Stage.CONFIRM },
  { name: 'お客様情報', verb: 'を入力してください', stage: Stage.USER_INFO },
  { name: 'お支払い方法', verb: 'を選択してください', stage: Stage.PAYMENT },
];
const currentStep = computed(() =>
  steps.find((step) => step.stage === props.currentStage),
);
const isEditing = computed(() => stage.value === props.currentStage);
const icons = {
  1: '🛍️',
  2: '🚚',
  3: '💴',
  4: '',
};
</script>

<template>
  <div>
    <div class="flex">
      <div class="flex justify-center items-center w-6 h-6">
        <span v-if="isEditing">✏️</span>
        <span v-else-if="props.currentStage < stage">✅</span>
        <span v-else>{{ icons[props.currentStage] }}</span>
      </div>
      <H3>
        {{ currentStep?.name
        }}<span v-if="isEditing">{{ currentStep?.verb }}</span>
      </H3>
      <button
        v-if="
          props.currentStage !== Stage.CONFIRM && stage > props.currentStage
        "
        class="ml-2 link-text"
        @click="stage = props.currentStage"
      >
        編集する
      </button>
    </div>
    <slot />
  </div>
</template>
