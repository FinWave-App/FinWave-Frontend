<template>
  <modal-base :title="$t('modals.editAccountFolder.title')" :opened="opened" :name="'account-transactionFolder-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <input type="text"
             class="input input-bordered"
             :class="{'input-success' : nameSyncStatus === 1, 'input-warning' : nameSyncStatus === 0, 'input-error' : nameSyncStatus === -1}"
             :placeholder="$t('modals.editAccountFolder.placeholders.folderName')"
             v-model.trim="name"
             @change="syncName"
             :maxlength="foldersConfigs.maxNameLength"
      />

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.editAccountFolder.placeholders.folderDescription')"
                :class="{'textarea-success' : descriptionSyncStatus === 1, 'textarea-warning' : descriptionSyncStatus === 0, 'textarea-error' : descriptionSyncStatus === -1}"
                v-model.trim="description"
                @change="syncDescription"
                :maxlength="foldersConfigs.maxDescriptionLength">
      </textarea>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  folder: {
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n();

const close = () => {
  emit('close')
}

const {$serverConfigs, $accountsFoldersApi, $toastsManager} = useNuxtApp();
const foldersConfigs = $serverConfigs.configs.accounts.folders;

const name = ref(props.folder.name);
const description = ref(props.folder.description);

const nameSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.folder.name;
    description.value = props.folder.description;

    nameSyncStatus.value = 1;
    descriptionSyncStatus.value = 1;
  }
})

watch(name, (selection, prevSelection) => {
  nameSyncStatus.value = 0;
})

watch(description, (selection, prevSelection) => {
  descriptionSyncStatus.value = 0;
})

const syncName = () => {
  if (name.value.length < 1) {
    nameSyncStatus.value = -1;

    return;
  }

  nameSyncStatus.value = 0;

  $accountsFoldersApi.editFolderName(name.value, props.folder.folderId).then((r) => {
    if (r) {
      nameSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editAccountFolder.messages.success"), 2500, "success");
    } else {
      nameSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editAccountFolder.messages.error"), 3000,"error")
    }
  })
}

const syncDescription = () => {
  descriptionSyncStatus.value = 0;

  $accountsFoldersApi.editFolderDescription(description.value === "" ? undefined : description.value, props.folder.folderId).then((r) => {
    if (r) {
      descriptionSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editAccountFolder.messages.success"), 2500, "success");
    } else {
      descriptionSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editAccountFolder.messages.error"), 3000,"error")
    }
  })
}

</script>

<style scoped>

</style>