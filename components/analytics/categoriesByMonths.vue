<template>
  <div>
    <transactions-filter-div v-model="filter" :calendar-max-range="configs.maxTimeRangeDaysForMonths"/>

    <ApexChart class="w-full max-h-36 mt-4"
               height="500px"
               type="area"
               :options="chartOptions"
               :series="chartSeries"
    />

    <div class="flex justify-center w-full">
      <div role="tablist" class="tabs tabs-boxed w-fit">
        <a role="tab" class="tab px-6" @click="type = 'area'" :class="{ 'tab-active' : type === 'area' }"> {{ $t("analyticsPage.byMonthsSwitcher.area")}} </a>
        <a role="tab" class="tab px-6" @click="type = 'bar'" :class="{ 'tab-active' : type === 'bar' }"> {{ $t("analyticsPage.byMonthsSwitcher.bar")}} </a>
        <a role="tab" class="tab px-6" @click="type = 'radar'" :class="{ 'tab-active' : type === 'radar' }"> {{ $t("analyticsPage.byMonthsSwitcher.radar")}} </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import ApexChart from "vue3-apexcharts";
import TransactionsFilterDiv from "~/components/transactions/filter.vue";
import {useColor} from "~/composables/useColor";
import {useStorage} from "@vueuse/core";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";

const { $analyticsApi, $transactionsApi, $transactionsCategoriesApi, $currenciesApi, $serverConfigs } = useNuxtApp();
const { t, locale } = useI18n();

const categoriesMap = $transactionsCategoriesApi.getCategoriesMap();

const preferredCurrency = useStorage("preferred_currency", undefined);

const filter = ref(new TransactionsFilter(
    undefined,
    undefined,
    preferredCurrency.value ? [Number.parseInt(preferredCurrency.value)] : undefined,
    undefined,
    undefined,
    undefined
));
const chartSeries = ref([]);

const type = ref('bar');

const chartOptions = ref({});

const currenciesMap = $currenciesApi.getCurrenciesMap();
const configs = $serverConfigs.configs.analytics;

const analytics = ref({});

const fetch = async () => {
  const analyticsRaw = await $analyticsApi.getAnalyticsByMonths(filter.value);
  analytics.value = new Map(Array.from(analyticsRaw).sort(([a], [b]) => a.localeCompare(b)));
}

$transactionsApi.registerUpdateListener(fetch)

const buildChart = async () => {
  const xaxis = [];
  const series = [];
  const categories = {};
  const colors = [];

  let decimals = Number.MAX_VALUE;

  let i = 0;

  analytics.value.forEach((v, k, m) => {
    const date = new Date(k).toLocaleString(locale.value, {year: 'numeric', month: 'numeric'})

    xaxis.push(date);

    v.forEach((v) => {
      const currency = currenciesMap.value.get(v.currencyId)
      const currencySymbol = currency.symbol;
      const categoryName = categoriesMap.value.get(v.categoryId).name;

      decimals = Math.min(decimals, currency.decimals);

      let categorySeries = null;

      if (categories[v.currencyId + "-" + v.categoriesId] === undefined) {
        categorySeries = {
          name: categoryName + " (" + currencySymbol + ")",
          data: []
        }

        categories[v.currencyId + "-" + v.categoryId] = categorySeries;
        series.push(categorySeries);
        colors.push(useColor(v.categoryId));
      } else {
        categorySeries = categories[v.currencyId + "-" + v.categoryiesId];
      }

      categorySeries.data[i] = v.delta;
    })
    i++;
  })

  if (decimals === Number.MAX_VALUE)
    decimals = 2;

  series.forEach((v) => {
    for (let y = 0; y < i; y++) {
      if (!v.data[y]) {
        v.data[y] = 0;
      }
    }
  });

  chartSeries.value = series;

  chartOptions.value = {
    chart: {
      id: "categories-by-months-" + type.value,
      type: type.value,
      stacked: type.value === 'bar',
      foreColor: undefined,
      animations: {
        enabled: false
      }
    },

    plotOptions: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },

    colors: colors,

    stroke: {
      show: type.value !== 'bar',
      curve: 'smooth',
      lineCap: 'butt',
      colors: undefined,
      width: 2,
      dashArray: 0,
    },

    fill: {
      type: type.value === 'bar' ? "solid" : "gradient",
    },

    xaxis: {
      categories: xaxis,
    },
    yaxis : {
      decimalsInFloat: decimals
    }
  }
}

watch([analytics, type], () => {
  buildChart();
})

watch(filter, () => {
  fetch();
})

fetch();

</script>

<style scoped>

</style>