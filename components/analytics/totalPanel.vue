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

const props = defineProps({
  period: {
    type: Number,
    required: true
  }
})

const currencyToShow = ref(useStorage.getOrDefault("preferred_currency", 1));

const { $currenciesApi } = useNuxtApp();

const currencies = $currenciesApi.getCurrencies();

watch(currencyToShow, () => {
  useStorage.set("preferred_currency", currencyToShow.value)
})

watch(() => props.period, () => { // refresh also currency from storage, case for demo mode init
  currencyToShow.value = useStorage.getOrDefault("preferred_currency", 1)
})

</script>


<style scoped>

</style>