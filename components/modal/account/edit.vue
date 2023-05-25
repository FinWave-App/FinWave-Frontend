<template>
  <modal-base :title="$t('modals.editAccount.title')" :opened="opened" :name="'account-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <input type="text"
             class="input input-bordered"
             :class="{'input-success' : nameSyncStatus === 1, 'input-warning' : nameSyncStatus === 0, 'input-error' : nameSyncStatus === -1}"
             :placeholder="$t('modals.editAccount.placeholders.accountName')"
             v-model.trim="name"
             @change="syncName"
             :maxlength="configs.maxNameLength"
      />

      <div class="form-control w-full">
        <select class="select select-bordered"
                :class="{'select-success' : tagSyncStatus === 1, 'select-warning' : tagSyncStatus === 0, 'select-error' : tagSyncStatus === -1}"
                v-model="tag"
                @change="syncTag">
          <option disabled value="-1">{{ $t('modals.editAccount.placeholders.tagSelect') }}</option>
          <option v-for="tag in allTags" :value="tag.tagId">{{ tag.name + (tag.description !== undefined ? ` (${tag.description})` : "") }}</option>
        </select>
      </div>

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.editAccount.placeholders.accountDescription')"
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

  account: {
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n();

const close = () => {
  emit('close')
}

const {$serverConfigs, $accountsApi, $accountsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.accounts;

const allTags = await $accountsTagsApi.getTags();

const name = ref(props.account.name);
const description = ref(props.account.description);
const tag = ref(props.account.tagId);

const nameSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);
const tagSyncStatus = ref(1);

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.account.name;
    description.value = props.account.description;
    tag.value = props.account.tagId;

    nameSyncStatus.value = 1;
    descriptionSyncStatus.value = 1;
    tagSyncStatus.value = 1;
  }
})

watch(name, (selection, prevSelection) => {
  nameSyncStatus.value = 0;
})

watch(description, (selection, prevSelection) => {
  descriptionSyncStatus.value = 0;
})

watch(tag, (selection, prevSelection) => {
  tagSyncStatus.value = 0;
})

const syncName = () => {
  if (name.value.length < 1) {
    nameSyncStatus.value = -1;

    return;
  }

  nameSyncStatus.value = 0;

  $accountsApi.editAccountName(name.value, props.account.accountId).then((r) => {
    if (r) {
      nameSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editAccount.messages.success"), 2500, "success");
    } else {
      nameSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editAccount.messages.error"), 3000,"error")
    }
  })
}

const syncDescription = () => {
  descriptionSyncStatus.value = 0;

  $accountsApi.editAccountDescription(description.value === "" ? undefined : description.value, props.account.accountId).then((r) => {
    if (r) {
      descriptionSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editAccount.messages.success"), 2500, "success");
    } else {
      descriptionSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editAccount.messages.error"), 3000,"error")
    }
  })
}

const syncTag = () => {
  tagSyncStatus.value = 0;

  $accountsApi.editAccountTag(tag.value, props.account.accountId).then((r) => {
    if (r) {
      tagSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editAccount.messages.success"), 2500, "success");
    } else {
      tagSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editAccount.messages.error"), 3000,"error")
    }
  })
}

</script>

<style scoped>

</style>