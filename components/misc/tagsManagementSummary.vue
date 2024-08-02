<template>
  <div class="flex gap-2 w-full flex-col sm:flex-row">
    <div class="stats shadow w-full" v-if="expectIncome.length > 0">
      <div class="stat" v-for="m in expectIncome.filter(m => m.dateType == 0)">
        <div class="stat-title">{{ currenciesMap.get(m.currencyId).code }}</div>
        <div class="stat-value text-success"> +{{ formatDelta(m.amount, m.currencyId) }} </div>
        <div class="stat-desc">
          {{ capitalizeFirstLetter($t("tagsPage.table.management.dateTypes.perMonth")) }}

          <template v-if="m.showMax">
            <br>
            {{ $t("tagsPage.tagsSummary.maxContribution") }}: {{ tagsMap.get(m.maxTag).name.toLocaleLowerCase() }}, {{ formatDelta(m.maxAmount, m.currencyId) }}
          </template>
        </div>
      </div>

      <div class="stat" v-for="m in expectIncome.filter(m => m.dateType == 1)">
        <div class="stat-title">{{ currenciesMap.get(m.currencyId).code }}</div>
        <div class="stat-value text-success"> +{{ formatDelta(m.amount, m.currencyId) }} </div>
        <div class="stat-desc">
          {{ capitalizeFirstLetter($t("tagsPage.table.management.dateTypes.perQuartal")) }}

          <template v-if="m.showMax">
            <br>
            {{ $t("tagsPage.tagsSummary.maxContribution") }}: {{ tagsMap.get(m.maxTag).name.toLocaleLowerCase() }}, {{ formatDelta(m.maxAmount, m.currencyId) }}
          </template>
        </div>
      </div>
    </div>
    <div v-else class="w-full template-border flex items-center justify-center text-center rounded-xl min-h-24">
      <p class="font-bold opacity-50">{{ $t("tagsPage.tagsSummary.noData.income") }}</p>
    </div>

    <div class="stats shadow w-full" v-if="expectExpanses.length > 0">
      <div class="stat" v-for="m in expectExpanses.filter(m => m.dateType == 0)">
        <div class="stat-title">{{ currenciesMap.get(m.currencyId).code }}</div>
        <div class="stat-value text-error"> {{ formatDelta(m.amount, m.currencyId) }} </div>
        <div class="stat-desc">
          {{ capitalizeFirstLetter($t("tagsPage.table.management.dateTypes.perMonth")) }}

          <template v-if="m.showMax">
            <br>
            {{ $t("tagsPage.tagsSummary.maxContribution") }}: {{ tagsMap.get(m.maxTag).name.toLocaleLowerCase() }}, {{ formatDelta(m.maxAmount, m.currencyId) }}
          </template>
        </div>
      </div>

      <div class="stat" v-for="m in expectExpanses.filter(m => m.dateType == 1)">
        <div class="stat-title">{{ currenciesMap.get(m.currencyId).code }}</div>
        <div class="stat-value text-error"> {{ formatDelta(m.amount, m.currencyId) }} </div>
        <div class="stat-desc">
          {{ capitalizeFirstLetter($t("tagsPage.table.management.dateTypes.perQuartal")) }}

          <template v-if="m.showMax">
            <br>
            {{ $t("tagsPage.tagsSummary.maxContribution") }}: {{ tagsMap.get(m.maxTag).name.toLocaleLowerCase() }}, {{ formatDelta(m.maxAmount, m.currencyId) }}
          </template>
        </div>
      </div>
    </div>
    <div v-else class="w-full template-border flex items-center justify-center text-center rounded-xl min-h-24">
      <p class="font-bold opacity-50">{{ $t("tagsPage.tagsSummary.noData.expanse") }}</p>
    </div>
  </div>
</template>

<script setup>

const { t, locale } = useI18n();
const { $transactionsTagsApi, $tagsManagementApi, $currenciesApi } = useNuxtApp();

const managements = $tagsManagementApi.getManagements();
const currenciesMap = $currenciesApi.getCurrenciesMap();

const tagsMap = $transactionsTagsApi.getTagsMap();

const expectIncome = ref([]);
const expectExpanses = ref([]);

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

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const calculate = () => {
  expectIncome.value = [];
  expectExpanses.value = [];

  managements.value.forEach((value) => {
    if (value.amount > 0) {
      const income = expectIncome.value.find((m) => m.currencyId == value.currencyId && m.dateType == value.dateType);

      if (income) {
        income.showMax = true;
        income.amount += value.amount;

        if (value.amount > income.maxAmount) {
          income.maxAmount = value.amount;
          income.maxTag = value.tagId;
        }
      }else {
        expectIncome.value.push({
          maxTag: value.tagId,
          maxAmount: value.amount,
          showMax: false,

          amount: value.amount,
          currencyId: value.currencyId,
          dateType: value.dateType,
        });
      }
    }else {
      const expanse = expectExpanses.value.find((m) => m.currencyId == value.currencyId && m.dateType == value.dateType);

      if (expanse) {
        expanse.showMax = true;
        expanse.amount += value.amount;

        if (value.amount < expanse.maxAmount) {
          expanse.maxAmount = value.amount;
          expanse.maxTag = value.tagId;
        }

      }else {
        expectExpanses.value.push({
          maxTag: value.tagId,
          maxAmount: value.amount,
          showMax: false,

          amount: value.amount,
          currencyId: value.currencyId,
          dateType: value.dateType,
        });
      }
    }
  })
}

watch(managements, () => {
  calculate();
}, {deep: true})

calculate();

</script>

<style scoped>

</style>