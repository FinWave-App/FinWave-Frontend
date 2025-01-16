<template>
  <div v-if="accounts.length > 0" class="stats stats-vertical shadow">
    <div v-if="exchangesEnabled" class="stat">
      <div class="stat-value">
        <p v-if="preferredResult"> {{ formatAmount(preferredResult, preferredCurrency) }}</p>
        <span v-else class="loading loading-dots loading-sm"></span>
      </div>
      <div class="stat-desc">
        {{ $t('mainPage.summary.preferredTip') }}
      </div>
    </div>
    <div v-for="[key, value] in map" class="stat">
      <div class="stat-title">{{ key.code }}, {{ key.description }}</div>
      <div class="stat-value">{{ formatAmount(value, key) }}</div>
      <div v-if="ratesMap.get(key.currencyId)" class="stat-desc flex justify-between gap-1 items-center">
        <p class="font-bold">
          {{ formatAmount(ratesMap.get(key.currencyId) * value, preferredCurrency) }}
        </p>
        <p>
          {{key.code + "/" + preferredCurrency.code + ": " + formatAmount(ratesMap.get(key.currencyId), preferredCurrency) }}
        </p>
      </div>
    </div>
  </div>
  <div v-else class="panel flex">
    <div class="card  template-border flex-1">
      <div class="card-body p-3 justify-center items-center min-h-max font-bold text-center">
        {{ $t('mainPage.summary.emptyMessage') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import {useCurrencyFormatter} from "~/composables/useCurrencyFormatter";
import {useStorage} from "@vueuse/core";

const {$accountsApi, $currenciesApi, $exchangeRateApi, $serverConfigs} = useNuxtApp();
const { t, locale } = useI18n();

const exchangesEnabled = $serverConfigs.configs.exchanges.enabled;

const accounts = $accountsApi.getAccounts();
const currencyMap = $currenciesApi.getCurrenciesMap();

const formatAmount = (delta, currency) => {
  return useCurrencyFormatter(delta, currency, locale.value);
}

const preferredCurrencyId = useStorage("preferred_currency", 1);
const preferredCurrency = computed(() => currencyMap.value.get(preferredCurrencyId.value))
const preferredResult = ref()

const ratesMap = ref(new Map());

const map = computed(() => {
  const result = new Map();

  for (const account of accounts.value) {
    const currency = currencyMap.value.get(account.currencyId);

    if (!currency)
      continue;

    if (!result.has(currency))
      result.set(currency, 0);

    result.set(currency, result.get(currency) + account.amount);
  }

  return result;
})

const calculatePreferred = async () => {
  preferredResult.value = null;
  ratesMap.value.clear();

  const target = preferredCurrencyId.value;
  let result = 0;

  for (const [key, value] of map.value) {
    if (key.currencyId === target) {
      result += value;
      continue;
    }

    const rate = await $exchangeRateApi.getExchangeRate(key.currencyId, target)

    if (rate === -1)
      continue;

    ratesMap.value.set(key.currencyId, rate);
    result += value * rate;
  }

  preferredResult.value = result;
}

if (exchangesEnabled) {
  watch([() => map.value, preferredCurrencyId], () => {
    calculatePreferred();
  })

  calculatePreferred();
}

</script>

<style scoped>

</style>