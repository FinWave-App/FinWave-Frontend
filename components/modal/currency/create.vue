<template>
  <modal-base :title="$t('modals.newCurrency.title')" :opened="opened" :name="'currency-create-modal'">
    <div class="w-full flex flex-col gap-2">

      <div class="flex gap-2 w-full">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.newCurrency.placeholders.currencyCode') }}</span>
          </label>

          <input type="text"
                 class="input input-bordered w-full"
                 :placeholder="$t('modals.newCurrency.placeholders.currencyCode')"
                 v-model.trim="code"
                 :maxlength="configs.maxCodeLength"
                 :class="{'input-error' : highlightErrors && code.length < 1}"
          />
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.newCurrency.placeholders.currencySymbol') }}</span>
          </label>

          <input type="text"
                 class="input input-bordered w-full"
                 :placeholder="$t('modals.newCurrency.placeholders.currencySymbol')"
                 v-model.trim="symbol"
                 :maxlength="configs.maxCodeLength"
                 :class="{'input-error' : highlightErrors && symbol.length < 1}"
          />
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.newCurrency.placeholders.currencyDecimals') }}</span>
          </label>

          <input type="number"
                 min="1"
                 :max="configs.maxDecimals"
                 class="input input-bordered w-full"
                 :placeholder="$t('modals.newCurrency.placeholders.currencyDecimals')"
                 v-model.number="decimals"
                 :class="{'input-error' : highlightErrors && (decimals === undefined || decimals < 1)}"
          />
        </div>
      </div>

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.newCurrency.placeholders.currencyDescription')"
                v-model.trim="description"
                :maxlength="configs.maxDescriptionLength"
                :class="{'input-error' : highlightErrors && description.length < 1}"
      >
      </textarea>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.create') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t } = useI18n();

const emit = defineEmits(['close'])

const code = ref("");
const symbol = ref("");
const decimals = ref(2);
const description = ref("");

const highlightErrors = ref(false);

const allValid = computed(() => code.value.length > 0 && symbol.value.length > 0 && decimals.value && decimals.value > 0 && description.value.length > 0)

const close = () => {
  emit('close')
}

const {$serverConfigs, $currenciesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.currencies;

const create = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $currenciesApi.newCurrency(code.value, symbol.value, decimals.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s !== -1)
      $toastsManager.pushToast(t("modals.newCurrency.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newCurrency.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>