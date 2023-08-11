<template>
  <modal-base :title="$t('modals.editNote.title')" :opened="opened" :name="'note-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.editNote.placeholders.noteText')"
                v-model.trim="text"
                :maxlength="configs.maxNoteLength"
                :class="{'input-success' : textSyncStatus === 1, 'input-warning' : textSyncStatus === 0, 'input-error' : textSyncStatus === -1}"
                @change="syncText"
      />

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editNote.placeholders.noteNotificationTime') }}</span>
        </label>

        <Datepicker class="input-bordered dp-h-12"
                    v-model="notificationTime"
                    :class="{'input-success' : notificationTimeSyncStatus === 1, 'input-warning' : notificationTimeSyncStatus === 0, 'input-error' : notificationTimeSyncStatus === -1}"
                    @update:model-value="syncNotificationTime"
                    :teleport="true" teleport-center
        />
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-ghost">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },
  note: {
    required: true
  }
})

const { t } = useI18n();
const {$serverConfigs, $notesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.notes;

const emit = defineEmits(['close', 'reloadNotes'])

const text = ref("");
const textSyncStatus = ref(1);

const notificationTime = ref();
const notificationTimeSyncStatus = ref(1);

const close = () => {
  emit('close')
}

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    text.value = props.note.text;
    notificationTime.value = props.note.notificationTime;

    nextTick(() => {
      textSyncStatus.value = 1;
      notificationTimeSyncStatus.value = 1;
    })
  }
})

watch(text, (selection, prevSelection) => {
  textSyncStatus.value = 0;
})

watch(notificationTime, (selection, prevSelection) => {
  notificationTimeSyncStatus.value = 0;
})

const syncText = () => {
  if (text.value.length < 1)
    return;

  textSyncStatus.value = 0;

  $notesApi.editNote(props.note.noteId, text.value).then((r) => {
    if (r) {
      textSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editNote.messages.success"), 2500, "success");
      emit('reloadNotes');
    } else {
      textSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editNote.messages.error"), 3000,"error")
    }
  })
}

const syncNotificationTime = () => {
  $notesApi.editNotificationTime(props.note.noteId, notificationTime.value).then((r) => {
    if (r) {
      notificationTimeSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editNote.messages.success"), 2500, "success");
      emit('reloadNotes');
    } else {
      notificationTimeSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editNote.messages.error"), 3000, "error")
    }
  })
}

</script>

<style scoped>

</style>