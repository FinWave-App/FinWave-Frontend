<template>
  <div class="account-panel transition-all" :class="{'opacity-50 hover:opacity-100' : account.hidden}">
    <div class="flex gap-4 items-center">
      <div v-if="!account.hidden">
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

          <div  class="flex gap-1">
            <hide-button class="btn btn-xs btn-ghost m-0 p-0.5" :hide-status="account.hidden" @hide="hide" @unHide="unHide"/>
            <edit-button v-if="!account.hidden" class="btn btn-xs btn-ghost m-0 p-0.5" @event="emit('edit-modal')"/>
          </div>
        </div>

        <p v-if="!account.hidden" class="opacity-80 text-sm">
          {{account.description}}
        </p>

        <p class="font-bold">
          {{ formatAmount(account.amount) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import HideButton from "~/components/buttons/hideButton.vue";
import EditButton from "~/components/buttons/editButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";

const emit = defineEmits(['edit-modal']);

const props = defineProps({
  account: {}
})

const { t, locale } = useI18n();
const { $currenciesApi, $accountsApi, $toastsManager } = useNuxtApp();
const currency = (await $currenciesApi.getCurrencies()).value.find(c => c.currencyId === props.account.currencyId)

const formatAmount = (delta) => {
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency.decimals
  });
  return formatter.format(delta).replace(currency.code + " ", currency.symbol).replace(" " + currency.code, " " + currency.symbol);
}

const hide = () => {
  $accountsApi.hideAccount(props.account.accountId).then((s) => {
    if (s)
      $toastsManager.pushToast(t("accountEntry.messages.hided"), 2500, "success")
    else
      $toastsManager.pushToast(t("accountEntry.messages.hideFail"), 3000,"error")
  });
}

const unHide = () => {
  $accountsApi.showAccount(props.account.accountId).then((s) => {
    if (s)
      $toastsManager.pushToast(t("accountEntry.messages.showed"), 2500, "success")
    else
      $toastsManager.pushToast(t("accountEntry.messages.showFail"), 3000,"error")
  });
}

</script>

<style scoped>
.account-panel {
  @apply p-3 px-4 bg-base-100 rounded-xl shadow;
}
</style>