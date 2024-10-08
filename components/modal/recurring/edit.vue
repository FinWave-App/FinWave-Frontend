<template>
  <modal-base :title="$t('modals.editRecurring.title')" :opened="opened" :name="'recurring-edit-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="w-full flex gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringAccount') }}</span>
          </label>

          <select-account class="w-full"
                          v-model="account"
                          :class="{'input-error' : highlightErrors && account === undefined}"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringCategory') }}</span>
          </label>

          <select-transaction-category class="w-full"
                                  v-model.number="parentCategory"
                                  :searchable="true"
                                  :can-be-without-parent="false"
                                  :categories-tree="categoriesTree"
                                  :class="{'input-error' : highlightErrors && parentCategory === undefined}"
          />
        </div>

      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringAmount') }}</span>
        </label>

        <div class="join w-full">
          <div v-if="!signChoice" class="join-item flex justify-center items-center px-4 bg-base-200">
            <svg v-if="sign > 0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
            </svg>
          </div>
          <select v-else class="select select-bordered join-item" v-model.number="sign">
            <option :value="-1"> - </option>
            <option :value="1"> + </option>
          </select>

          <input type="number"
                 class="input input-bordered join-item w-full"
                 v-model.number="amount"
                 @change="amountChanged"
                 :class="{'input-error' : highlightErrors && (amount === undefined || amount === 0)}"
          >
          <div v-if="currency !== undefined" class="join-item flex justify-center items-center px-4 bg-base-200">
            <p class="font-bold">
              {{ currency.symbol }}
            </p>
          </div>
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringRepeatMode') }}</span>
        </label>

        <div class="join">
          <div class="join-item flex justify-center items-center px-4 bg-base-200">
            <p class="font-bold">
              {{ repeatModeText(repeatFunc)[0] }}
            </p>
          </div>

          <input type="number"
                 class="input input-bordered join-item w-full"
                 min="1"
                 max="512"
                 v-model.number="repeatArg"
                 :class="{'input-error' : highlightErrors && (repeatArg === undefined)}"
          >

          <select class="select select-bordered join-item" v-model.number="repeatFunc">
            <option :value="0"> {{ repeatModeText(0)[2] }} </option>
            <option :value="1"> {{ repeatModeText(1)[2] }} </option>
            <option :value="2"> {{ repeatModeText(2)[2] }} </option>
          </select>
        </div>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringNotificationMode') }}</span>
        </label>

        <select class="select select-bordered" v-model.number="notificationMode">
          <option :value="0"> {{ $t('modals.editRecurring.notificationModes.without') }} </option>
          <option :value="1"> {{ $t('modals.editRecurring.notificationModes.silent') }} </option>
          <option :value="2"> {{ $t('modals.editRecurring.notificationModes.normal') }} </option>
        </select>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringNextRepeat') }}</span>
        </label>

        <Datepicker class="input-bordered dp-h-12"
                    v-model="nextRepeat"
                    :teleport="true"
                    :locale="locale"
                    :class="{'input-error' : highlightErrors && !nextRepeat}"
                    :min-date="new Date()"
                    teleport-center
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.editRecurring.placeholders.recurringDescription') }}</span>
        </label>
        <textarea class="textarea input-bordered"
                  :placeholder="$t('modals.newRecurring.placeholders.recurringDescription')"
                  v-model.trim="description"
                  :maxlength="configs.maxDescriptionLength">
        </textarea>
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="apply" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.apply') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  recurring: {
    type: Object
  }
})

const emit = defineEmits(['close']);

const {$serverConfigs, $transactionsCategoriesApi, $recurringTransactionsApi, $currenciesApi, $accountsApi, $toastsManager} = useNuxtApp();
const { t, locale } = useI18n();

const configs = $serverConfigs.configs.transactions;

const accounts = $accountsApi.getAccounts();
const accountsMap = $accountsApi.getAccountsMap();
const currenciesMap = $currenciesApi.getCurrenciesMap();
const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();
const categoriesMap = $transactionsCategoriesApi.getCategoriesTreeMap();

const repeatModeText = (func) => {
  const type = ["days", "weeks", "months"][func];

  return t('modals.newRecurring.repeatModes.' + type, repeatArg.value).split(" ")
}

const account = ref();
const amount = ref();
const description = ref("");
const parentCategory = ref();
const sign = ref(1);
const signChoice = ref(true);
const nextRepeat = ref(new Date());
const repeatFunc = ref(0);
const repeatArg = ref();
const notificationMode = ref(0);

const highlightErrors = ref(false);
const allValid = computed(() => account.value !== undefined &&
    amount.value !== undefined &&
    amount.value !== 0 &&
    parentCategory.value !== undefined &&
    nextRepeat.value &&
    repeatFunc.value !== undefined &&
    repeatArg.value !== undefined &&
    notificationMode !== undefined
);

watch(() => props.recurring, (newV, oldV) => {
  if (!newV)
    return;

  account.value = newV.accountId;
  amount.value = newV.delta;
  description.value = newV.description || "";
  parentCategory.value = newV.categoryId;
  nextRepeat.value = new Date(newV.nextRepeat)
  repeatFunc.value = newV.repeatType;
  repeatArg.value = newV.repeatArg;
  notificationMode.value = newV.notificationMode;

  amountChanged();
});

watch(parentCategory, () => {
  if (parentCategory.value === undefined) {
    signChoice.value = true;
    return;
  }

  const parentCategoryObject = categoriesMap.value.get(parentCategory.value);

  if (parentCategoryObject === undefined || parentCategoryObject.category === undefined) {
    signChoice.value = true;
    return;
  }

  if (parentCategoryObject.category.type !== 0)
    sign.value = parentCategoryObject.category.type

  signChoice.value = parentCategoryObject.category.type === 0;
});

const currency = computed(() => {
  if (account.value === undefined)
    return undefined;

  const accountObject = accountsMap.value.get(account.value);

  if (accountObject === undefined)
    return undefined;

  let currencyId = accountObject.currencyId;

  return currenciesMap.value.get(currencyId);
});

const amountChanged = () => {
  if (signChoice.value)
    sign.value = Math.sign(amount.value);

  amount.value = Math.abs(amount.value);
}

const close = () => {
  emit('close')
}

const apply = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $recurringTransactionsApi.editRecurring(props.recurring.recurringTransactionId, parentCategory.value, account.value, nextRepeat.value, repeatFunc.value, repeatArg.value, notificationMode.value, amount.value * sign.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.editRecurring.messages.success"), 2500, "success");
    }else {
      $toastsManager.pushToast(t("modals.editRecurring.messages.error"), 3000, "error");
    }
  });

}
</script>

<style scoped>

</style>