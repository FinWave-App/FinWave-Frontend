<template>
  <div class="page-panel transition transform ease-in-out duration-300">
    <div class="overflow-x-auto overflow-y-hidden" :key="'table'">
      <table class="table table-sm lg:table-md table-zebra table-pin-rows">
        <thead>
        <tr>
          <th>{{$t("recurringPage.table.amount")}}</th>
          <th>{{$t("recurringPage.table.category")}}</th>
          <th>{{$t("recurringPage.table.account")}}</th>
          <th>{{$t("recurringPage.table.lastRepeat")}}</th>
          <th>{{$t("recurringPage.table.nextRepeat")}}</th>
          <th>{{$t("recurringPage.table.repeatMode")}}</th>
          <th>{{$t("recurringPage.table.notificationMode")}}</th>
          <th>{{$t("recurringPage.table.description")}}</th>
          <th class="text-right">{{$t("recurringPage.table.action")}}</th>
          <th class="text-base text-base-content flex justify-center items-center">
            <plus-button class="btn btn-sm btn-ghost px-1 h-full min-h-0" @event="newOpened = true"></plus-button>
          </th>
        </tr>
        </thead>
        <tbody>
        <transition-group name="recurringTransactions">
          <tr class="transition ease-in-out duration-300" v-for="recurring in recurringTransactions" :key="recurring.recurringTransactionId">

            <th class="w-32"
                :class="{'text-success' : recurring.delta > 0, 'text-error' : recurring.delta < 0}">
              {{ formatDelta(recurring.delta, recurring.currencyId) }}
            </th>

            <td class="w-48">{{ categoriesMap.get(recurring.categoryId).category.name }}</td>
            <td class="w-48">{{ accountsMap.get(recurring.accountId).name }}</td>
            <td class="w-48">{{ new Date(recurring.lastRepeat).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
            <td class="w-48">{{ new Date(recurring.nextRepeat).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
            <td class="w-48">{{ formatMode(recurring.repeatType, recurring.repeatArg) }}</td>
            <td class="w-48">{{ notificationModes[recurring.notificationMode] }}</td>
            <td>
              {{ recurring.description }}
            </td>

            <td class="text-right">
              <edit-button class="btn btn-ghost btn-xs" @event="recurringToEdit = recurring; editOpened = true"></edit-button>
            </td>
            <td class="text-right w-1">
              <delete-button class="btn btn-ghost btn-xs" @event="recurringToDelete = recurring; deleteModal = true"></delete-button>
            </td>
          </tr>
        </transition-group>
        </tbody>
      </table>
    </div>

    <div v-if="recurringTransactions.length === 0" class="w-full template-border flex items-center justify-center text-center rounded-xl h-min p-4 mt-2">
      <p class="font-bold opacity-50">{{ $t("recurringPage.emptyMessage") }}</p>
    </div>

    <modal-recurring-create :opened="newOpened" @close="newOpened = false" />

    <modal-recurring-edit :opened="editOpened" @close="editOpened = false" :recurring="recurringToEdit"/>

    <confirmation :opened="deleteModal" :name="'recurring-transaction-delete-confirmation-modal'" :confirm-style="'error'" @confirm="confirmDelete" @deny="deleteModal = false">
      <div class="flex justify-center">
        <p class="text-lg font-bold">
          {{ $t("modals.confirmations.deleteRecurring") }}
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

import ModalRecurringEdit from "~/components/modal/recurring/edit.vue"
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

const recurringToEdit = ref();
const recurringToDelete = ref();

const { t, locale } = useI18n();
const { $recurringTransactionsApi, $transactionsCategoriesApi, $currenciesApi, $accountsApi, $toastsManager } = useNuxtApp();

const accountsMap = $accountsApi.getAccountsMap();
const categoriesMap = $transactionsCategoriesApi.getCategoriesTreeMap();
const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();

const currenciesMap = $currenciesApi.getCurrenciesMap();
const recurringTransactions = $recurringTransactionsApi.getRecurring();

const modes = ["days", "weeks", "months"]

const notificationModes = [
  t('modals.newRecurring.notificationModes.without'),
  t('modals.newRecurring.notificationModes.silent'),
  t('modals.newRecurring.notificationModes.normal')
]

const formatMode = (mode, arg) => {
  return t('modals.newRecurring.repeatModes.' + modes[mode], arg);
}

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

const confirmDelete = () => {
  deleteModal.value = false;

  $recurringTransactionsApi.deleteRecurringTransaction(recurringToDelete.value.recurringTransactionId).then((s) => {
    if (s) {
      recurringToDelete.value = undefined;
      $toastsManager.pushToast(t("modals.deleteRecurring.messages.success"), 2500, "success");
    }else {
      $toastsManager.pushToast(t("modals.deleteRecurring.messages.error"), 3000,"error");
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