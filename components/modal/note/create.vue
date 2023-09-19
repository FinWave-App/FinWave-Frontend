<template>
  <modal-base :title="$t('modals.newNote.title')" :opened="opened" :name="'note-create-modal'">
    <div class="w-full flex flex-col gap-2">
      <textarea
          class="textarea input-bordered"
          :placeholder="$t('modals.newNote.placeholders.noteText')"
          v-model.trim="text"
          :maxlength="configs.maxNoteLength"
          :class="{'input-error' : highlightErrors && text.length < 1}"
      >
      </textarea>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newNote.placeholders.noteNotificationTime') }}</span>
        </label>

        <Datepicker class="input-bordered dp-h-12"
                    v-model="notificationTime"
                    :teleport="true"
                    :locale="locale"
                    teleport-center
        />
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-sm btn-success">{{ $t('modals.buttons.create') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, locale } = useI18n();

const emit = defineEmits(['close', 'reloadNotes'])

const text = ref("");
const notificationTime = ref();

const highlightErrors = ref(false);

const close = () => {
  emit('close')
}

const {$serverConfigs, $notesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.notes;

const create = () => {
  if (text.value.length < 1) {
    highlightErrors.value = true;
    return;
  }

  highlightErrors.value = false;
  close();

  $notesApi.newNote(text.value, notificationTime.value).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.newNote.messages.success"), 2500, "success")
      emit('reloadNotes');
    } else
      $toastsManager.pushToast(t("modals.newNote.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>