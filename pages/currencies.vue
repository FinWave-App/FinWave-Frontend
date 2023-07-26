<template>
  <div class="page-panel">
    <div class="overflow-x-auto overflow-y-hidden">
      <table class="table table-sm lg:table-md table-zebra table-pin-rows">
        <thead>
        <tr>
          <th>{{$t("currenciesPage.table.code")}}</th>
          <th>{{$t("currenciesPage.table.symbol")}}</th>
          <th>{{$t("currenciesPage.table.decimals")}}</th>
          <th>{{$t("currenciesPage.table.description")}}</th>
          <th class="text-right">{{$t("currenciesPage.table.action")}}</th>
          <th class="text-base text-base-content flex justify-center items-center">
            <plus-button class="btn btn-sm btn-ghost px-1 h-full min-h-0"  @event="newCurrency = true"></plus-button>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr class="transition ease-in-out duration-300" v-for="currency in currencies" :key="currency.currencyId">
          <th class="w-24">
            {{ currency.code }}
          </th>

          <td class="w-16">{{ currency.symbol }}</td>
          <td class="w-16">{{ currency.decimals }}</td>
          <td>
            {{ currency.description }}
          </td>
          <td class="text-right">
            <edit-button :class="{'btn-disabled' : !currency.owned, 'opacity-50' : !currency.owned}" class="btn btn-ghost btn-xs" @event="currencyToEdit = currency; editCurrency = true"></edit-button>
          </td>
          <td class="w-1"></td>
        </tr>
        </tbody>
      </table>

      <modal-currency-create :opened="newCurrency" @close="newCurrency = false"></modal-currency-create>
      <modal-currency-edit :opened="editCurrency" @close="editCurrency = false" :currency="currencyToEdit"/>

    </div>
  </div>
</template>

<script setup>
import DeleteButton from "~/components/buttons/deleteButton.vue";
import EditButton from "~/components/buttons/editButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
});

const {$serverConfigs, $currenciesApi, $toastsManager} = useNuxtApp();

const currencies = $currenciesApi.getCurrencies();

const newCurrency = ref(false);
const editCurrency = ref(false);
const currencyToEdit = ref();

</script>

<style scoped>

</style>