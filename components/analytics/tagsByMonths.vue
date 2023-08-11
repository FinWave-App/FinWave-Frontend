<template>
  <div>
    <transactions-filter-div v-model="filter" :calendar-max-range="configs.maxTimeRangeDays"/>

    <ApexChart class="w-full max-h-36 mt-4"
               type="area"
               height="500px"
               :options="chartOptions"
               :series="chartSeries"
    ></ApexChart>
  </div>
</template>

<script setup>
import ApexChart from "vue3-apexcharts";
import TransactionsFilterDiv from "~/components/transactions/filter.vue";

const { $analyticsApi, $transactionsTagsApi, $currenciesApi, $serverConfigs } = useNuxtApp();
const { t, locale } = useI18n();

const tagsMap = $transactionsTagsApi.getTagsMap();

const filter = ref();
const chartSeries = ref([]);

const chartOptions = ref({
  chart: {
    id: "tags-by-months",
    foreColor: undefined
  },

  xaxis: {
    categories: [],
  },
  yaxis : {
    decimalsInFloat: 2
  }
});

const currenciesMap = $currenciesApi.getCurrenciesMap();
const configs = $serverConfigs.configs.analytics;

const buildChart = async () => {
  const analytics = (await $analyticsApi.getAnalyticsByMonths(filter.value));
  const sortedAnalytics = new Map(Array.from(analytics).sort(([a], [b]) => a.localeCompare(b)));

  const xaxis = [];
  const series = [];
  const tags = {};
  let decimals = Number.MAX_VALUE;

  chartOptions.value.xaxis.categories = xaxis;
  chartSeries.value = series;
  let i = 0;

  sortedAnalytics.forEach((v, k, m) => {
    const date = new Date(k).toLocaleString(locale.value, {year: 'numeric', month: 'numeric'})

    xaxis.push(date);

    v.forEach((v) => {
      const currency = currenciesMap.value.get(v.currencyId)
      const currencySymbol = currency.symbol;
      const tagName = tagsMap.value.get(v.tagId).name;

      decimals = Math.min(decimals, currency.decimals);

      let tagSeries = null;

      if (tags[v.currencyId + "-" + v.tagId] === undefined) {
        tagSeries = {
          name: tagName + " (" + currencySymbol + ")",
          data: []
        }

        tags[v.currencyId + "-" + v.tagId] = tagSeries;
        series.push(tagSeries);
      } else {
        tagSeries = tags[v.currencyId + "-" + v.tagId];
      }

      tagSeries.data[i] = v.delta;
    })
    i++;
  })

  if (decimals === Number.MAX_VALUE)
    decimals = 2;

  chartOptions.value = {
    ... chartOptions.value,
    ... {
      yaxis: {
        decimalsInFloat: decimals
      }
    }
  }

  series.forEach((v) => {
    for (let y = 0; y < i; y++) {
      if (!v.data[y]) {
        v.data[y] = 0;
      }
    }
  });
}

watch(filter, () => {
  buildChart();
})

buildChart();

</script>

<style scoped>

</style>