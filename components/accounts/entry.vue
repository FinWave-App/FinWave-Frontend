<template>
  <div class="account-panel">

    <div class="flex gap-4 items-center">
      <div>
        <div class="w-14 h-14 min-w-max min-h-max rounded-full bg-base-200 flex justify-center items-center">
          <p class="min-w-max leading-3 font-bold text-2xl">
            {{ currency.symbol }}
          </p>
        </div>
      </div>
      <div class="w-full">
        <div class="flex justify-between gap-2">
          <p class="text-lg">
            {{account.name}}
          </p>

          <div class="flex gap-1">
            <delete-button class="btn btn-xs btn-ghost m-0 p-0.5" @event="deleteCall"/>
            <edit-button class="btn btn-xs btn-ghost m-0 p-0.5" @event="accountEditModal = true"/>
          </div>
        </div>

        <p v-if="!account.hidden" class="opacity-80 text-sm">
          {{account.description}}
        </p>

        <p class="font-bold">
          {{ formatter.format(account.amount) }}
        </p>
      </div>
    </div>

    <modal-account-edit :account="account" :opened="accountEditModal" @close="accountEditModal = false"></modal-account-edit>
  </div>
</template>

<script setup>
import HideButton from "~/components/buttons/hideButton.vue";
import EditButton from "~/components/buttons/editButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";

const props = defineProps({
  account: {}
})

const hideStatus = ref(props.account.hidden);

const accountEditModal = ref(false);

const { t, locale } = useI18n();
const { $currenciesApi } = useNuxtApp();
const currency = (await $currenciesApi.getCurrencies()).value.find(c => c.currencyId === props.account.currencyId)

const formatter = Intl.NumberFormat(locale.value, {
  style: 'currency',
  currency: currency.code
});

const deleteCall = () => {

}

const edit = () => {

}

</script>

<style scoped>
.account-panel {
  @apply p-3 px-4 bg-base-100 rounded-xl shadow;
}
</style>