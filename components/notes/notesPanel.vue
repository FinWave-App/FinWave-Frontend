<template>
  <div class="panel">
    <div class="flex justify-between items-center w-full gap-2">
      <p class="text-xl font-bold">
        {{ $t('mainPage.notes.title') }}
      </p>

      <div class="flex gap-1">
        <plus-button class="btn btn-sm" @event="newNote = true"></plus-button>

        <nuxt-link :to="'/notes'" class="btn btn-sm">
          all notes
        </nuxt-link>
      </div>
    </div>
    <div class="mt-2">
      <transition-group>
        <note-entry v-for="note in notes"
                    class="note-border pb-2 pt-2"
                    :entry="note"
                    :key="note.noteId"
        />
      </transition-group>
    </div>

    <modal-note-create :opened="newNote" @close="newNote = false" @reloadNotes="reloadNotes()"/>
  </div>
</template>

<script setup>
import NoteEntry from "~/components/notes/noteEntry.vue";
import PlusButton from "~/components/buttons/plusButton.vue";

const { $notesApi } = useNuxtApp();
const {locale, t} = useI18n();

const notes = ref([]);

const newNote = ref(false);

const reloadNotes = async () => {
  notes.value = await $notesApi.getImportantNotes()
}

await reloadNotes();

</script>

<style scoped>
.note-border:not(:last-child) {
  @apply border-b border-base-200;
}
</style>