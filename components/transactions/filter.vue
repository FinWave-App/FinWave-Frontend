<template>
  <div class="flex flex-wrap gap-1 w-full">
    <select-transaction-category class="flex-1 h-10 min-w-48"
                            mode="tags"
                            v-model="filterCategories"
                            :searchable="true"
                            :placeholder='$t("transactionsPage.placeholders.filters.categories")'
                            :close-on-select="false"
                            :categories-tree="categoriesTree"
                            :can-be-without-parent="false"
    >

    </select-transaction-category>

    <select-account class="flex-1 h-10 min-w-48"
                    mode="tags"
                    v-model="filterAccounts"
                    :searchable="true"
                    :placeholder='$t("transactionsPage.placeholders.filters.accounts")'
                    :close-on-select="false">
    </select-account>

    <select-currency class="flex-1 h-10 min-w-48"
                     mode="tags"
                     v-model="filterCurrencies"
                     :searchable="true"
                     :placeholder='$t("transactionsPage.placeholders.filters.currencies")'
                     :close-on-select="false">
    </select-currency>

    <Datepicker class="flex-1 min-w-64 dp-h-10"
                v-model="filterTime"
                :max-range="calendarMaxRange"
                :enable-time-picker="false"
                :placeholder='$t("transactionsPage.placeholders.filters.time")'
                :locale="locale"
                range />

    <input type="text"
           class="input input-bordered flex-1 h-10 text-sm font-bold min-w-48"
           v-model.lazy="filterDescription"
           :placeholder='$t("transactionsPage.placeholders.filters.description")'
    >
  </div>
</template>

<script setup>

import Datepicker from "@vuepic/vue-datepicker";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";

const { t, locale } = useI18n();
const { $transactionsCategoriesApi } = useNuxtApp();

const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();

const props = defineProps({
  modelValue: {
    type: Object,
    required: false,
    default: {}
  },

  calendarMaxRange: {
    type: Number,
    require: false
  }
})

const emit = defineEmits(['update:modelValue'])

const filterCategories = ref(props.modelValue.categoriesIds);
const filterAccounts = ref(props.modelValue.accountsIds);
const filterCurrencies = ref(props.modelValue.currenciesIds);
const filterTime = ref(
    props.modelValue.fromTime && props.modelValue.toTime ? [props.modelValue.fromTime, props.modelValue.toTime] : undefined
);
const filterDescription = ref(props.modelValue.description);

function adjustDates(date1, date2, maxDays) {
  let d1 = date1;
  let d2 = date2 ? date2 : null;

  d1.setHours(0, 0, 0, 0);

  if (d2)
    d2.setHours(23, 59, 59, 999);

  if (d2) {
    let timeDiff = Math.abs(d2.getTime() - d1.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays > maxDays) {
      d2 = new Date(d1.getTime() + maxDays*24*60*60*1000);
    }
  } else {
    let timeDiff = Math.abs(new Date().getTime() - d1.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays > maxDays) {
      d1 = new Date(new Date().getTime() - maxDays*24*60*60*1000);
    }
  }

  return [d1, d2];
}


watch([filterCategories, filterAccounts, filterCurrencies, filterTime, filterDescription], () => {
  const dates = filterTime.value ? adjustDates(filterTime.value[0], filterTime.value[1], props.calendarMaxRange) : null;
  emit("update:modelValue", new TransactionsFilter(
      filterCategories.value,
      filterAccounts.value,
      filterCurrencies.value,
      dates ? dates[0] : null,
      dates? dates[1] : null,
      filterDescription.value
  ))
})


</script>


<style scoped>

</style>