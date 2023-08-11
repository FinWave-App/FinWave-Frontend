<template>
  <div class="page-grid">
    <modal-transaction-create :opened="newTransaction" @close="newTransaction = false"/>
    <modal-transaction-tag-create :opened="newTag" @close="newTag = false"/>
    <modal-currency-create :opened="newCurrency" @close="newCurrency = false"/>

    <accounts-panel class="col-span-1 row-span-3"/>

    <div class="col-span-1 row-start-1 lg:row-auto lg:col-span-2 row-span-1 flex flex-wrap gap-2 justify-center lg:justify-start">
      <new-transaction-button @event="newTransaction = true"/>
      <new-tag-button @event="newTag = true"/>
      <new-currency-button @event="newCurrency = true"/>
    </div>

    <total-panel class="col-span-1 lg:col-span-2 row-span-2"/>
    <notes-panel class="col-span-1 lg:col-span-1 row-span-2"/>
  </div>
</template>

<script setup>

import TotalByPeriod from "~/components/analytics/totalByPeriod.vue";
import TotalPanel from "~/components/analytics/totalPanel.vue";
import NewTransactionButton from "~/components/buttons/quickActions/newTransactionButton.vue";
import NewTagButton from "~/components/buttons/quickActions/newTagButton.vue";
import NewCurrencyButton from "~/components/buttons/quickActions/newCurrencyButton.vue";

definePageMeta({
  middleware: [
      "auth"
  ]
})

const newTransaction = ref(false);
const newTag = ref(false);
const newCurrency = ref(false);

</script>

<style scoped>

</style>