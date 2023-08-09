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
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionTag.placeholders.tagExpectedAmount') }}</span>
        </label>
        <div class="join">
          <select class="select select-bordered join-item"
                  v-model="type">
            <option value="0">{{ $t('modals.newTransactionTag.placeholders.tagType.mixed') }}</option>
            <option value="-1">{{ $t('modals.newTransactionTag.placeholders.tagType.expense') }}</option>
            <option value="1">{{ $t('modals.newTransactionTag.placeholders.tagType.income') }}</option>
          </select>
          <input type="number"
                 class="input input-bordered w-full join-item"
                 :placeholder="$t('modals.newTransactionTag.placeholders.tagExpectedAmount')"
                 v-model.trim="expectedAmount"
          />
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionTag.placeholders.tagParent') }}</span>
        </label>

        <select-transaction-tag class="w-full select-bordered"
                                      v-model.number="parentTag"
                                      :can-be-without-parent="true"
                                      :tags-tree="tagsTree">
        </select-transaction-tag>
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
      <button @click="close" class="btn btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-success">{{ $t('modals.buttons.create') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
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

const name = ref("");
const description = ref("");
const expectedAmount = ref(null);
const type = ref(0);
const parentTag = ref(null);

const {$serverConfigs, $transactionsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.tags;

const close = () => {
  emit('close')
}

const create = () => {
  if (name.value.length < 1 || expectedAmount.value === "") {
    return;
  }

  close();

  $transactionsTagsApi.newTag(type.value, expectedAmount.value === null ? 0 : expectedAmount.value, parentTag.value, name.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s)
      $toastsManager.pushToast(t("modals.newTransactionTag.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newTransactionTag.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>