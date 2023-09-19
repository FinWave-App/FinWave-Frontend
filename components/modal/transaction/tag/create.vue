<template>
  <modal-base :title="$t('modals.newTransactionTag.title')" :opened="opened" :name="'transaction-transactionTag-create-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionTag.placeholders.tagName') }}</span>
        </label>
        <input type="text"
               class="input input-bordered"
               :placeholder="$t('modals.editTransactionTag.placeholders.tagName')"
               v-model.trim="name"
               :maxlength="configs.maxNameLength"
               :class="{'input-error' : highlightErrors && name.length < 1}"
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionTag.placeholders.tagType.type') }}</span>
        </label>
        <select class="select select-bordered join-item"
                v-model="type">
          <option value="0">{{ $t('modals.newTransactionTag.placeholders.tagType.mixed') }}</option>
          <option value="-1">{{ $t('modals.newTransactionTag.placeholders.tagType.expense') }}</option>
          <option value="1">{{ $t('modals.newTransactionTag.placeholders.tagType.income') }}</option>
        </select>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionTag.placeholders.tagParent') }}</span>
        </label>

        <select-transaction-tag class="w-full select-bordered"
                                v-model.number="parentTag"
                                :can-be-without-parent="true"
                                :tags-tree="tagsTree"
                                :class="{'input-error' : highlightErrors && parentTag === undefined}"
        />

      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionTag.placeholders.tagDescription') }}</span>
        </label>
        <textarea class="textarea input-bordered"
                  :placeholder="$t('modals.editTransactionTag.placeholders.tagDescription')"
                  v-model.trim="description"
                  :maxlength="configs.maxDescriptionLength">
      </textarea>
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.create') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n();

const name = ref("");
const description = ref("");
const type = ref(0);
const parentTag = ref(-1);

const {$serverConfigs, $transactionsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.tags;

const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();

const highlightErrors = ref(false);
const allValid = computed(() => name.value.length >= 1 && parentTag.value !== null)

const close = () => {
  emit('close')
}

const create = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $transactionsTagsApi.newTag(type.value, parentTag.value, name.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s)
      $toastsManager.pushToast(t("modals.newTransactionTag.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newTransactionTag.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>