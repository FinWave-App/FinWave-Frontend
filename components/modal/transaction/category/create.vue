<template>
  <modal-base :title="$t('modals.newTransactionCategory.title')" :opened="opened" :name="'transaction-category-create-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionCategory.placeholders.categoryName') }}</span>
        </label>
        <input type="text"
               class="input input-bordered"
               :placeholder="$t('modals.editTransactionCategory.placeholders.categoryName')"
               v-model.trim="name"
               :maxlength="configs.maxNameLength"
               :class="{'input-error' : highlightErrors && name.length < 1}"
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionCategory.placeholders.categoryType.type') }}</span>
        </label>
        <select class="select select-bordered join-item"
                v-model="type">
          <option value="0">{{ $t('modals.newTransactionCategory.placeholders.categoryType.mixed') }}</option>
          <option value="-1">{{ $t('modals.newTransactionCategory.placeholders.categoryType.expense') }}</option>
          <option value="1">{{ $t('modals.newTransactionCategory.placeholders.categoryType.income') }}</option>
        </select>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionCategory.placeholders.categoryParent') }}</span>
        </label>

        <select-transaction-category class="w-full select-bordered"
                                v-model.number="parentCategory"
                                :can-be-without-parent="true"
                                :categories-tree="categoriesTree"
                                :class="{'input-error' : highlightErrors && parentCategory === undefined}"
        />

      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransactionCategory.placeholders.categoryDescription') }}</span>
        </label>
        <textarea class="textarea input-bordered"
                  :placeholder="$t('modals.editTransactionCategory.placeholders.categoryDescription')"
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
const parentCategory = ref(-1);

const {$serverConfigs, $transactionsCategoriesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.categories;

const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();
const categoriesMap = $transactionsCategoriesApi.getCategoriesTreeMap();

const highlightErrors = ref(false);
const allValid = computed(() => name.value.length >= 1 && parentCategory.value !== null)

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

  $transactionsCategoriesApi.newCategory(type.value, parentCategory.value, name.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s !== -1)
      $toastsManager.pushToast(t("modals.newTransactionCategory.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newTransactionCategory.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>