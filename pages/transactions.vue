<template>
  <div class="page-panel">
    <div class="flex flex-row justify-between gap-2">
      <div></div>
      <div>
        <plus-button class="btn btn-sm btn-ghost" @event="newOpened = true"></plus-button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-sm lg:table-md table-zebra table-pin-rows">
        <thead>
        <tr>
          <th>{{$t("transactionsPage.table.amount")}}</th>
          <th>{{$t("transactionsPage.table.tag")}}</th>
          <th>{{$t("transactionsPage.table.createdAt")}}</th>
          <th>{{$t("transactionsPage.table.account")}}</th>
          <th>{{$t("transactionsPage.table.description")}}</th>
          <th class="text-right">{{$t("transactionsPage.table.action")}}</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <transition-group name="transactions">
          <tr v-for="transaction in transactions" :key="transaction.transactionId">
            <th class="w-32"
                :class="{'text-success' : transaction.delta > 0, 'text-error' : transaction.delta < 0}">

              {{ formatDelta(transaction.delta, transaction.currencyId) }}
            </th>

            <td class="w-48">{{ tagsMap.get(transaction.tagId).tag.name }}</td>
            <td class="w-48">{{ new Date(transaction.createdAt).toLocaleDateString() }}</td>
            <td class="w-48">{{ accountsMap.get(transaction.accountId).name }}</td>
            <td>
              {{ transaction.description }}
            </td>
            <td class="text-right">
              <edit-button class="btn btn-ghost btn-xs" @event="transactionToEdit = transaction; editOpened = true"></edit-button>
            </td>
            <td class="text-right w-1 p-1">
              <delete-button class="btn btn-ghost btn-xs" @event="transactionToDelete = transaction; deleteModal = true"></delete-button>
            </td>
          </tr>
        </transition-group>
        </tbody>
      </table>
    </div>

    <modal-transaction-create :opened="newOpened" @close="newOpened = false" @reloadTransactions="fetchTransactions()" :tags-tree="tagsTree" :tags-map="tagsMap"/>
    <modal-transaction-edit :opened="editOpened" @close="editOpened = false" @reloadTransactions="fetchTransactions()" :tags-tree="tagsTree" :tags-map="tagsMap" :transaction="transactionToEdit"/>

    <confirmation :opened="deleteModal" :name="'transaction-delete-confirmation-modal'" :confirm-style="'error'" @confirm="confirmDelete" @deny="deleteModal = false">
      <div class="flex justify-center">
        <p class="text-lg font-bold">
          {{ $t("modals.confirmations.deleteTransaction") }}
        </p>
      </div>
    </confirmation>
  </div>
</template>

<script setup>
import PlusButton from "~/components/buttons/plusButton.vue";
import EditButton from "~/components/buttons/editButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";
import Confirmation from "~/components/modal/confirmation.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const newOpened = ref(false);
const editOpened = ref(false);
const deleteModal = ref(false);

const transactionToEdit = ref();
const transactionToDelete = ref();

const { t, locale } = useI18n();
const { $transactionsApi, $transactionsTagsApi, $currenciesApi, $accountsApi, $toastsManager } = useNuxtApp();

const accountsMap = $accountsApi.getAccountsMap();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();
const tagsTree = $transactionsTagsApi.getTagsTree();

const currenciesMap = $currenciesApi.getCurrenciesMap();

const page = ref(1);

const filterTags = ref();
const filterAccounts = ref();
const filterCurrencies = ref();
const filterFromTime = ref();
const filterToTime = ref();
const filterDescription = ref();

const count = 30;

const transactions = ref({});

const formatDelta = (delta, currencyId) => {
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currenciesMap.value.get(currencyId).code
  });

  return formatter.format(delta);
}

const fetchTransactions = async () => {
  transactions.value = await $transactionsApi.getTransactions(count * (page.value - 1), count, {
    tagsIds: filterTags.value,
    accountsIds: filterAccounts.value,
    currenciesIds: filterCurrencies.value,
    fromTime: filterFromTime.value,
    toTime: filterToTime.value,
    description: filterDescription.value
  });
}

watch([page, filterTags, filterAccounts, filterCurrencies, filterFromTime, filterToTime, filterDescription], async () => {
  await fetchTransactions();
})

fetchTransactions();

const confirmDelete = () => {
  deleteModal.value = false;

  $transactionsApi.deleteTransaction(transactionToDelete.value.transactionId).then((s) => {
    if (s) {
      transactionToDelete.value = undefined;
      $toastsManager.pushToast(t("modals.deleteTransaction.messages.success"), 2500, "success");
      fetchTransactions();
      $accountsApi.reloadAccounts();
    }else {
      $toastsManager.pushToast(t("modals.deleteTransaction.messages.error"), 3000,"error");
    }
  });
}

</script>

<style scoped>
.transactions-move,
.transactions-enter-active,
.transactions-leave-active {
  transition: all 0.2s ease;
}
.transactions-enter-from,
.transactions-leave-to {
  opacity: 0;
}

.transactions-leave-active {
}
</style>