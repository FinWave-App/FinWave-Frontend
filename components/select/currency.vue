<template>
  <Multiselect
      v-model="value"
      :options="options"
      :placeholder="$t('selects.currencySelect.placeholder')"
      :no-options-text="$t('selects.noOptions')"
      :no-results-text="$t('selects.noResults')"
  >

    <template v-slot:category="{ option, handleCategoryRemove, disabled }">
      <div
          class="multiselect-category is-user"
          :class="{
            'is-disabled': disabled
          }"
      >

        {{ option.code }}

        <span
            v-if="!disabled"
            class="multiselect-category-remove"
            @click="handleCategoryRemove(option, $event)"
        >
            <span class="multiselect-category-remove-icon"></span>
        </span>
      </div>
    </template>

  </Multiselect>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";

const props = defineProps({
  modelValue: {
  },

  excludeCurrencies: {
    type: Array,
    required: false
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
    if (!props.excludeCurrencies || !props.excludeCurrencies.find(exc => exc === c.currencyId))
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