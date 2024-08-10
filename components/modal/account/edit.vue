<template>
  <modal-tabbed-base-modal
      :title="$t('modals.editAccount.title')"
      :opened="opened"
      :name="'account-edit-modal'"
      :tabs="[
          $t('modals.editAccount.tabs.general'),
          $t('modals.editAccount.tabs.amount')]"
      v-model:tab="tab">

    <div v-if="tab === 0" class="w-full flex flex-col gap-2">
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
                :class="{'select-success' : folderSyncStatus === 1, 'select-warning' : folderSyncStatus === 0, 'select-error' : folderSyncStatus === -1}"
                v-model="folder"
                @change="syncFolder">
          <option disabled value="-1">{{ $t('modals.editAccount.placeholders.folderSelect') }}</option>
          <option v-for="folder in allFolders" :value="folder.folderId">{{ folder.name + (folder.description ? ` (${folder.description})` : "") }}</option>
        </select>
      </div>

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.editAccount.placeholders.accountDescription')"
                :class="{'textarea-success' : descriptionSyncStatus === 1, 'textarea-warning' : descriptionSyncStatus === 0, 'textarea-error' : descriptionSyncStatus === -1}"
                v-model.trim="description"
                @change="syncDescription"
                :maxlength="configs.maxDescriptionLength">
      </textarea>

      <div class="modal-action justify-between items-center">
        <button @click="emit('openAccumulation')" class="btn btn-sm">{{ $t('modals.editAccount.accumulation') }}</button>

        <button @click="close" class="btn btn-sm">{{ $t('modals.buttons.close') }}</button>
      </div>
    </div>

    <div v-else-if="tab === 1" class="w-full flex flex-col gap-2">
      <select-transaction-category class="w-full"
                              v-model.number="category"
                              :searchable="true"
                              :can-be-without-parent="false"
                              :categories-tree="categoriesTree"
      />

      <div class="join w-full">
        <div v-if="currency !== undefined" class="join-item flex justify-center items-center px-4 bg-base-200">
          <p class="font-bold">
            {{ currency.symbol }}
          </p>
        </div>

        <input type="number"
               class="input input-bordered join-item w-full"
               :placeholder="$t('modals.editAccount.placeholders.amount')"
               v-model="newAmount"
        >
      </div>

      <div class="modal-action">
        <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
        <button @click="applyNewAmount" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.apply') }}</button>
      </div>
    </div>
  </modal-tabbed-base-modal>
</template>

<script setup>

import Default from "~/components/modal/transaction/create/default.vue";
import Internal from "~/components/modal/transaction/create/internal.vue";
import WalletButton from "~/components/buttons/walletButton.vue";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  account: {
    required: true
  }
})

const emit = defineEmits(['close', 'openAccumulation'])
const tab = ref(0);

const { t } = useI18n();

const close = () => {
  emit('close')
}

const {$serverConfigs, $accountsApi, $transactionsApi, $transactionsCategoriesApi, $currenciesApi, $accountsFoldersApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.accounts;

const allFolders = $accountsFoldersApi.getFolders();
const currenciesMap = $currenciesApi.getCurrenciesMap();
const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();

const name = ref();
const description = ref();
const folder = ref();

const newAmount = ref(0);
const allValid = computed(() => props.account && category.value && newAmount.value !== props.account.amount)

const nameSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);
const folderSyncStatus = ref(1);

const category = ref();

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = props.account.name;
    description.value = props.account.description;
    folder.value = props.account.folderId;
    newAmount.value = props.account.amount;

    category.value = undefined;

    nextTick(() => {
      nameSyncStatus.value = 1;
      descriptionSyncStatus.value = 1;
      folderSyncStatus.value = 1;
    })
  }
})

watch(name, (selection, prevSelection) => {
  nameSyncStatus.value = 0;
})

watch(description, (selection, prevSelection) => {
  descriptionSyncStatus.value = 0;
})

watch(folder, (selection, prevSelection) => {
  folderSyncStatus.value = 0;
})

const currency = computed(() => {
  if (!props.account)
    return undefined;

  return currenciesMap.value.get(props.account.currencyId);
});

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

const syncFolder = () => {
  folderSyncStatus.value = 0;

  $accountsApi.editAccountFolder(folder.value, props.account.accountId).then((r) => {
    if (r) {
      folderSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editAccount.messages.success"), 2500, "success");
    } else {
      folderSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editAccount.messages.error"), 3000,"error")
    }
  })
}

const applyNewAmount = () => {
  if (!allValid.value)
    return

  close();

  $transactionsApi.newTransaction(category.value, props.account.accountId, new Date(), newAmount.value - props.account.amount, null).then((r) => {
    if (r !== -1) {
      props.account.amount = newAmount.value;

      $toastsManager.pushToast(t("modals.editAccount.messages.success"), 2500, "success");
    } else {
      $toastsManager.pushToast(t("modals.editAccount.messages.error"), 3000,"error")
    }
  })
}

</script>

<style scoped>

</style>