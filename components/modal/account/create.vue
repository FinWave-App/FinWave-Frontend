<template>
  <modal-base :title="$t('modals.newAccount.title')" :opened="opened" :name="'account-create-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="form-control w-full">
        <select class="select select-bordered"
                v-model="currency"
                :class="{'select-error' : highlightErrors && currency === -1}"
        >
          <option disabled value="-1">{{ $t('modals.newAccount.placeholders.currencySelect') }}</option>
          <option v-for="currency in currencies" :value="currency.currencyId">{{ currency.code + " - " + currency.description + " (" + currency.symbol + ")" }}</option>
        </select>
      </div>

      <input type="text"
             class="input input-bordered"
             :placeholder="$t('modals.newAccount.placeholders.accountName')"
             v-model="name"
             :maxlength="configs.maxNameLength"
             :class="{'input-error' : highlightErrors && name.length < 1}"
      />

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.newAccount.placeholders.accountDescription')"
                v-model="description"
                :maxlength="configs.maxDescriptionLength">
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
  },

  tag: {
    required: true
  }
})

const { t } = useI18n();

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const {$serverConfigs, $accountsApi, $currenciesApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.accounts;

const name = ref("");
const description = ref("");
const currency = ref(-1);

const currencies = $currenciesApi.getCurrencies();

const highlightErrors = ref(false);
const allValid = computed(() => name.value.length >= 1 && currency.value !== -1)

const create = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $accountsApi.newAccount(name.value, currency.value, props.tag.tagId, description.value.length > 0 ? description.value : null).then((s) => {
    if (s !== -1)
      $toastsManager.pushToast(t("modals.newAccount.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newAccount.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>