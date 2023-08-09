<template>
  <div class="flex flex-wrap gap-1 w-full">
    <select-transaction-tag class="flex-1 h-10 min-w-48"
                            mode="tags"
                            v-model="filterTags"
                            :searchable="true"
                            :placeholder='$t("transactionsPage.placeholders.filters.tags")'
                            :close-on-select="false"
                            :tags-tree="tagsTree"
                            :can-be-without-parent="false"
    >

    </select-transaction-tag>

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

    <Datepicker class="flex-1 min-w-48 xl:min-w-80 dp-h-10"
                v-model="filterTime"
                :max-range="calendarMaxRange"
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
const { $transactionsTagsApi } = useNuxtApp();

const tagsTree = $transactionsTagsApi.getTagsTree();

const props = defineProps({
  modelValue: {

  },

  calendarMaxRange: {
    type: Number,
    require: false
  }
})

const emit = defineEmits(['update:modelValue'])

const filterTags = ref();
const filterAccounts = ref();
const filterCurrencies = ref();
const filterTime = ref();
const filterDescription = ref();

watch([filterTags, filterAccounts, filterCurrencies, filterTime, filterDescription], () => {
  emit("update:modelValue", new TransactionsFilter(
      filterTags.value,
      filterAccounts.value,
      filterCurrencies.value,
      filterTime.value ? filterTime.value[0] : null,
      filterTime.value ? filterTime.value[1] : null,
      filterDescription.value
  ))
})

</script>


<style scoped>

</style>