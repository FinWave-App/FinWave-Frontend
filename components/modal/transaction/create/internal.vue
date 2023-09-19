<template>
  <div class="w-full flex flex-col gap-4">
    <div class="w-full flex gap-2 justify-between items-center">
      <div class="flex flex-col gap-2 w-full">
        <select-account class="w-full"
                        v-model="fromAccount"
                        :exclude-account="toAccount"
                        :class="{'input-error' : highlightErrors && fromAccount === undefined}"
        />

        <div v-if="separateAmounts" class="join w-full">
          <div class="join-item flex justify-center items-center px-4 bg-base-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
            </svg>
          </div>

          <input type="number"
                 min="0"
                 class="input input-bordered join-item w-full"
                 v-model.number="fromDelta"
                 :class="{'input-error' : highlightErrors && (fromDelta === undefined || fromDelta === 0)}"
          >

          <div v-if="fromCurrency !== undefined" class="join-item flex justify-center items-center px-4 bg-base-200">
            <p class="font-bold">
              {{ fromCurrency.symbol }}
            </p>
          </div>
        </div>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" @click="swapAccounts" class="btn btn-sm w-8 h-8 btn-ghost p-1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
      </svg>

      <div class="flex flex-col gap-2 w-full">
        <select-account class="w-full"
                        v-model="toAccount"
                        :exclude-account="fromAccount"
                        :class="{'input-error' : highlightErrors && toAccount === undefined}"
        />

        <div v-if="separateAmounts" class="join w-full">
          <div class="join-item flex justify-center items-center px-4 bg-base-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </div>

          <input type="number"
                 min="0"
                 class="input input-bordered join-item w-full"
                 v-model.number="toDelta"
                 :class="{'input-error' : highlightErrors && (toDelta === undefined || toDelta === 0)}"
          >

          <div v-if="toCurrency !== undefined" class="join-item flex justify-center items-center px-4 bg-base-200">
            <p class="font-bold">
              {{ toCurrency.symbol }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-2">
      <div v-if="!separateAmounts" class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionAmount') }}</span>
        </label>

        <div class="join w-full">
          <input type="number"
                 min="0"
                 class="input input-bordered join-item w-full"
                 v-model.number="fromDelta"
                 :class="{'input-error' : highlightErrors && fromDelta === undefined}">
          <div v-if="fromCurrency" class="join-item flex justify-center items-center px-4 bg-base-200">
            <p class="font-bold">
              {{ fromCurrency.symbol }}
            </p>
          </div>
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionTag') }}</span>
        </label>

        <select-transaction-tag class="w-full"
                                v-model.number="tag"
                                :searchable="true"
                                :can-be-without-parent="false"
                                :tags-tree="tagsTree"
                                :class="{'input-error' : highlightErrors && tag === undefined}"
        />
      </div>
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionDate') }}</span>
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
        <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionDescription') }}</span>
      </label>
      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.newTransaction.placeholders.transactionDescription')"
                v-model.trim="description"
                :maxlength="configs.maxDescriptionLength">
        </textarea>
    </div>
  </div>

  <div class="modal-action">
    <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
    <button @click="create" class="btn btn-sm btn-success">{{ $t('modals.buttons.create') }}</button>
  </div>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";

const emit = defineEmits(['close', 'reloadTransactions']);

const {$serverConfigs, $transactionsTagsApi, $transactionsApi, $currenciesApi, $accountsApi, $toastsManager} = useNuxtApp();
const { t, locale } = useI18n();

const configs = $serverConfigs.configs.transactions;

const accounts = $accountsApi.getAccounts();
const accountsMap = $accountsApi.getAccountsMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();
const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();

const tag = ref();
const fromAccount = ref();
const toAccount = ref();
const date = ref(new Date());
const fromDelta = ref();
const toDelta = ref();
const description = ref("");

const highlightErrors = ref(false);

const fromCurrency = computed(() => {
  if (fromAccount.value === undefined)
    return undefined;

  const accountObject = accountsMap.value.get(fromAccount.value);

  if (accountObject === undefined)
    return undefined;

  let currencyId = accountObject.currencyId;

  return currenciesMap.value.get(currencyId);
});

const toCurrency = computed(() => {
  if (toAccount.value === undefined)
    return undefined;

  const accountObject = accountsMap.value.get(toAccount.value);

  if (accountObject === undefined)
    return undefined;

  let currencyId = accountObject.currencyId;

  return currenciesMap.value.get(currencyId);
});

const separateAmounts = computed(() => {
  return fromCurrency.value && toCurrency.value && fromCurrency.value.currencyId !== toCurrency.value.currencyId;
});

const swapAccounts = () => {
  let a = toAccount.value;

  toAccount.value = fromAccount.value;
  fromAccount.value = a;

  if (!separateAmounts.value)
    return;

  a = toDelta.value;
  toDelta.value = fromDelta.value;
  fromDelta.value = a;
}

const close = () => {
  emit('close')
}

const create = () => {
  if (!separateAmounts.value) {
    toDelta.value = fromDelta.value;
  }

  if (fromAccount.value === undefined || toAccount.value === undefined || fromDelta.value === undefined ||
      toDelta.value === undefined || fromDelta.value === 0 || toDelta.value === 0 ||
      tag.value === undefined || !date.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $transactionsApi.newInternalTransfer(tag.value, fromAccount.value, toAccount.value, date.value, fromDelta.value * -1, toDelta.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.newTransaction.messages.success"), 2500, "success");
      emit('reloadTransactions');
      $accountsApi.reloadAccounts();
    }else {
      $toastsManager.pushToast(t("modals.newTransaction.messages.error"), 3000, "error");
    }
  });

}

</script>

<style scoped>

</style>