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

          <div class="flex gap-1" v-if="!hideButtons">
            <hide-button class="btn btn-xs btn-ghost m-0 p-0.5" :hide-status="account.hidden" @hide="hide" @unHide="unHide"/>
            <delete-button v-if="account.hidden" class="btn btn-xs btn-ghost m-0 p-0.5" @event="deleteAccount" />
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
import WalletButton from "~/components/buttons/walletButton.vue";
import {useCurrencyFormatter} from "~/composables/useCurrencyFormatter";

const emit = defineEmits(['edit-modal', 'accumulation-modal']);

const props = defineProps({
  account: {
    required: true
  },
  hideButtons: {
    default: false,
    required: false
  }
})

const { t, locale } = useI18n();
const { $currenciesApi, $accountsApi, $toastsManager } = useNuxtApp();
const currency = $currenciesApi.getCurrencies().value.find(c => c.currencyId === props.account.currencyId)

const formatAmount = (delta) => {
  return useCurrencyFormatter(delta, currency, locale.value);
}

const deleteAccount = () => {
  $accountsApi.deleteAccount(props.account.accountId).then((r) => {
    if (r.success)
      $toastsManager.pushToast(t("accountEntry.messages.deleted"), 2500, "success")
    else {
      var messageType = "unknown";

      if (r.errorMessage) {
        if (r.errorMessage.startsWith("Some recurring")) {
          messageType = "recurring";
        }else if (r.errorMessage.startsWith("Some accumulation")) {
          messageType = "accumulation";
        }else if (r.errorMessage.startsWith("Some transactions")) {
          messageType = "transactions";
        }
      }

      $toastsManager.pushToast(t("accountEntry.messages.deleteFailCause." + messageType), 3000,"error")
    }
  })
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