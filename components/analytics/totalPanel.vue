<template>
  <div class="panel">
    <total-by-period :id="'total-by-period'" :period="period" :currency-id="currencyToShow"></total-by-period>

    <div class="">
      <select-currency class="multiselect-xs" v-model="currencyToShow"/>
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

const currencyToShow = useStorage("preferred_currency", 1);

const { $currenciesApi } = useNuxtApp();

const currencies = $currenciesApi.getCurrencies();

</script>


<style scoped>

</style>