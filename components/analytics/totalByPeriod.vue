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

const { $analyticsApi, $transactionsTagsApi, $currenciesApi, $serverConfigs } = useNuxtApp();
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
  }
})

const tagsMap = $transactionsTagsApi.getTagsMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();

const currency = computed(() => currenciesMap.value.get(props.currencyId));
const fromDate = computed(() => new Date().setDate(new Date() - props.period))

const chartSeries = ref([]);
const chartOptions = ref({
  chart: {
    id: "total-by-period",
  },
});

const formatAmount = (delta) => {
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.value.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency.value.decimals
  });

  return formatter.format(delta).replace(currency.value.code + " ", currency.value.symbol).replace(" " + currency.value.code, " " + currency.value.symbol);
}

const buildChart = async () => {
  const newSeries = [
    {
      name: "Income",
      data: []
    },
    {
      name: "Expanse",
      data: []
    }
  ];

  const newOptions = {
    labels: [],
    colors:['#31c48d', '#f05252'],
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

  const analytics = (await $analyticsApi.getAnalyticsByDays(
      new TransactionsFilter(null, null, [currency.value.currencyId], fromDate.value, new Date(), null)
  ));

  const data = new Map();

  analytics.forEach((v, k) => {
    let income = 0;
    let expanse = 0;

    v.forEach((v) => {
      if (v.delta > 0)
        income += v.delta;
      else
        expanse += v.delta;
    });

    data.set(k, { income, expanse });
  })
  const sortedData = new Map(Array.from(data).sort(([a], [b]) => a.localeCompare(b)));

  sortedData.forEach((v, k) => {
    const date = new Date(k).toLocaleString(locale.value, {year: 'numeric', month: 'numeric', day: 'numeric'})

    newOptions.labels.push(date);
    newSeries[0].data.push(v.income);
    newSeries[1].data.push(v.expanse);
  });

  chartSeries.value = newSeries;
  chartOptions.value = newOptions;
}

watch([() => props.currencyId,() =>  props.period], () => {
  buildChart();
});

await buildChart();

</script>

<style scoped>

</style>