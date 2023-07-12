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
          <span class="label-text">{{ $t('modals.editTransactionTag.placeholders.tagExpectedAmount') }}</span>
        </label>
        <div class="join">
          <select class="select select-bordered join-item"
                  :class="{'select-success' : typeSyncStatus === 1, 'select-warning' : typeSyncStatus === 0, 'select-error' : typeSyncStatus === -1}"
                  v-model="type"
                  @change="syncType">
            <option value="0">{{ $t('modals.editTransactionTag.placeholders.tagType.mixed') }}</option>
            <option value="-1">{{ $t('modals.editTransactionTag.placeholders.tagType.expense') }}</option>
            <option value="1">{{ $t('modals.editTransactionTag.placeholders.tagType.income') }}</option>
          </select>
          <input type="number"
                 class="input input-bordered w-full join-item"
                 :class="{'input-success' : expectedAmountSyncStatus === 1, 'input-warning' : expectedAmountSyncStatus === 0, 'input-error' : expectedAmountSyncStatus === -1}"
                 :placeholder="$t('modals.editTransactionTag.placeholders.tagExpectedAmount')"
                 v-model.trim="expectedAmount"
                 @change="syncExpectedAmount"
          />
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransactionTag.placeholders.tagParent') }}</span>
        </label>
        <select class="select select-bordered w-full"
                v-if="tag !== null"
                :disabled="tagsMap[tag.tagId].childs.length > 0"
                :class="{'select-success' : parentTagSyncStatus === 1, 'select-warning' : parentTagSyncStatus === 0, 'select-error' : parentTagSyncStatus === -1}"
                v-model="parentTag"
                @change="syncParent">
          <option value="0">{{ $t('modals.editTransactionTag.tagWithoutParent') }}</option>
          <option v-for="entry in parentSelectRender.filter(e => e.item.tag.tagId !== tag.tagId)" :value="entry.item.tag.tagId">{{ ("&nbsp;&nbsp;".repeat(entry.deep)) + entry.item.tag.name }}</option>
        </select>
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
const expectedAmountSyncStatus = ref(1);
const typeSyncStatus = ref(1);
const parentTagSyncStatus = ref(1);

const parentSelectRender = ref([]);

const {$serverConfigs, $transactionsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions.tags;

const selectRender = (deep, elements, resultArray) => {
  elements.forEach((e) => {
    resultArray.push(
        {
          deep: deep,
          item: e
        }
    )

    if (e.childs.length > 0)
      selectRender(deep + 1, e.childs, resultArray);
  })
}

watch(props.tagsTree, (l, n) => {
  parentSelectRender.value = [];
  selectRender(0, props.tagsTree, parentSelectRender.value)
}, {deep: true})

selectRender(0, props.tagsTree, parentSelectRender.value)

const close = () => {
  emit('close')
}

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.tag.name;
    description.value = props.tag.description;
    expectedAmount.value = props.tag.expectedAmount;
    type.value = props.tag.type;

    const parentTagString = props.tag.parentsTree.split('.').slice(-1)[0];
    parentTag.value = parentTagString ? Number.parseInt(parentTagString) : 0;

    nextTick(() => {
      nameSyncStatus.value = 1;
      descriptionSyncStatus.value = 1;
      expectedAmountSyncStatus.value = 1;
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

watch(expectedAmount, (selection, prevSelection) => {
  expectedAmountSyncStatus.value = 0;
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

const syncExpectedAmount = () => {
  expectedAmountSyncStatus.value = 0;

  $transactionsTagsApi.editTagExpectedAmount(expectedAmount.value, props.tag.tagId).then((r) => {
    if (r) {
      expectedAmountSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editTransactionTag.messages.success"), 2500, "success");
    } else {
      expectedAmountSyncStatus.value = -1;
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