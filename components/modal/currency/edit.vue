<template>
  <modal-base :title="$t('modals.editCurrency.title')" :opened="opened" :name="'currency-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="flex gap-2 w-full">
        <input type="text"
               class="input input-bordered w-full"
               :class="{'input-success' : codeSyncStatus === 1, 'input-warning' : codeSyncStatus === 0, 'input-error' : codeSyncStatus === -1}"
               :placeholder="$t('modals.newCurrency.placeholders.currencyCode')"
               :maxlength="configs.maxCodeLength"
               v-model.trim="code"
               @change="syncCode"
        />

        <input type="text"
               class="input input-bordered w-full"
               :class="{'input-success' : symbolSyncStatus === 1, 'input-warning' : symbolSyncStatus === 0, 'input-error' : symbolSyncStatus === -1}"
               :placeholder="$t('modals.newCurrency.placeholders.currencySymbol')"
               :maxlength="configs.maxCodeLength"
               v-model.trim="symbol"
               @change="syncSymbol"
        />

        <input type="number"
               class="input input-bordered w-full"
               :class="{'input-success' : decimalsSyncStatus === 1, 'input-warning' : decimalsSyncStatus === 0, 'input-error' : decimalsSyncStatus === -1}"
               min="1"
               :max="configs.maxDecimals"
               :placeholder="$t('modals.newCurrency.placeholders.currencyDecimals')"
               v-model="decimals"
               @change="syncDecimals"
        />
      </div>

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.newCurrency.placeholders.currencyDescription')"
                :class="{'input-success' : descriptionSyncStatus === 1, 'input-warning' : descriptionSyncStatus === 0, 'input-error' : descriptionSyncStatus === -1}"
                :maxlength="configs.maxDescriptionLength"
                v-model.trim="description"
                @change="syncDescription"
      />
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-ghost">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  currency: {
    required: true
  }
})

const { t } = useI18n();

const emit = defineEmits(['close'])

const code = ref("");
const symbol = ref("");
const decimals = ref(2);
const description = ref("");

const codeSyncStatus = ref(1);
const symbolSyncStatus = ref(1);
const decimalsSyncStatus = ref(1);
const descriptionSyncStatus = ref(1);

const close = () => {
  emit('close')
}

const {$serverConfigs, $currenciesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.currencies;

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    code.value = props.currency.code;
    symbol.value = props.currency.symbol;
    decimals.value = props.currency.decimals;
    description.value = props.currency.description;

    nextTick(() => {
      codeSyncStatus.value = 1;
      symbolSyncStatus.value = 1;
      decimalsSyncStatus.value = 1;
      descriptionSyncStatus.value = 1;
    })
  }
})

watch(code, (selection, prevSelection) => {
  codeSyncStatus.value = 0;
})

watch(symbol, (selection, prevSelection) => {
  symbolSyncStatus.value = 0;
})

watch(decimals, (selection, prevSelection) => {
  decimalsSyncStatus.value = 0;
})

watch(description, (selection, prevSelection) => {
  descriptionSyncStatus.value = 0;
})

const syncCode = () => {
  codeSyncStatus.value = 0;

  $currenciesApi.editCurrencyCode(code.value, props.currency.currencyId).then((r) => {
    if (r) {
      codeSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.success"), 2500, "success");
    } else {
      codeSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.error"), 3000,"error")
    }
  })
}

const syncSymbol = () => {
  symbolSyncStatus.value = 0;

  $currenciesApi.editCurrencySymbol(symbol.value, props.currency.currencyId).then((r) => {
    if (r) {
      symbolSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.success"), 2500, "success");
    } else {
      symbolSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.error"), 3000,"error")
    }
  })
}

const syncDecimals = () => {
  decimalsSyncStatus.value = 0;

  $currenciesApi.editCurrencyDecimals(decimals.value, props.currency.currencyId).then((r) => {
    if (r) {
      decimalsSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.success"), 2500, "success");
    } else {
      decimalsSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.error"), 3000,"error")
    }
  })
}

const syncDescription = () => {
  descriptionSyncStatus.value = 0;

  $currenciesApi.editCurrencyDescription(description.value === "" ? undefined : description.value, props.currency.currencyId).then((r) => {
    if (r) {
      descriptionSyncStatus.value = 1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.success"), 2500, "success");
    } else {
      descriptionSyncStatus.value = -1;
      $toastsManager.pushToast(t("modals.editCurrency.messages.error"), 3000,"error")
    }
  })
}

</script>


<style scoped>

</style>