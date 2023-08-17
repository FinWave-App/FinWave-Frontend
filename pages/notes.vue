<template>
  <div class="page-panel">
    <div class="flex gap-2">
      <input class="input input-bordered input-sm w-full" v-model.trim.lazy="filter" :placeholder="$t('notesPage.placeholders.find')">
      <plus-button class="btn btn-sm" @event="newOpened = true" @reloadNotes="fetchNotes()"/>
    </div>

    <div v-for="[date, noteArray] in notes" class="my-4">
      <p class="text-xl font-bold">
        {{ date }}
      </p>
      <div class="flex flex-col pl-4 p-2">
        <transition-group>
          <note-full-entry v-for="note in noteArray"
                      class="note-border pb-2 pt-2"
                      :entry="note"
                      :key="note.noteId"
                      @delete="confirmDeleteNote(note)"
                      @edit="editNote(note)"
          />
        </transition-group>
      </div>
    </div>

    <modal-note-create :opened="newOpened" @close="newOpened = false"/>
    <modal-note-edit :opened="editOpened" :note="toEdit" @close="editOpened = false" @reloadNotes="fetchNotes"/>
    <modal-confirmation :opened="deleteConfirmOpened" :confirm-style="'error'" :name="'note-delete-confirm'" @confirm="deleteNote" @deny="deleteConfirmOpened = false">
      <div class="flex justify-center">
        <p class="text-lg font-bold">
          {{ $t("modals.confirmations.deleteNote") }}
        </p>
      </div>
    </modal-confirmation>
  </div>
</template>

<script setup>
import NoteEntry from "~/components/notes/noteEntry.vue";
import NoteFullEntry from "~/components/notes/noteFullEntry.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import Confirmation from "~/components/modal/confirmation.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const { $notesApi, $toastsManager} = useNuxtApp();
const {locale, t} = useI18n();

const newOpened = ref(false);
const editOpened = ref(false);
const deleteConfirmOpened = ref(false);

const toEdit = ref();
const toDelete = ref();

const allNotes = ref([]);
const filter = ref("");

const wordsIncludes = (words, text) => {
  for (const w of words) {
    if (!text.includes(w))
      return false;
  }

  return true;
}

const notes = computed(() => {
  const result = {};
  const filterWorlds = filter.value && filter.value.length > 0 ? filter.value.toLowerCase().split(" ") : null;

  allNotes.value.forEach((n) => {
    if (filterWorlds && !wordsIncludes(filterWorlds, n.text.toLowerCase()))
        return;

    const date = new Date(n.lastEdit).toLocaleString(locale.value, {year: 'numeric', month: 'long'});

    if (!result[date])
      result[date] = [];

    result[date].push(n);
  });

  return new Map(Object.entries(result));
})

const fetchNotes = async () => {
  allNotes.value = await $notesApi.getNotes();
}

const confirmDeleteNote = (note) => {
  toDelete.value = note;
  deleteConfirmOpened.value = true;
}

const deleteNote = () => {
  deleteConfirmOpened.value = false;

  $notesApi.deleteNote(toDelete.value.noteId).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.deleteNote.messages.success"), 2500, "success")
      fetchNotes();
    } else
      $toastsManager.pushToast(t("modals.deleteNote.messages.error"), 3000,"error")
  });
}

const editNote = (note) => {
  toEdit.value = note;
  editOpened.value = true;
}

fetchNotes();

</script>

<style scoped>
.note-border:not(:last-child) {
  @apply border-b border-base-200;
}
</style>