<template>
  <div class="flex flex-col">
    <div>
      <slot/>

      <div class="w-full border-y py-2 border-base-200 mt-2">
        <div class="flex gap-2 w-full">
          <select-currency v-model="currency" :placeholder='$t("analyticsPage.pie.selects.currency")'/>
          <Datepicker v-if="mode" class="input-bordered dp-h-12" v-model="date" :locale="locale" month-picker/>
          <Datepicker v-else class="input-bordered dp-h-12" v-model="date" :locale="locale" year-picker/>
        </div>

        <div class="text-sm breadcrumbs pl-3 mt-2 bg-base-200 rounded-xl">
          <ul>
            <li><a @click="resetView(); buildChart();">Root</a></li>
            <li v-if="view.length > 0" v-for="item in view"><a @click="cutUnder(item); buildChart();"> {{tagsMap.get(item).tag.name}} </a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center w-full flex-1 min-h-16">
      <ApexChart v-if="!noData"
                 class="w-full max-h-36 mt-4"
                 type="pie"
                 :options="chartOptions"
                 :series="chartSeries"
                 @dataPointSelection="tagSelected"
      ></ApexChart>
      <div v-else>
        <p class="text-center opacity-60 font-bold">
          {{ $t("analyticsPage.pie.noData") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import ApexChart from "vue3-apexcharts";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import Datepicker from "@vuepic/vue-datepicker";

const props = defineProps({
  sign: {
    type: Number,
    required: true
  },

  id: {
    type: String,
    required: true
  },

  mode: {
    type: String,
    required: true
  }
})

const { $transactionsTagsApi, $analyticsApi, $currenciesApi } = useNuxtApp();
const { t, locale } = useI18n();

const mode = computed(() => props.mode === "month")
const currency = ref();
const defaultDate = () => {
  return mode.value ? { month: new Date().getMonth(), year: new Date().getFullYear() } : new Date().getFullYear()
};

const date = ref(defaultDate());
const noData = ref(true);

const currenciesMap = $currenciesApi.getCurrenciesMap();
const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();
const view = ref([]);
const tags = $transactionsTagsApi.getTags();

const analytics = ref();

const pushToView = (tagId) => {
  view.value.push(tagId);
}

const cutUnder = (tagId) => {
  view.value.length = view.value.findIndex(id => id === tagId) + 1;
}

const resetView = () => {
  view.value = [];
}

const tagSelected = (event, chartContext, config) => {
  const nextTagId = chartMap.value[config.dataPointIndex];

  if (tagsMap.value.get(nextTagId).childs.length === 0)
    return;

  pushToView(nextTagId);
  setTimeout(() => {
    buildChart();
  }, 0);
}

const chartSeries = ref([]);
const chartOptions = ref({
  labels: [],
  chart: {
    id: props.id,
  }
});
const chartMap = ref({});

const getDays = () => {
  return {
    first: mode.value ? new Date(date.value.year, date.value.month, 1) : new Date(date.value, 0, 1),
    last: mode.value ? new Date(date.value.year, date.value.month + 1, 1) : new Date(date.value + 1, 0, 1)
  }
}

const reloadAnalytics = async () => {
  if (date.value === null)
    date.value = defaultDate();

  const days = getDays();

  analytics.value = (await $analyticsApi.getAnalyticsByMonths(
      new TransactionsFilter(null, null, null, days.first, days.last, null)
  ));
}

const childsSum = (allData, tagObject, currencyId, sign) => {
  let sum = 0;

  tagObject.childs.forEach(t => {
    const childDelta = allData[t.tag.tagId];
    sum += childDelta && childDelta * sign > 0 ? childDelta : 0;

    if (t.childs && t.childs.length > 0) {
      sum += childsSum(allData, t, sign);
    }
  })

  return sum;
}

const formatAmount = (delta) => {
  const currencyObject = currenciesMap.value.get(currency.value);

  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currencyObject.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currencyObject.decimals
  });

  return formatter.format(delta).replace(currencyObject.code + " ", currencyObject.symbol).replace(" " + currencyObject.code, " " + currencyObject.symbol);
}

const formatter = (value) => {
  return (props.sign > 0 ? "" : "-") + formatAmount(value);
}

const buildChart = () => {
  const sign = props.sign;
  const newSeries = [];
  const newOptions = {
    labels: [],
    chart: {
      id: props.id,
      foreColor: undefined,
      events: {
        dataPointSelection: tagSelected
      },
    },

    yaxis: {
      labels: {
        formatter: formatter
      }
    }
  };
  chartMap.value = {};

  if (analytics.value.size === 0) {
    noData.value = true;
    chartSeries.value = newSeries;
    chartOptions.value = newOptions;

    return;
  }

  const allData = {};

  analytics.value.forEach((v, k) => {
    v.forEach((mv) => {
      if (!currency.value)
        currency.value = mv.currencyId;

      if (mv.currencyId !== currency.value)
        return;

      allData[mv.tagId] = (allData[mv.tagId] ? allData[mv.tagId] : 0) + mv.delta;
    });
  });


  const needsToDisplay = (view.value.length > 0 ? tagsMap.value.get(view.value[view.value.length - 1]).childs : tagsTree.value).map((t) => t.tag.tagId);

  needsToDisplay.forEach((tagId) => {
    const tag = tagsMap.value.get(tagId);
    const tagName = tag.tag.name;
    const tagDelta = allData[tagId] ? allData[tagId] : 0 ;

    if (tag.childs.length === 0 && tagDelta * sign < 0)
      return;

    const sum = childsSum(allData, tag, currency.value, sign) + tagDelta;

    if (sum === 0)
      return;

    const tagChartIndex = newSeries.push(Math.abs(sum)) - 1;

    chartMap.value[tagChartIndex] = tagId;

    newOptions.labels.push(tagName);
  })

  noData.value = newSeries.length === 0;
  chartSeries.value = newSeries;
  chartOptions.value = newOptions;
}

reloadAnalytics().then(() => {
  buildChart();
}).then(() => {
  watch(date, async () => {
    reloadAnalytics().then(() => {
      resetView();
      buildChart();
    })
  })

  watch(currency, () => {
    resetView();
    buildChart();
  });
})

</script>


<style scoped>

</style>