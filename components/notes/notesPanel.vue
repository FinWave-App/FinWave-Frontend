<template>
  <div class="panel flex flex-col">
    <div class="flex justify-between items-center w-full gap-2 flex-2">
      <p class="text-xl font-bold">
        {{ $t('mainPage.notes.title') }}
      </p>

      <div class="flex gap-1">
        <nuxt-link :to="'/notes'" class="btn btn-sm">
          {{ $t('mainPage.notes.allNotesButton')}}

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>

        </nuxt-link>
      </div>
    </div>
    <div class="mt-2" v-if="notes.length > 0">
      <transition-group>
        <note-entry v-for="note in notes"
                    class="note-border pb-2 pt-2"
                    :entry="note"
                    :key="note.noteId"
        />
      </transition-group>
    </div>
    <div v-else class="mt-2 card min-w-max template-border flex-1">
      <div class="card-body p-3 justify-center items-center min-h-max">

        <button class="btn btn-ghost btn-circle text-opacity-60" @click="emit('newNote')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import NoteEntry from "~/components/notes/noteEntry.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
const props = defineProps({
  notes: {}
})

const emit = defineEmits(['newNote']);

const {locale, t} = useI18n();
</script>

<style scoped>
.note-border:not(:last-child) {
  @apply border-b border-base-200;
}
</style>