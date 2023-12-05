<template>
  <div v-if="accounts.length > 0" class="stats stats-vertical shadow">
    <div v-for="[key, value] in map" class="stat">
      <div class="stat-title">{{ key.code }}</div>
      <div class="stat-value">{{ formatAmount(value, key) }}</div>
      <div class="stat-desc">{{ key.description }}</div>
    </div>
  </div>
  <div v-else class="panel flex">
    <div class="card min-w-max templateBorder flex-1">
      <div class="card-body p-3 justify-center items-center min-h-max font-bold">
        {{ $t('mainPage.summary.emptyMessage') }}
      </div>
    </div>
  </div>
</template>

<script setup>
const {$accountsApi, $currenciesApi} = useNuxtApp();
const { t, locale } = useI18n();

const accounts = $accountsApi.getAccounts();
const currencyMap = $currenciesApi.getCurrenciesMap();

const formatAmount = (delta, currency) => {
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency.decimals
  });
  return formatter.format(delta).replace(currency.code + " ", currency.symbol).replace(" " + currency.code, " " + currency.symbol);
}

const map = computed(() => {
  const result = new Map();

  for (const account of accounts.value) {
    const currency = currencyMap.value.get(account.currencyId);

    if (!result.has(currency))
      result.set(currency, 0);

    result.set(currency, result.get(currency) + account.amount);
  }

  return result;
})

</script>

<style scoped>

</style>