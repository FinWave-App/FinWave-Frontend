<template>
  <ApexChart class="w-full max-h-36"
             type="area"
             height="300px"
             :options="chartOptions"
             :series="chartSeries"
  ></ApexChart>
</template>

<script setup>

import ApexChart from "vue3-apexcharts";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import {useCurrencyFormatter} from "~/composables/useCurrencyFormatter";

const { $analyticsApi, $transactionsApi, $transactionsCategoriesApi, $currenciesApi, $serverConfigs } = useNuxtApp();
const { t, locale } = useI18n();

const props = defineProps({
  id: {
    type: String,
    required: true
  },

  currencyId: {
    type: Number,
    required: true
  },

  period: {
    type: Number,
    required: true
  },

  onlyExpanses: {
    type: Boolean,
    default: false
  }
})

const categoriesMap = $transactionsCategoriesApi.getCategoriesMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();

const currency = computed(() => currenciesMap.value.get(props.currencyId));

const analytics = ref([]);

const fromDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() - props.period)
  return d;
})

const chartSeries = ref([]);
const chartOptions = ref({
  chart: {
    id: "total-by-period",
  },
});

const formatAmount = (delta) => {
  return useCurrencyFormatter(delta, currency.value, locale.value);
}

const fetchData = async () => {
  analytics.value = await $analyticsApi.getAnalyticsByDays(
      new TransactionsFilter(null, null, [currency.value.currencyId], fromDate.value, new Date(), null)
  );
}

const buildChart = async () => {
  const newSeries = [
    {
      name: t("analyticsPage.expanse"),
      data: []
    }
  ];

  if (!props.onlyExpanses) {
    newSeries.push({
      name: t("analyticsPage.income"),
      data: []
    });
  }

  const newOptions = {
    labels: [],
    colors: ['#f05252', '#31c48d'],
    chart: {
      id: props.id,
      foreColor: undefined
    },

    yaxis: {
      labels: {
        formatter: formatAmount
      },

      decimalsInFloat: currency.value.decimals
    },
  };

  const data = new Map();

  analytics.value.forEach((v, k) => {
    let income = 0;
    let expanse = 0;

    v.forEach((v) => {
      if (v.delta > 0)
        income += v.delta;
      else
        expanse += v.delta;
    });

    if (income === 0)
      income = null;

    data.set(k, { income, expanse });
  })
  const sortedData = new Map(Array.from(data).sort(([a], [b]) => a.localeCompare(b)));

  sortedData.forEach((v, k) => {
    const date = new Date(k).toLocaleString(locale.value, {year: 'numeric', month: 'numeric', day: 'numeric'})

    newOptions.labels.push(date);
    newSeries[0].data.push(v.expanse);

    if (!props.onlyExpanses)
      newSeries[1].data.push(v.income);
  });

  chartSeries.value = newSeries;
  chartOptions.value = newOptions;
}

watch([() => props.currencyId,() => props.period], () => {
  fetchData();
});

$transactionsApi.registerUpdateListener(fetchData)

watch([analytics, () => props.onlyExpanses], () => {
  buildChart();
})

fetchData();

</script>

<style scoped>

</style>