<template>
  <div class="page-grid">
    <modal-transaction-create :opened="newTransaction" @close="newTransaction = false"/>
    <modal-transaction-category-create :opened="newCategory" @close="newCategory = false"/>
    <modal-currency-create :opened="newCurrency" @close="newCurrency = false"/>
    <modal-note-create :opened="newNote" @close="newNote = false" @reloadNotes="reloadNotes()"/>

    <accounts-panel class="col-span-1 row-span-4"/>

    <div class="col-span-1 row-start-1 lg:row-auto lg:col-span-2 row-span-1 flex flex-wrap gap-2 justify-center lg:justify-start">
      <new-transaction-button @event="newTransaction = true"/>
      <new-category-button @event="newCategory = true"/>
      <new-currency-button @event="newCurrency = true"/>
      <new-note-button @event="newNote = true"/>
    </div>

    <div class="col-span-1 lg:col-span-2 grid grid-cols-1 2xl:grid-cols-7 gap-6">
      <total-panel class="col-span-1 lg:col-span-6 row-span-2" :period="summaryPeriod"/>

      <categories-analytics class="col-span-1 lg:col-span-5 2xl:col-span-1 row-span-5"
                      :hide-low-percent="true"
                      :only-expanses="true"
                      :only-root="true"
      />

      <notes-panel class="col-span-1 2xl:col-span-3 row-span-2"
                   :notes="notes"
                   @new-note="newNote = true"
      />
      <accounts-summary class="col-span-1 2xl:col-span-3 row-span-2" />
    </div>
  </div>
</template>

<script setup>

import TotalByPeriod from "~/components/analytics/totalByPeriod.vue";
import TotalPanel from "~/components/analytics/totalPanel.vue";
import NewTransactionButton from "~/components/buttons/quickActions/newTransactionButton.vue";
import NewCategoryButton from "~/components/buttons/quickActions/newCategoryButton.vue";
import NewCurrencyButton from "~/components/buttons/quickActions/newCurrencyButton.vue";
import NewNoteButton from "~/components/buttons/quickActions/newNoteButton.vue";
import {useApiLoader} from "~/composables/useApiLoader";
import {reloadNuxtApp} from "#app";
import CategoriesAnalytics from "~/components/analytics/categoriesAnalytics.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const { t, locale } = useI18n();
const { $serverConfigs, $accountsApi, $notesApi, $toastsManager } = useNuxtApp();
const configs = $serverConfigs.configs;
const haveAccounts = $accountsApi.getAccounts().value.length !== 0

const summaryPeriod = ref(31);

if (configs.users.demoMode && !haveAccounts) {
  useApiLoader.initDemo().then(() => {
    $accountsApi.reloadAccounts();
  })
  $toastsManager.pushToast(t("loginPage.demoMessage"), 5000, "warning")
}

const newTransaction = ref(false);
const newCategory = ref(false);
const newCurrency = ref(false);
const newNote = ref(false);

const notes = ref([]);

const reloadNotes = async () => {
  notes.value = await $notesApi.getImportantNotes()
}

reloadNotes();

$notesApi.registerUpdateListener(() => {
  reloadNotes();
})

</script>

<style scoped>

</style>