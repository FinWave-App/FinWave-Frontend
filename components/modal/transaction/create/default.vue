<template>
  <div class="w-full flex flex-col gap-2">
    <div class="w-full flex gap-2">
      <div class="form-control w-full">
        <label class="label pt-0">
          <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionAccount') }}</span>
        </label>

        <select-account class="w-full"
                        v-model="account"
                        :class="{'input-error' : highlightErrors && account === undefined}"
        />
      </div>
      <div class="form-control w-full">
        <label class="label pt-0">
          <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionTag') }}</span>
        </label>

        <select-transaction-tag class="w-full"
                                v-model="parentTag"
                                :searchable="true"
                                :can-be-without-parent="false"
                                :allow-new="true"
                                :tags-tree="tagsTree"
                                :class="{'input-error' : highlightErrors && parentTag === undefined}"
        />
      </div>

    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionAmount') }}</span>
      </label>

      <transaction-amount-field :currency-id="currencyId" :highlight-errors="highlightErrors" :tag-id="parentTag" v-model="amount" />
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionDate') }}</span>
      </label>

      <Datepicker class="input-bordered dp-h-12"
                  v-model="date"
                  :teleport="true"
                  :locale="locale"
                  :class="{'input-error' : highlightErrors && !date}"
                  teleport-center
      />
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionDescription') }}</span>
      </label>
      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.newTransaction.placeholders.transactionDescription')"
                v-model.trim="description"
                :maxlength="configs.maxDescriptionLength">
        </textarea>
    </div>
  </div>

  <div class="modal-action flex justify-between items-center">
    <nuxt-link to="/bulk" class="btn btn-sm invisible lg:visible">
      {{ $t('modals.newTransaction.buttons.bulkMode') }}
    </nuxt-link>

    <div class="flex gap-2">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.create') }}</button>
    </div>
  </div>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import TransactionAmountField from "~/components/modal/transaction/transactionAmountField.vue";

const emit = defineEmits(['close', 'reloadTransactions']);

const {$serverConfigs, $transactionsTagsApi, $transactionsApi, $currenciesApi, $accountsApi, $toastsManager} = useNuxtApp();
const { t, locale } = useI18n();

const configs = $serverConfigs.configs.transactions;

const accounts = $accountsApi.getAccounts();
const accountsMap = $accountsApi.getAccountsMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();
const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();

const account = ref();
const amount = ref();
const description = ref("");
const parentTag = ref();

const date = ref(new Date());

const highlightErrors = ref(false);
const allValid = computed(() => account.value !== undefined && amount.value !== undefined && amount.value !== 0 && parentTag.value !== undefined && date.value)

const currencyId = computed(() => {
  if (account.value === undefined)
    return undefined;

  const accountObject = accountsMap.value.get(account.value);

  if (accountObject === undefined)
    return undefined;

  return accountObject.currencyId;
});

const close = () => {
  emit('close')
}

const create = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  const callApi = (tagId) => {
    $transactionsApi.newTransaction(tagId, account.value, date.value, amount.value, description.value.length > 0 ? description.value : null).then((s) => {
      if (s !== -1) {
        $toastsManager.pushToast(t("modals.newTransaction.messages.success"), 2500, "success");
        emit('reloadTransactions');
        $accountsApi.reloadAccounts();
      }else {
        $toastsManager.pushToast(t("modals.newTransaction.messages.error"), 3000, "error");
      }
    });
  }

  if (typeof parentTag.value === "string") {
    $transactionsTagsApi.newTag(0, -1, parentTag.value, null).then((s) => {
      if (s !== -1) {
        callApi(s);
      }else {
        $toastsManager.pushToast(t("modals.newTransaction.messages.error"), 3000, "error");
      }
    });

    return;
  }

  callApi(parentTag.value);
}

</script>

<style scoped>

</style>