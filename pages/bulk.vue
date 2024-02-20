<template>
  <div class="page-grid">
    <div class="panel col-span-3 w-full">
      <div class="rounded-2xl p-2 flex justify-around min-h-max template-border">
        <button class="btn btn-ghost btn-circle text-opacity-60 w-64" @click="addNew(0)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {{ $t('bulkPage.buttons.newDefault') }}
        </button>

        <button class="btn btn-ghost btn-circle text-opacity-60 w-64" @click="addNew(1)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {{ $t('bulkPage.buttons.newInternal') }}
        </button>
      </div>

      <div class="flex gap-4 flex-col-reverse mt-4">
        <div v-for="transaction in transactions" :key="transaction._id" class="flex justify-between gap-2 items-center border rounded-xl p-2 border-base-200">
          <select-transaction-tag
              class="w-full flex-1"
              :allow-new="true"
              :can-be-without-parent="false"
              :tags-tree="tagsTree"
              v-model="transaction.tagId"
          />

          <div class="flex flex-col justify-center items-center gap-2 flex-1">
            <select-account
                class="w-full"
                v-model="transaction.accountId"
            />

            <template v-if="transaction.type === 1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>

              <select-account
                  class="w-full"
                  v-model="transaction.toAccountId"
                  :excludeAccount="transaction.accountId"
              />
            </template>
          </div>

          <div class="flex flex-col justify-center items-center gap-2 flex-1">
            <template v-if="transaction.type !== 1">
              <transaction-amount-field
                  class="w-full"
                  :currency-id="accountIdToCurrencyId(transaction.accountId)"
                  :tag-id="transaction.tagId"
                  v-model="transaction.delta"
              />
            </template>
            <template v-else>
              <transaction-amount-field
                  class="w-full"
                  :currency-id="accountIdToCurrencyId(transaction.accountId)"
                  :tag-id="transaction.tagId"
                  v-model="transaction.delta"
                  :sign-override="-1"
              />

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>

              <transaction-amount-field
                  class="w-full"
                  :currency-id="accountIdToCurrencyId(transaction.toAccountId)"
                  :tag-id="transaction.tagId"
                  v-model="transaction.toDelta"
                  :sign-override="1"
              />
            </template>
          </div>

          <Datepicker class="input-bordered dp-h-12 w-full flex-1"
                      v-model="transaction.created"
                      :teleport="true"
                      :locale="locale"
          />

          <input class="input input-bordered w-16 focus:w-64"
                 v-model.trim="transaction.description"
                 :maxlength="configs.maxDescriptionLength"
          >

          <div class="flex flex-col gap-1">
            <delete-button class="btn btn-sm btn-ghost" @click="deleteTransaction(transaction)"/>
            <duplicate-button class="btn btn-sm btn-ghost" @click="copy(transaction)" />
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-3">
      <div class="flex gap-2 w-full justify-end">
        <button @click="confirmDeleteOpened = true" class="btn btn-sm btn-error">{{ $t('bulkPage.buttons.deleteAll') }}</button>
        <button @click="apply" :disabled="false" class="btn btn-sm btn-success">{{ $t('modals.buttons.apply') }}</button>
      </div>
    </div>

    <confirmation :opened="confirmDeleteOpened"
                  name="bulk-delete-confirm"
                  :confirmStyle="'error'"
                  @deny="confirmDeleteOpened = false"
                  @confirm="deleteAll"
    >
      {{ $t("modals.confirmations.deleteAllBulk") }}
    </confirmation>
  </div>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import TransactionAmountField from "~/components/modal/transaction/transactionAmountField.vue";
import TableEntry from "~/components/transactions/table/tableEntry.vue";
import EditButton from "~/components/buttons/editButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import CopyButton from "~/components/buttons/copyButton.vue";
import DuplicateButton from "~/components/buttons/duplicateButton.vue";
import Confirmation from "~/components/modal/confirmation.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const { locale, t } = useI18n();

const {$serverConfigs, $transactionsApi, $transactionsTagsApi, $currenciesApi, $accountsApi, $toastsManager } = useNuxtApp();

const configs = $serverConfigs.configs.transactions;

const tagsMap = $transactionsTagsApi.getTagsTreeMap();
const tagsTree = $transactionsTagsApi.getTagsTree();

const currenciesMap = $currenciesApi.getCurrenciesMap();
const accountsMap = $accountsApi.getAccountsMap();

const transactions = ref(useStorage.getOrDefault("bulk_transactions", []));

const confirmDeleteOpened = ref(false);

const addNew = (type) => {
  const newTransaction = {
    _id: new Date().getMilliseconds(),
    type: type,
    tagId: null,
    accountId: null,
    created: new Date(),
    delta: 0,
    description: undefined
  };

  if (type === 1) {
    newTransaction.toAccountId = null;
    newTransaction.toDelta = null;
  }

  transactions.value.push(newTransaction)

  useStorage.set("bulk_transactions", transactions.value);
}

const copy = (transaction) => {
  transactions.value.push({... transaction})

  useStorage.set("bulk_transactions", transactions.value);
}

const deleteTransaction = (transaction) => {
  transactions.value = transactions.value.filter((t) => t !== transaction);

  useStorage.set("bulk_transactions", transactions.value);
}

const accountIdToCurrencyId = (accountId) => {
  if (accountId === undefined)
    return undefined;

  const accountObject = accountsMap.value.get(accountId);

  if (accountObject === undefined)
    return undefined;

  return accountObject.currencyId;
}

const apply = () => {
  $transactionsApi.newBulkTransaction(transactions.value).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("bulkPage.messages.success"), 2500, "success")

      transactions.value = [];
      useStorage.set("bulk_transactions", transactions.value);
    }
    else
      $toastsManager.pushToast(t("bulkPage.messages.error"), 3000,"error")
  });
}

const deleteAll = () => {
  transactions.value = [];
  useStorage.set("bulk_transactions", transactions.value);

  confirmDeleteOpened.value = false;
}

</script>

<style scoped>

.compact-row td {
  @apply px-2
}

</style>