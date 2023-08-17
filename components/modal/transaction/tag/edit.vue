<template>
  <modal-base :title="$t('modals.editTransactionTag.title')" :opened="opened" :name="'transaction-transactionTag-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionTag.placeholders.tagName') }}</span>
        </label>
        <input type="text"
               class="input input-bordered"
               :class="{'input-success' : nameSyncStatus === 1, 'input-warning' : nameSyncStatus === 0, 'input-error' : nameSyncStatus === -1}"
               :placeholder="$t('modals.editTransactionTag.placeholders.tagName')"
               v-model.trim="name"
               @change="syncName"
               :maxlength="configs.maxNameLength"
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionTag.placeholders.tagType.type') }}</span>
        </label>
        <select class="select select-bordered join-item"
                :class="{'select-success' : typeSyncStatus === 1, 'select-warning' : typeSyncStatus === 0, 'select-error' : typeSyncStatus === -1}"
                v-model="type"
                @change="syncType">
          <option value="0">{{ $t('modals.editTransactionTag.placeholders.tagType.mixed') }}</option>
          <option value="-1">{{ $t('modals.editTransactionTag.placeholders.tagType.expense') }}</option>
          <option value="1">{{ $t('modals.editTransactionTag.placeholders.tagType.income') }}</option>
        </select>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionTag.placeholders.tagParent') }}</span>
        </label>
        <select-transaction-tag class="w-full"
                                      v-if="tag !== null && tag !== undefined"
                                      :disabled="tagsMap.get(tag.tagId).childs.length > 0"
                                      :class="{'success' : parentTagSyncStatus === 1, 'warning' : parentTagSyncStatus === 0, 'error' : parentTagSyncStatus === -1}"
                                      :searchable="true"
                                      v-model="parentTag"
                                      @selected="syncParent"
                                      :can-be-without-parent="true"
                                      :exclude-tag-id="tag.tagId"
                                      :tags-tree="tagsTree">
        </select-transaction-tag>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionTag.placeholders.tagDescription') }}</span>
        </label>
        <textarea class="textarea input-bordered"
                  :placeholder="$t('modals.editTransactionTag.placeholders.tagDescription')"
                  :class="{'textarea-success' : descriptionSyncStatus === 1, 'textarea-warning' : descriptionSyncStatus === 0, 'textarea-error' : descriptionSyncStatus === -1}"
                  v-model.trim="description"
                  @change="syncDescription"
                  :maxlength="configs.maxDescriptionLength">
      </textarea>
      </div>
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
  },

  tagsTree: {
    required: true
  },

  tagsMap: {
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n();

const name = ref();
const description = ref();
const expectedAmount = ref();
const type = ref();
const parentTag = ref();

const nameSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);
const typeSyncStatus = ref(1);
const parentTagSyncStatus = ref(1);

const {$serverConfigs, $transactionsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.tags;

const close = () => {
  emit('close')
}

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.tag.name;
    description.value = props.tag.description;
    type.value = props.tag.type;

    const parentTagString = props.tag.parentsTree.split('.').slice(-1)[0];
    parentTag.value = parentTagString ? Number.parseInt(parentTagString) : -1;

    nextTick(() => {
      nameSyncStatus.value = 1;
      descriptionSyncStatus.value = 1;
      typeSyncStatus.value = 1;
      parentTagSyncStatus.value = 1;
    })
  }
})

watch(name, (selection, prevSelection) => {
  nameSyncStatus.value = 0;
})

watch(description, (selection, prevSelection) => {
  descriptionSyncStatus.value = 0;
})

watch(type, (selection, prevSelection) => {
  typeSyncStatus.value = 0;
})

watch(parentTag, (selection, prevSelection) => {
  parentTagSyncStatus.value = 0;
})

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

const syncType = () => {
  typeSyncStatus.value = 0;
  $transactionsTagsApi.editTagType(type.value, props.tag.tagId).then((r) => {
    if (r) {
      typeSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.success"), 2500, "success");
    } else {
      typeSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.error"), 3000,"error")
    }
  })
}

const syncParent = () => {
  parentTagSyncStatus.value = 0;

  $transactionsTagsApi.editTagParent(parentTag.value, props.tag.tagId).then((r) => {
    if (r) {
      parentTagSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.success"), 2500, "success");
    } else {
      parentTagSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.error"), 3000,"error")
    }
  })
}

</script>

<style scoped>

</style>