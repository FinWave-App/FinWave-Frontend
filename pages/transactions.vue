<template>
  <div class="page-panel transition transform ease-in-out duration-300">
    <transactions-filter-div v-model="filter" />

    <transition-group name="status">
      <div v-if="loadStatus === 0" :key="'loadScreen'">
      </div>
      <div v-else class="overflow-x-auto overflow-y-hidden mt-2" :key="'table'">
        <table class="table table-sm lg:table-md table-zebra table-pin-rows">
          <thead>
          <tr>
            <th>{{$t("transactionsPage.table.amount")}}</th>
            <th>{{$t("transactionsPage.table.tag")}}</th>
            <th>{{$t("transactionsPage.table.createdAt")}}</th>
            <th>{{$t("transactionsPage.table.account")}}</th>
            <th>{{$t("transactionsPage.table.description")}}</th>
            <th class="text-right">{{$t("transactionsPage.table.action")}}</th>
            <th class="text-base text-base-content flex justify-center items-center">
              <plus-button class="btn btn-sm btn-ghost px-1 h-full min-h-0" @event="newOpened = true"></plus-button>
            </th>
          </tr>
          </thead>
          <tbody>
          <transition-group name="transactions">
            <tr class="transition ease-in-out duration-300" v-for="transaction in transactions" :key="transaction.transactionId">
              <template v-if="!transaction.metadata">
                <th class="w-32"
                    :class="{'text-success' : transaction.delta > 0, 'text-error' : transaction.delta < 0}">
                  {{ formatDelta(transaction.delta, transaction.currencyId) }}
                </th>

                <td class="w-48">{{ tagsMap.get(transaction.tagId).tag.name }}</td>
                <td class="w-48">{{ new Date(transaction.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
                <td class="w-48">{{ accountsMap.get(transaction.accountId).name }}</td>
                <td>
                  {{ transaction.description }}
                </td>
              </template>
              <template v-else-if="transaction.metadata.type === 1">
                <th class="w-32">
                  <div class="flex gap-4 items-center">
                    <div class="w-fit">
                      <p class="opacity-80">
                        {{ formatDelta(transaction.delta, transaction.currencyId) }}
                      </p>

                      <p class="text-xs opacity-50">
                        {{ formatDelta(transaction.metadata.linkedTransaction.delta, transaction.metadata.linkedTransaction.currencyId) }}
                      </p>
                    </div>

                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </div>
                  </div>
                </th>

                <td class="w-48">
                  <p>
                    {{ tagsMap.get(transaction.tagId).tag.name }}
                  </p>

                  <p class="text-xs opacity-80 hover:opacity-100" v-if="transaction.tagId !== transaction.metadata.linkedTransaction.tagId">
                    {{ tagsMap.get(transaction.metadata.linkedTransaction.tagId).tag.name }}
                  </p>
                </td>
                <td class="w-48">{{ new Date(transaction.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
                <td class="w-48">
                  <p> {{ accountsMap.get(transaction.accountId).name }} </p>
                  <p class="text-xs opacity-80 hover:opacity-100"> {{ accountsMap.get(transaction.metadata.linkedTransaction.accountId).name }} </p>
                </td>
                <td>
                  {{ transaction.description }}
                </td>
              </template>
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

    </transition-group>
    <div v-if="count > countAtPage" class="flex justify-center w-full mt-4">
      <pages-navigation :max-pages="maxPages" :page="page" @change-page="changePage"/>
    </div>

    <modal-transaction-create :opened="newOpened" @close="newOpened = false" @reloadTransactions="fetchData()" />
    <modal-transaction-edit :opened="editOpened" @close="editOpened = false" @reloadTransactions="fetchData()" :tags-tree="tagsTree" :tags-map="tagsMap" :transaction="transactionToEdit"/>

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
import Datepicker from '@vuepic/vue-datepicker';
import PagesNavigation from "~/components/buttons/pagesNavigation.vue";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import TransactionsFilterDiv from "~/components/transactions/filter.vue"

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
const maxPages = computed(() => Math.ceil(count.value / countAtPage));

const filter = ref();

const countAtPage = 30;
const count = ref(0);

const transactions = ref({});
const loadStatus = ref(0);

const formatDelta = (delta, currencyId) => {
  const currency = currenciesMap.value.get(currencyId);
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency.decimals
  });
  return formatter.format(delta).replace(currency.code + " ", currency.symbol).replace(" " + currency.code, " " + currency.symbol);
}

const fetchCount = async () => {
  count.value = await $transactionsApi.getTransactionsCount(filter.value)
};

const fetchTransactions = async () => {
  transactions.value = await $transactionsApi.getTransactions(countAtPage * (page.value - 1), countAtPage, filter.value);
}

const fetchData = async () => {
  await Promise
      .all([fetchCount(), fetchTransactions()])
      .catch(console.log);
}

const changePage = async (pageNeed) => {
  if (pageNeed < 1 || pageNeed > maxPages.value || pageNeed === page.value)
    return;

  loadStatus.value = 0;
  page.value = pageNeed;

  await fetchTransactions();

  loadStatus.value = 1;
  window.scrollTo(0,0);
}

watch(filter, async () => {
  loadStatus.value = 0;
  page.value = 1;
  await fetchData();
  loadStatus.value = 1;
})

fetchData().then(() => {
  loadStatus.value = 1;
});

const confirmDelete = () => {
  deleteModal.value = false;

  $transactionsApi.deleteTransaction(transactionToDelete.value.transactionId).then((s) => {
    if (s) {
      transactionToDelete.value = undefined;
      $toastsManager.pushToast(t("modals.deleteTransaction.messages.success"), 2500, "success");
      fetchData();
      $accountsApi.reloadAccounts();
    }else {
      $toastsManager.pushToast(t("modals.deleteTransaction.messages.error"), 3000,"error");
    }
  });
}

</script>

<style scoped>

.min-w-80 {
  min-width: 20rem;
}

.min-w-48 {
  min-width: 12rem;
}

.status-move,
.status-enter-active,
.status-leave-active {
  transition: all 0.5s ease;
}
.status-enter-from,
.status-leave-to {
  opacity: 0;
}

.status-leave-active {
}

.transactions-move,
.transactions-enter-active,
.transactions-leave-active {
  transition: all 0.5s ease;
}
.transactions-enter-from,
.transactions-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.transactions-leave-active {
  position: absolute;
}
</style>