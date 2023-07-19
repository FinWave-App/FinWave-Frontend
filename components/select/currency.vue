<template>
  <Multiselect
      v-model="value"
      :options="options"
      :no-options-text="$t('selects.noOptions')"
      :no-results-text="$t('selects.noResults')"
  >

    <template v-slot:tag="{ option, handleTagRemove, disabled }">
      <div
          class="multiselect-tag is-user"
          :class="{
            'is-disabled': disabled
          }"
      >

        {{ option.code }}

        <span
            v-if="!disabled"
            class="multiselect-tag-remove"
            @click="handleTagRemove(option, $event)"
        >
            <span class="multiselect-tag-remove-icon"></span>
        </span>
      </div>
    </template>

  </Multiselect>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";

const props = defineProps({
  modelValue: {
  }
})

const emit = defineEmits(['update:modelValue', 'selected'])
const { t } = useI18n();
const { $currenciesApi } = useNuxtApp();

const value = ref(props.modelValue || null);
const currencies = $currenciesApi.getCurrencies();

const options = computed(() => {
  const resultArray = [];

  currencies.value.forEach((c) => {
    resultArray.push({
      label: c.code + " - " + c.description + " (" + c.symbol + ")",
      code: c.code,
      value: c.currencyId
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