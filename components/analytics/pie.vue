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
            <li><a @click="resetView(); buildChart();">{{$t("tagsPage.root")}}</a></li>
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

    <div class="text-right w-full font-bold text-sm">
      {{ total }}
    </div>
  </div>
</template>

<script setup>
import ApexChart from "vue3-apexcharts";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import Datepicker from "@vuepic/vue-datepicker";
import {useColor} from "~/composables/useColor";

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

const { $transactionsTagsApi, $analyticsApi, $transactionsApi, $currenciesApi } = useNuxtApp();
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

const analytics = ref([]);

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

  if (nextTagId === -1 || tagsMap.value.get(nextTagId).childs.length === 0)
    return;

  pushToView(nextTagId);
  setTimeout(() => {
    buildChart();
  }, 0);
}

const chartSeries = ref([]);
const total = ref();

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
    last: mode.value ? new Date(date.value.year, date.value.month + 1, 0, 23,59,59, 999) : new Date(date.value + 1, 0, 0, 23,59,59, 999)
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

$transactionsApi.registerUpdateListener(() => {
  reloadAnalytics().then(() => {
    buildChart();
  })
})

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

const childsSum = (allData, tagObject, sign) => {
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

    colors: [],

    stroke: {
      show: false
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


  let needsToDisplay = (view.value.length > 0 ? tagsMap.value.get(view.value[view.value.length - 1]).childs : tagsTree.value).map((t) => t.tag.tagId);

  if (view.value.length > 0) {
    const parentTag = view.value[view.value.length - 1];

    needsToDisplay.push(parentTag);
  }

  let totalAmount = 0;

  needsToDisplay.forEach((tagId) => {
    const tag = tagsMap.value.get(tagId);
    const tagName = tag.tag.name;
    let tagDelta = allData[tagId] ? allData[tagId] : 0;
    const isParent = view.value[view.value.length - 1] === tagId;

    if (tagDelta * sign < 0)
      tagDelta = 0;

    const sum = tagDelta + (isParent ? 0 : childsSum(allData, tag, sign));

    if (sum === 0)
      return;

    const tagChartIndex = newSeries.push(Math.abs(sum)) - 1;

    totalAmount += Math.abs(sum);

    chartMap.value[tagChartIndex] = isParent ? -1 : tagId;
    newOptions.labels.push(tagName);
    newOptions.colors.push(useColor(tagId));
  })

  noData.value = newSeries.length === 0;
  chartSeries.value = newSeries;
  chartOptions.value = newOptions;

  total.value = formatter(totalAmount);
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