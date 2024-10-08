<template>
  <modal-base :title="$t('modals.editTransaction.title')" :opened="opened" :name="'transaction-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="w-full flex gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.editTransaction.placeholders.transactionAccount') }}</span>
          </label>

          <select-account class="w-full"
                          :searchable="true"
                          v-model="account"
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
          <div v-if="!signChoice" class="join-item flex justify-center items-center px-4 bg-base-200">
            <svg v-if="sign > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
            </svg>
          </div>
          <select v-else class="select select-bordered join-item" v-model.number="sign">
            <option :value="-1"> - </option>
            <option :value="1"> + </option>
          </select>

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
                    teleport-center
        />
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
  </modal-base>
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

const account = ref();
const amount = ref();
const description = ref("");
const parentCategory = ref(-1);
const sign = ref(1);
const signChoice = ref(true);
const date = ref(new Date());

const highlightErrors = ref(false);
const allValid = computed(() => account.value !== undefined && amount.value !== undefined && amount.value !== 0 && parentCategory.value !== undefined && date.value)

watch(() => props.transaction, (newV, oldV) => {
  if (!newV)
    return;

  account.value = newV.accountId;
  amount.value = newV.delta;
  description.value = newV.description || "";
  parentCategory.value = newV.categoryId;
  date.value = new Date(newV.createdAt);
  amountChanged();
});

watch(parentCategory, () => {
  if (parentCategory.value === undefined) {
    signChoice.value = true;
    return;
  }

  const parentCategoryObject = categoriesMap.value.get(parentCategory.value);

  if (parentCategoryObject === undefined || parentCategoryObject.category === undefined) {
    signChoice.value = true;
    return;
  }

  if (parentCategoryObject.category.type !== 0)
    sign.value = parentCategoryObject.category.type

  signChoice.value = parentCategoryObject.category.type === 0;
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
  if (signChoice.value)
    sign.value = Math.sign(amount.value);

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

  $transactionsApi.editTransaction(props.transaction.transactionId, parentCategory.value, account.value, date.value, amount.value * sign.value, description.value.length > 0 ? description.value : null).then((s) => {
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