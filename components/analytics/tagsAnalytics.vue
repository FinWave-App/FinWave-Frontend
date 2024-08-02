<template>
  <div v-if="data.length > 0" class="flex flex-wrap gap-2 h-min" :class="{'panel' : props.needPanelStyle}">
    <div v-for="d of data" :key="d.id" class="flex flex-col border rounded-xl p-3 pb-2 pt-1 gap-1 lg:w-full flex-1 justify-between" :class="'border-' + d.status">
      <div class="flex gap-1 items-center justify-center 2xl:flex-wrap">
        <p class="font-bold text-sm truncate">
          {{tagsMap.get(d.tagId).name}}
        </p>

        <div class="badge badge-outline badge-sm">
          {{ currenciesMap.get(d.currencyId).symbol }}
        </div>
      </div>

      <div class="text-center flex flex-col">
        <p class="font-bold text-sm text-nowrap 2xl:text-wrap">
          {{ formatAmount(Math.abs(d.delta), d.currencyId) }} / {{ formatAmount(Math.abs(d.expected), d.currencyId) }}
        </p>
        <progress class="progress w-full"
                  :class="'progress-' + d.status"
                  :value="d.percent"
                  max="1"
        />
      </div>
    </div>
  </div>
  <div v-else class="w-full template-border flex items-center justify-center text-center rounded-xl h-min p-4">
    <p class="font-bold opacity-50">{{ props.emptyMessage || $t("mainPage.tags.emptyMessage") }}</p>
  </div>
</template>

<script setup>
const { t, locale } = useI18n();

const props = defineProps({
  date: {
    type: Date,
    required: false,
    default: new Date()
  },

  onlyRoot: {
    type: Boolean,
    required: false,
    default: false
  },

  onlyExpanses: {
    type: Boolean,
    required: false,
    default: false
  },

  hideLowPercent: {
    type: Boolean,
    required: false,
    default: false
  },

  emptyMessage: {
    type: String,
    required: false
  },

  needPanelStyle: {
    type: Boolean,
    required: false,
    default: true
  }
})

const { $analyticsApi, $transactionsTagsApi, $tagsManagementApi, $currenciesApi, $serverConfigs, $transactionsApi } = useNuxtApp();

const data = ref([]);

const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();
const managementMap = $tagsManagementApi.getManagementsMap();

const formatAmount = (delta, currencyId) => {
  const currency = currenciesMap.value.get(currencyId);
  const formatter = Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency.decimals
  });
  return formatter.format(delta);
}

const fetchData = async () => {
  const fetched = await $analyticsApi.getTagAnalytics(props.date);
  const newData = [];

  for (const entry of fetched) {
    const expected = managementMap.value.get(entry.managementId).amount

    if (expected > 0 && props.onlyExpanses || props.onlyRoot && !tagsTree.value.find(t => t.tag.tagId === entry.tagId))
      continue;

    let percent = Math.max(Math.min(entry.delta / expected, 1), 0);

    if (expected > 0)
      percent = 1 - percent;

    let status = "success";

    if (percent >= 0.85) {
      status = "error"
    }else if (percent >= 0.5) {
      status = "warning"
    }

    if (props.hideLowPercent && percent < 0.1)
      continue;

    newData.push({
      id: entry.managementId,
      tagId: entry.tagId,
      currencyId: entry.currencyId,
      delta: entry.delta,
      expected: expected,
      percent: percent,
      status: status,
    });
  }

  data.value = newData.sort((a, b) => b.percent - a.percent);
}

$transactionsApi.registerUpdateListener(() => {
  fetchData();
})

watch([() => props.date, () => props.onlyRoot], () => {
  fetchData();
})

</script>

<style scoped>
.panel {
  @apply p-2;
}
</style>