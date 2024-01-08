<template>
  <div>
    <transactions-filter-div v-model="filter" :calendar-max-range="configs.maxTimeRangeDaysForMonths"/>

    <ApexChart class="w-full max-h-36 mt-4"
               height="500px"
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

const { $analyticsApi, $transactionsTagsApi, $currenciesApi, $serverConfigs } = useNuxtApp();
const { t, locale } = useI18n();

const tagsMap = $transactionsTagsApi.getTagsMap();

const filter = ref();
const chartSeries = ref([]);

const type = ref('area');

const chartOptions = ref({});

const currenciesMap = $currenciesApi.getCurrenciesMap();
const configs = $serverConfigs.configs.analytics;

const analytics = ref({});

const fetch = async () => {
  const analyticsRaw = await $analyticsApi.getAnalyticsByMonths(filter.value);
  analytics.value = new Map(Array.from(analyticsRaw).sort(([a], [b]) => a.localeCompare(b)));
}

const buildChart = () => {
  const xaxis = [];
  const series = [];
  const tags = {};
  const colors = [];

  let decimals = Number.MAX_VALUE;

  chartSeries.value = series;
  let i = 0;

  analytics.value.forEach((v, k, m) => {
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
        colors.push(useColor(v.tagId));
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
    chart: {
      id: "tags-by-months-" + type.value,
      type: type.value,
      stacked: type.value === 'bar',
      foreColor: undefined
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

  series.forEach((v) => {
    for (let y = 0; y < i; y++) {
      if (!v.data[y]) {
        v.data[y] = 0;
      }
    }
  });
}

watch([analytics, type], () => {
  buildChart();
})

watch(filter, () => {
  fetch();
})

fetch().then(() => {
  buildChart();
})

</script>

<style scoped>

</style>