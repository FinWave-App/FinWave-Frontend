<template>
  <div class="page-grid">
    <modal-transaction-create :opened="newTransaction" @close="newTransaction = false"/>
    <modal-transaction-tag-create :opened="newTag" @close="newTag = false"/>
    <modal-currency-create :opened="newCurrency" @close="newCurrency = false"/>
    <modal-note-create :opened="newNote" @close="newNote = false" @reloadNotes="reloadNotes()"/>

    <accounts-panel class="col-span-1 row-span-4"/>

    <div class="col-span-1 row-start-1 lg:row-auto lg:col-span-2 row-span-1 flex flex-wrap gap-2 justify-center lg:justify-start">
      <new-transaction-button @event="newTransaction = true"/>
      <new-tag-button @event="newTag = true"/>
      <new-currency-button @event="newCurrency = true"/>
      <new-note-button @event="newNote = true"/>
    </div>

    <total-panel class="col-span-1 lg:col-span-2 row-span-2"/>
    <notes-panel class="col-span-1 lg:col-span-2 row-span-2" :notes="notes" @new-note="newNote = true"/>
  </div>
</template>

<script setup>

import TotalByPeriod from "~/components/analytics/totalByPeriod.vue";
import TotalPanel from "~/components/analytics/totalPanel.vue";
import NewTransactionButton from "~/components/buttons/quickActions/newTransactionButton.vue";
import NewTagButton from "~/components/buttons/quickActions/newTagButton.vue";
import NewCurrencyButton from "~/components/buttons/quickActions/newCurrencyButton.vue";
import NewNoteButton from "~/components/buttons/quickActions/newNoteButton.vue";

definePageMeta({
  middleware: [
      "auth"
  ]
})

const { $notesApi } = useNuxtApp();

const newTransaction = ref(false);
const newTag = ref(false);
const newCurrency = ref(false);
const newNote = ref(false);

const notes = ref([]);

const reloadNotes = async () => {
  notes.value = await $notesApi.getImportantNotes()
}

reloadNotes();

</script>

<style scoped>

</style>