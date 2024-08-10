<template>
  <div class="page-grid lg:grid-cols-4">
    <div class="lg:col-span-4 row-span-4 panel">
      <categories-by-months>
      </categories-by-months>
    </div>

    <div class="lg:col-span-4 row-span-2 panel">
      <p class="font-bold">
        {{ $t("analyticsPage.categories.title") }}
      </p>

      <div class="w-full border-y py-2 border-base-200 mt-2">
        <Datepicker class="input-bordered dp-h-12" v-model="monthPicker" :locale="locale" month-picker/>
      </div>

      <categories-analytics :date="dateForCategories" :need-panel-style="false" :empty-message="t('analyticsPage.categories.noData')"
      />
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

    <reports-panel class="lg:col-span-4 row-span-4"/>

  </div>
</template>

<script setup>
import ApexChart from "vue3-apexcharts";
import TransactionsFilterDiv from "~/components/transactions/filter.vue";
import CategoriesByMonths from "~/components/analytics/categoriesByMonths.vue";
import Pie from "~/components/analytics/pie.vue";
import CategoriesAnalytics from "~/components/analytics/categoriesAnalytics.vue";
import Datepicker from "@vuepic/vue-datepicker";

definePageMeta({
  middleware: [
    "auth"
  ]
});

const { $analyticsApi, $transactionsCategoriesApi, $currenciesApi, $serverConfigs } = useNuxtApp();
const { t, locale } = useI18n();

const today = new Date();

const dateForCategories = ref();
const monthPicker = ref();

watch(monthPicker, (value, oldValue, onCleanup) => {
  if (value)
    dateForCategories.value = new Date(value.year, value.month + 1, 1);
})

monthPicker.value = { year: today.getFullYear(), month: today.getMonth() };

</script>


<style scoped>

</style>