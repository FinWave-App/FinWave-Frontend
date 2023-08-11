<template>
  <modal-base :title="$t('modals.newCurrency.title')" :opened="opened" :name="'currency-create-modal'">
    <div class="w-full flex flex-col gap-2">

      <div class="flex gap-2 w-full">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.newCurrency.placeholders.currencyCode') }}</span>
          </label>

          <input type="text" class="input input-bordered w-full" :placeholder="$t('modals.newCurrency.placeholders.currencyCode')" v-model.trim="code" :maxlength="configs.maxCodeLength"/>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.newCurrency.placeholders.currencySymbol') }}</span>
          </label>

          <input type="text" class="input input-bordered w-full" :placeholder="$t('modals.newCurrency.placeholders.currencySymbol')" v-model.trim="symbol" :maxlength="configs.maxCodeLength"/>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.newCurrency.placeholders.currencyDecimals') }}</span>
          </label>

          <input type="number" min="1" :max="configs.maxDecimals" class="input input-bordered w-full" :placeholder="$t('modals.newCurrency.placeholders.currencyDecimals')" v-model="decimals"/>
        </div>
      </div>

      <textarea class="textarea input-bordered" :placeholder="$t('modals.newCurrency.placeholders.currencyDescription')" v-model.trim="description" :maxlength="configs.maxDescriptionLength">
      </textarea>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-success">{{ $t('modals.buttons.create') }}</button>
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

const close = () => {
  emit('close')
}

const {$serverConfigs, $currenciesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.currencies;

const create = () => {
  if (code.value.length < 1 || symbol.value.length < 1 || decimals.value === "") {
    return;
  }

  close();

  $currenciesApi.newCurrency(code.value, symbol.value, decimals.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s)
      $toastsManager.pushToast(t("modals.newCurrency.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newCurrency.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>