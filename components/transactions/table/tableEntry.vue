<template>
  <tr class="transition ease-in-out duration-300">
    <template v-if="!transaction.metadata">
      <th class="w-32"
          :class="{'text-success' : transaction.delta > 0, 'text-error' : transaction.delta < 0}">
        {{ formatDelta(transaction.delta, transaction.currencyId) }}
      </th>

      <th></th>

      <td class="w-48">{{ tagsMap.get(transaction.tagId).tag.name }}</td>
      <td class="w-48">{{ new Date(transaction.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
      <td class="w-48">{{ accountsMap.get(transaction.accountId).name }}</td>
      <td>
        {{ transaction.description }}
      </td>
    </template>
    <template v-else-if="transaction.metadata.type === 1">
      <th class="w-32">
        <div class="flex gap-4 items-center">
          <div class="w-fit">
            <p class="opacity-80">
              {{ formatDelta(transaction.delta, transaction.currencyId) }}
            </p>

            <p class="text-xs opacity-50">
              {{ formatDelta(transaction.metadata.linkedTransaction.delta, transaction.metadata.linkedTransaction.currencyId) }}
            </p>
          </div>
        </div>
      </th>

      <th>
        <div class="flex justify-center items-center">
          <div class="tooltip btn btn-sm m-0 p-1 btn-ghost z-10" :data-tip="formatExchangeRate(transaction, exchangeRateMode)" @click="exchangeRateMode = !exchangeRateMode">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
        </div>
      </th>

      <td class="w-48">
        <p>
          {{ tagsMap.get(transaction.tagId).tag.name }}
        </p>

        <p class="text-xs opacity-80 hover:opacity-100" v-if="transaction.tagId !== transaction.metadata.linkedTransaction.tagId">
          {{ tagsMap.get(transaction.metadata.linkedTransaction.tagId).tag.name }}
        </p>
      </td>
      <td class="w-48">{{ new Date(transaction.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
      <td class="w-48">
        <p> {{ accountsMap.get(transaction.accountId).name }} </p>
        <p class="text-xs opacity-80 hover:opacity-100"> {{ accountsMap.get(transaction.metadata.linkedTransaction.accountId).name }} </p>
      </td>
      <td>
        <p>
          {{ transaction.description }}
        </p>

        <p class="text-xs opacity-80 hover:opacity-100" v-if="transaction.description !== transaction.metadata.linkedTransaction.description">
          {{ transaction.metadata.linkedTransaction.description }}
        </p>
      </td>
    </template>
    <template v-else-if="transaction.metadata.type === 2">
      <th class="w-32">
        <p :class="{'text-success' : transaction.delta > 0, 'text-error' : transaction.delta < 0}">
          {{ formatDelta(transaction.delta, transaction.currencyId) }}
        </p>
      </th>

      <th>
        <div class="flex justify-center items-center">
          <div class="tooltip z-10" :data-tip="$t('transactionsPage.placeholders.recurring')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
            </svg>
          </div>
        </div>
      </th>

      <td class="w-48">{{ tagsMap.get(transaction.tagId).tag.name }}</td>
      <td class="w-48">{{ new Date(transaction.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
      <td class="w-48">{{ accountsMap.get(transaction.accountId).name }}</td>
      <td>
        {{ transaction.description }}
      </td>
    </template>
    <template v-else-if="transaction.metadata.type === 3">
      <th class="w-32">
        <div class="flex gap-2 items-center">
          <p :class="{'text-success' : transaction.delta > 0, 'text-error' : transaction.delta < 0}">
            {{ formatDelta(transaction.delta, transaction.currencyId) }}
          </p>
        </div>
      </th>

      <th>
        <div class="flex justify-center items-center">
          <div class="tooltip z-10" :data-tip="$t('transactionsPage.placeholders.accumulation')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
        </div>
      </th>

      <td class="w-48">{{ tagsMap.get(transaction.tagId).tag.name }}</td>
      <td class="w-48">{{ new Date(transaction.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
      <td class="w-48">{{ accountsMap.get(transaction.accountId).name }}</td>
      <td>
        {{ transaction.description }}
      </td>
    </template>
    <slot/>
  </tr>
</template>

<script setup>
const props = defineProps({
  transaction: {
    required: true
  }
})

const { $transactionsApi, $transactionsTagsApi, $currenciesApi, $accountsApi, $toastsManager } = useNuxtApp();

const accountsMap = $accountsApi.getAccountsMap();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();
const tagsTree = $transactionsTagsApi.getTagsTree();

const currenciesMap = $currenciesApi.getCurrenciesMap();

const { t, locale } = useI18n();

const exchangeRateMode = ref(false);

const formatDelta = (delta, currencyId) => {
  const currency = currenciesMap.value.get(currencyId);
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency.decimals
  });
  return formatter.format(delta).replace(currency.code + " ", currency.symbol).replace(" " + currency.code, " " + currency.symbol);
}

const formatExchangeRate = (transaction, mode) => {
  const linked = transaction.metadata.linkedTransaction;

  const transaction1 = mode ? transaction : linked;
  const transaction2 = mode ? linked : transaction;

  const currency1 = currenciesMap.value.get(transaction1.currencyId);
  const currency2 = currenciesMap.value.get(transaction2.currencyId);

  const delta1 = Math.abs(transaction1.delta);
  const delta2 = Math.abs(transaction2.delta);

  return currency2.code + "/" + currency1.code + ": " + formatDelta(delta1 / delta2, (transaction1.currencyId));
}

</script>

<style scoped>

</style>