<template>
  <Multiselect
      v-model="value"
      :groups="true"
      :options="options"
      :no-options-text="$t('selects.noOptions')"
      :no-results-text="$t('selects.noResults')"
  >

  </Multiselect>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";
import {useArrayFilter} from "@vueuse/core";

const props = defineProps({
  modelValue: {
  }
})

const emit = defineEmits(['update:modelValue', 'selected'])
const { t } = useI18n();
const {$accountsApi, $accountsTagsApi} = useNuxtApp();

const tags = await $accountsTagsApi.getTags();
const accounts = await $accountsApi.getAccounts();

const value = ref(props.modelValue || null);

const getTagAccounts = (t) => {
  return useArrayFilter(accounts, a => a.tagId === t.tagId).value
}

const options = computed(() => {
  const resultArray = [];

  tags.value.forEach((t) => {
    const options = getTagAccounts(t).map((a) => {
      return {
        label: a.name,
        value: a.accountId
      }
    });

    resultArray.push({
      label: t.name,
      options: options
    });

  });

  return resultArray;
});

watch(value, (l, n) => {
  if (value.value === null || props.modelValue == value.value)
    return;

  emit('update:modelValue', value.value);
  emit('selected');
});

watch(() => props.modelValue, () => {
  value.value = props.modelValue;
});

</script>

<style scoped>

</style>