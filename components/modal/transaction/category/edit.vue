<template>
  <modal-base :title="$t('modals.editTransactionCategory.title')" :opened="opened" :name="'transaction-transactionCategory-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionCategory.placeholders.categoryName') }}</span>
        </label>
        <input type="text"
               class="input input-bordered"
               :class="{'input-success' : nameSyncStatus === 1, 'input-warning' : nameSyncStatus === 0, 'input-error' : nameSyncStatus === -1}"
               :placeholder="$t('modals.editTransactionCategory.placeholders.categoryName')"
               v-model.trim="name"
               @change="syncName"
               :maxlength="configs.maxNameLength"
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionCategory.placeholders.categoryType.type') }}</span>
        </label>
        <select class="select select-bordered join-item"
                :class="{'select-success' : typeSyncStatus === 1, 'select-warning' : typeSyncStatus === 0, 'select-error' : typeSyncStatus === -1}"
                v-model="type"
                @change="syncType">
          <option value="0">{{ $t('modals.editTransactionCategory.placeholders.categoryType.mixed') }}</option>
          <option value="-1">{{ $t('modals.editTransactionCategory.placeholders.categoryType.expense') }}</option>
          <option value="1">{{ $t('modals.editTransactionCategory.placeholders.categoryType.income') }}</option>
        </select>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionCategory.placeholders.categoryParent') }}</span>
        </label>
        <select-transaction-category class="w-full"
                                      v-if="category !== null && category !== undefined"
                                      :disabled="categoriesMap.get(category.categoryId).childs.length > 0"
                                      :class="{'success' : parentCategorySyncStatus === 1, 'warning' : parentCategorySyncStatus === 0, 'error' : parentCategorySyncStatus === -1}"
                                      :searchable="true"
                                      v-model="parentCategory"
                                      @selected="syncParent"
                                      :can-be-without-parent="true"
                                      :exclude-category-id="category.categoryId"
                                      :categories-tree="categoriesTree">
        </select-transaction-category>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionCategory.placeholders.categoryDescription') }}</span>
        </label>
        <textarea class="textarea input-bordered"
                  :placeholder="$t('modals.editTransactionCategory.placeholders.categoryDescription')"
                  :class="{'textarea-success' : descriptionSyncStatus === 1, 'textarea-warning' : descriptionSyncStatus === 0, 'textarea-error' : descriptionSyncStatus === -1}"
                  v-model.trim="description"
                  @change="syncDescription"
                  :maxlength="configs.maxDescriptionLength">
      </textarea>
      </div>
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

  category: {
    required: true
  },

  categoriesTree: {
    required: true
  },

  categoriesMap: {
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n();

const name = ref();
const description = ref();
const expectedAmount = ref();
const type = ref();
const parentCategory = ref();

const nameSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);
const typeSyncStatus = ref(1);
const parentCategorySyncStatus = ref(1);

const {$serverConfigs, $transactionsCategoriesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.categories;

const close = () => {
  emit('close')
}

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.category.name;
    description.value = props.category.description;
    type.value = props.category.type;

    const parentCategoryString = props.category.parentsTree.split('.').slice(-1)[0];
    parentCategory.value = parentCategoryString ? Number.parseInt(parentCategoryString) : -1;

    nextTick(() => {
      nameSyncStatus.value = 1;
      descriptionSyncStatus.value = 1;
      typeSyncStatus.value = 1;
      parentCategorySyncStatus.value = 1;
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

watch(parentCategory, (selection, prevSelection) => {
  parentCategorySyncStatus.value = 0;
})

const syncName = () => {
  if (name.value.length < 1) {
    nameSyncStatus.value = -1;

    return;
  }

  nameSyncStatus.value = 0;

  $transactionsCategoriesApi.editCategoryName(name.value, props.category.categoryId).then((r) => {
    if (r) {
      nameSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.success"), 2500, "success");
    } else {
      nameSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.error"), 3000,"error")
    }
  })
}

const syncDescription = () => {
  descriptionSyncStatus.value = 0;

  $transactionsCategoriesApi.editCategoryDescription(description.value === "" ? undefined : description.value, props.category.categoryId).then((r) => {
    if (r) {
      descriptionSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.success"), 2500, "success");
    } else {
      descriptionSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.error"), 3000,"error")
    }
  })
}

const syncType = () => {
  typeSyncStatus.value = 0;
  $transactionsCategoriesApi.editCategoryType(type.value, props.category.categoryId).then((r) => {
    if (r) {
      typeSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.success"), 2500, "success");
    } else {
      typeSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.error"), 3000,"error")
    }
  })
}

const syncParent = () => {
  parentCategorySyncStatus.value = 0;

  $transactionsCategoriesApi.editCategoryParent(parentCategory.value, props.category.categoryId).then((r) => {
    if (r) {
      parentCategorySyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.success"), 2500, "success");
    } else {
      parentCategorySyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editTransactionCategory.messages.error"), 3000,"error")
    }
  })
}

</script>

<style scoped>

</style>