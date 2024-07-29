<template>
  <div class="join">
    <div v-if="!signChoice" class="join-item flex justify-center items-center px-4 bg-base-200">
      <svg v-if="sign > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
      </svg>
    </div>
    <select v-else class="select select-bordered join-item" v-model.number="sign" @click="signManuallyChoice = true">
      <option :value="-1"> - </option>
      <option :value="1"> + </option>
    </select>

    <input
        class="input input-bordered join-item w-full"
        v-model="rawAmount"
        @change="amountChanged"
        :placeholder="$t('selects.amountField.placeholder')"
        :class="{'input-error' : highlightErrors && (modelValue === undefined || modelValue === 0)}"
    >
    <div v-if="currency !== undefined" class="join-item flex justify-center items-center px-4 bg-base-200">
      <p class="font-bold">
        {{ currency.symbol }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {

  },

  tagId: {
    required: true
  },

  currencyId: {
    required: true
  },

  highlightErrors: {

  },

  signOverride: {

  }
})

const emit = defineEmits(['update:modelValue'])

const { $transactionsTagsApi, $currenciesApi } = useNuxtApp();
const { t, locale } = useI18n();

const sign = ref(props.signOverride ? props.signOverride : 1);
const signChoice = ref(!props.signOverride);
const signManuallyChoice = ref(false);

const currenciesMap = $currenciesApi.getCurrenciesMap();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();

const currency = ref();
const rawAmount = ref("");

const amountChanged = () => {
  const decimals = currency.value ? currency.value.decimals : 2;

  let evalResult = undefined;

  try {
    evalResult = eval(
        rawAmount.value
            .replace(",", '.')
            .replace(/[^-()\d/*+.]/g, '')
    );
  }catch (e) {}

  if (!evalResult) {
    rawAmount.value = "";
    emit('update:modelValue', undefined);

    return;
  }

  const newAmount = Number(evalResult.toFixed(decimals));

  if (signChoice.value) {
    const newSign = Math.sign(newAmount) || 1;

    if (newSign < 0 || !signManuallyChoice.value)
      sign.value = newSign;
  }

  rawAmount.value = String(Math.abs(newAmount));

  emit('update:modelValue', Math.abs(newAmount) * sign.value);
}

watch(sign, () => {
  emit('update:modelValue', Math.abs(props.modelValue) * sign.value);
})

watch(() => props.currencyId, () => {
  currency.value = currenciesMap.value.get(props.currencyId);
})

const updateSign = () => {
  signManuallyChoice.value = false;

  if (props.signOverride)
    return;

  if (props.tagId === undefined) {
    signChoice.value = true;
    return;
  }

  const parentTagObject = tagsMap.value.get(props.tagId);

  if (parentTagObject === undefined || parentTagObject.tag === undefined) {
    signChoice.value = true;
    return;
  }

  if (parentTagObject.tag.type !== 0)
    sign.value = parentTagObject.tag.type

  signChoice.value = parentTagObject.tag.type === 0;
}

watch(() => props.tagId, (value, oldValue, onCleanup) => {
  updateSign();
});


watch(() => props.modelValue, () => {
  if (!props.modelValue && rawAmount.value === "")
    return;

  rawAmount.value = String(props.modelValue || "");

  amountChanged();
})

if (props.modelValue) {
  rawAmount.value = String(props.modelValue);

  amountChanged();
}

if (props.tagId) {
  updateSign();
}

if (props.currencyId) {
  currency.value = currenciesMap.value.get(props.currencyId);
}

</script>

<style scoped>

</style>