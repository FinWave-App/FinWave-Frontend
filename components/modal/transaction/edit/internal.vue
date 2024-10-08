<template>
  <modal-tabbed-base-modal
      :title="$t('modals.editTransaction.title')"
      :opened="opened"
      :name="'internal-transaction-edit-modal'"
      :tabs="[$t('modals.editTransaction.tabs.main'), $t('modals.editTransaction.tabs.linked')]"
      v-model:tab="tab">
    <div class="w-full flex flex-col gap-2">
      <div class="w-full flex gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.editTransaction.placeholders.transactionAccount') }}</span>
          </label>

          <select-account class="w-full"
                          :searchable="true"
                          v-model="account"
                          :exclude-account="excludeAccount"
                          :class="{'input-error' : highlightErrors && account === undefined}"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.editTransaction.placeholders.transactionCategory') }}</span>
          </label>

          <select-transaction-category class="w-full"
                                  v-model="parentCategory"
                                  :searchable="true"
                                  :can-be-without-parent="false"
                                  :categories-tree="categoriesTree"
                                  :class="{'input-error' : highlightErrors && parentCategory === undefined}"
          />
        </div>

      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransaction.placeholders.transactionAmount') }}</span>
        </label>

        <div class="join w-full">
          <div class="join-item flex justify-center items-center px-4 bg-base-200">
            <svg v-if="sign > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
            </svg>
          </div>

          <input type="number"
                 class="input input-bordered join-item w-full"
                 v-model.number="amount"
                 @change="amountChanged"
                 :class="{'input-error' : highlightErrors && (amount === undefined || amount === 0)}"
          >
          <div v-if="currency !== undefined" class="join-item flex justify-center items-center px-4 bg-base-200">
            <p class="font-bold">
              {{ currency.symbol }}
            </p>
          </div>
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransaction.placeholders.transactionDate') }}</span>
        </label>

        <Datepicker class="input-bordered dp-h-12"
                    v-model="date"
                    :teleport="true"
                    :locale="locale"
                    :class="{'input-error' : highlightErrors && !date}"
                    teleport-center/>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editTransaction.placeholders.transactionDescription') }}</span>
        </label>
        <textarea class="textarea input-bordered"
                  :placeholder="$t('modals.editTransaction.placeholders.transactionDescription')"
                  v-model.trim="description"
                  :maxlength="configs.maxDescriptionLength">
        </textarea>
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="apply" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.apply') }}</button>
    </div>
  </modal-tabbed-base-modal>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";

const props = defineProps({
  opened: {
    required: true,
    type: Boolean
  },

  transaction: {
    type: Object
  }
})

const {$serverConfigs, $transactionsCategoriesApi, $transactionsApi, $currenciesApi, $accountsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.transactions;

const emit = defineEmits(['close', 'reloadTransactions']);
const { t, locale } = useI18n();

const accounts = $accountsApi.getAccounts();
const accountsMap = $accountsApi.getAccountsMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();
const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();
const categoriesMap = $transactionsCategoriesApi.getCategoriesTreeMap();

const excludeAccount = computed(() => {
  if (!props.transaction || !props.opened)
    return null;

  return tab.value === 1 ? props.transaction.accountId : (props.transaction.metadata ? props.transaction.metadata.linkedTransaction.accountId : -1);
})

const account = ref();
const amount = ref();
const description = ref("");
const parentCategory = ref(-1);
const sign = ref(1);
const date = ref(new Date());

const tab = ref(0);

const highlightErrors = ref(false);
const allValid = computed(() => account.value !== undefined && amount.value !== undefined && amount.value !== 0 && parentCategory.value !== undefined && date.value)

watch(() => props.opened, (newV, oldV) => {
  if (newV)
    tab.value = 0;
})

const transactionToEdit = computed(() => {
  if (!props.transaction || !props.opened)
    return null;

  return tab.value === 0 ? props.transaction : (props.transaction.metadata ? props.transaction.metadata.linkedTransaction : null);
});

watch(transactionToEdit, (newV, oldV) => {
  if (!newV)
    return;

  account.value = newV.accountId;
  description.value = newV.description || "";
  parentCategory.value = newV.categoryId;
  date.value = new Date(newV.createdAt);

  sign.value = Math.sign(newV.delta);
  amount.value = Math.abs(newV.delta);
});

const currency = computed(() => {
  if (account.value === undefined)
    return undefined;

  const accountObject = accountsMap.value.get(account.value);

  if (accountObject === undefined)
    return undefined;

  let currencyId = accountObject.currencyId;

  return currenciesMap.value.get(currencyId);
});

const amountChanged = () => {
  amount.value = Math.abs(amount.value);
}

const close = () => {
  emit('close')
}

const apply = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $transactionsApi.editTransaction(transactionToEdit.value.transactionId, parentCategory.value, account.value, date.value, amount.value * sign.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.editTransaction.messages.success"), 2500, "success");
      emit('reloadTransactions');
      $accountsApi.reloadAccounts();
    }else {
      $toastsManager.pushToast(t("modals.editTransaction.messages.error"), 3000,"error");
    }
  });

}
</script>

<style scoped>

</style>