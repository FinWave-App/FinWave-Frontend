<template>
  <modal-base :title="$t('modals.editTransactionTag.title')" :opened="opened" :name="'transaction-tag-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <input type="text"
             class="input input-bordered"
             :class="{'input-success' : nameSyncStatus === 1, 'input-warning' : nameSyncStatus === 0, 'input-error' : nameSyncStatus === -1}"
             :placeholder="$t('modals.editTransactionTag.placeholders.accountName')"
             v-model.trim="name"
             @change="syncName"
             :maxlength="configs.maxNameLength"
      />

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.editTransactionTag.placeholders.accountDescription')"
                :class="{'textarea-success' : descriptionSyncStatus === 1, 'textarea-warning' : descriptionSyncStatus === 0, 'textarea-error' : descriptionSyncStatus === -1}"
                v-model.trim="description"
                @change="syncDescription"
                :maxlength="configs.maxDescriptionLength">
      </textarea>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  tag: {
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n();

const name = ref();
const description = ref();

const nameSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);

const close = () => {
  emit('close')
}

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.tag.name;
    description.value = props.tag.description;

    nextTick(() => {
      nameSyncStatus.value = 1;
      descriptionSyncStatus.value = 1;
    })
  }
})

watch(name, (selection, prevSelection) => {
  nameSyncStatus.value = 0;
})

watch(description, (selection, prevSelection) => {
  descriptionSyncStatus.value = 0;
})

const {$serverConfigs, $transactionsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.tags;

const syncName = () => {
  if (name.value.length < 1) {
    nameSyncStatus.value = -1;

    return;
  }

  nameSyncStatus.value = 0;

  $transactionsTagsApi.editTagName(name.value, props.tag.tagId).then((r) => {
    if (r) {
      nameSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.success"), 2500, "success");
    } else {
      nameSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.error"), 3000,"error")
    }
  })
}

const syncDescription = () => {
  descriptionSyncStatus.value = 0;

  $transactionsTagsApi.editTagDescription(description.value === "" ? undefined : description.value, props.tag.tagId).then((r) => {
    if (r) {
      descriptionSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.success"), 2500, "success");
    } else {
      descriptionSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.error"), 3000,"error")
    }
  })
}

</script>

<style scoped>

</style>