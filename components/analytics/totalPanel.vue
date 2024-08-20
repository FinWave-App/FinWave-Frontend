<template>
  <div class="panel">
    <total-by-period :id="'total-by-period'" :period="period" :currency-id="currencyToShow" :only-expanses="onlyExpanses"></total-by-period>

    <div class="flex gap-2 w-full items-center">
      <select-currency class="multiselect-xs" v-model="currencyToShow"/>

      <label class="cursor-pointer label w-fit gap-2 border rounded-lg input-bordered px-3">
        <span class="label-text text-nowrap">{{ $t('mainPage.total.onlyExpansesCheckbox') }}</span>
        <input type="checkbox" checked="checked" v-model="onlyExpanses" class="checkbox checkbox-error" />
      </label>
    </div>
  </div>
</template>

<script setup>
import TotalByPeriod from "~/components/analytics/totalByPeriod.vue";
import {useStorage} from "@vueuse/core";

const props = defineProps({
  period: {
    type: Number,
    required: true
  }
})

const { t, locale } = useI18n();

const currencyToShow = useStorage("preferred_currency", 1);
const onlyExpanses = ref(true)
</script>


<style scoped>

</style>