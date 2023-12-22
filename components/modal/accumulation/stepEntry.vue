<template>
  <div class="join flex">
    <input class="input input-bordered join-item w-full" :placeholder="t('modals.setAccumulation.placeholders.stepEntry.from')" v-model.lazy="from" @change="update"/>
    <input class="input input-bordered join-item w-full" :placeholder="t('modals.setAccumulation.placeholders.stepEntry.to')" v-model.lazy="to" @change="update"/>
    <input class="input input-bordered join-item w-full" :placeholder="t('modals.setAccumulation.placeholders.stepEntry.step')" v-model.lazy="step" @change="update"/>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {

  }
})

const { t } = useI18n();

const from = ref(null);
const to = ref(null);
const step = ref(10);

const emit = defineEmits(['update:modelValue', 'updated'])

const update = () => {
  if (from.value === props.modelValue.from && to.value === props.modelValue.to && step.value === props.modelValue.step)
    return;

  emit("update:modelValue", {
    from: from.value,
    to: to.value,
    step: step.value
  });

  emit("updated");
}

watch(() => props.modelValue, () => {
  from.value = props.modelValue.from;
  to.value = props.modelValue.to;
  step.value = props.modelValue.step;
});

from.value = props.modelValue.from;
to.value = props.modelValue.to;
step.value = props.modelValue.step;

</script>

<style scoped>

</style>