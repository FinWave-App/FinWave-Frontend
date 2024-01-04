<template>
  <div class="page-grid lg:grid-cols-4">
    <div class="lg:col-span-4 row-span-4 panel">
      <tags-by-months>
      </tags-by-months>
    </div>

    <div class="lg:col-span-2 row-span-2 panel">
      <pie class="h-full" :sign="1" :mode="'month'" :id="'pie-month-incomes'">
        <p class="font-bold">
          {{ $t("analyticsPage.pie.month.incomesTitle") }}
        </p>
      </pie>
    </div>

    <div class="lg:col-span-2 row-span-2 panel">
      <pie :sign="-1" :mode="'month'" :id="'pie-month-expenses'">
        <p class="font-bold">
          {{ $t("analyticsPage.pie.month.expensesTitle") }}
        </p>
      </pie>
    </div>

    <div class="lg:col-span-2 row-span-2 panel">
      <pie class="h-full" :sign="1" :mode="'year'" :id="'pie-year-incomes'">
        <p class="font-bold">
          {{ $t("analyticsPage.pie.year.incomesTitle") }}
        </p>
      </pie>
    </div>

    <div class="lg:col-span-2 row-span-2 panel">
      <pie class="h-full" :sign="-1" :mode="'year'" :id="'pie-year-expenses'">
        <p class="font-bold">
          {{ $t("analyticsPage.pie.year.expensesTitle") }}
        </p>
      </pie>
    </div>

    <reports-panel class="lg:col-span-4 row-span-4">
    </reports-panel>

  </div>
</template>

<script setup>
import ApexChart from "vue3-apexcharts";
import TransactionsFilterDiv from "~/components/transactions/filter.vue";
import TagsByMonths from "~/components/analytics/tagsByMonths.vue";
import Pie from "~/components/analytics/pie.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
});

const { $analyticsApi, $transactionsTagsApi, $currenciesApi, $serverConfigs } = useNuxtApp();
const { t, locale } = useI18n();

</script>


<style scoped>

</style>