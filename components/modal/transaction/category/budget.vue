<template>
  <modal-base :title="$t('modals.categoryBudget.title')" :opened="opened" :name="'transaction-transactionCategory-budget-modal'"
              :modal-class="'modal-top sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl'">

    <div class="w-full flex flex-col gap-2 overflow-x-auto sm:overflow-x-visible max-h-screen min-h-96">
      <div v-if="budgets"
           v-for="entry in budgets"
           :key="entry.id"
           class="border-base-200 border-2 rounded-xl transition-colors flex gap-2 p-1 items-center min-w-full w-fit"
           :class="{'border-error' : budgetsSyncStatus[entry.budgetId] === -1, 'border-warning' : budgetsSyncStatus[entry.budgetId] === 0}">
        <select-currency class="w-full min-w-48"
                         v-model="entry.currencyId"
                         :exclude-currencies="budgets.map((m) => m.currencyId).filter((c) => c !== entry.currencyId)"
                         @selected="editBudget(entry)"
        />

        <transaction-amount-field class="w-full min-w-48"
                                  :currency-id="entry.currencyId"
                                  :category-id="entry.categoryId"
                                  v-model="entry.amount"
                                  @change="editBudget(entry)"
        />

        <div class="form-control w-full min-w-24">
          <select class="select select-bordered join-item"
                  v-model="entry.dateType"
                  @change="editBudget(entry)"
          >
            <option value="-1" disabled> {{ $t('modals.categoryBudget.placeholders.dateType.label') }} </option>
            <option value="0">{{ $t('modals.categoryBudget.placeholders.dateType.perMonth') }}</option>
            <option value="1">{{ $t('modals.categoryBudget.placeholders.dateType.perQuartal') }}</option>
          </select>
        </div>

        <delete-button class="btn btn-ghost" @event="remove(entry.budgetId)" />
      </div>

      <div v-if="category && budgets" class="template-border rounded-xl flex gap-2 items-center p-1 min-w-full w-fit">
        <select-currency class="w-full min-w-48"
                         v-model="newBudgetCurrency"
                         :exclude-currencies="budgets.map((m) => m.currencyId)"
                         :class="{'border-error' : highlightErrors && !newBudgetCurrency}"
        />

        <transaction-amount-field class="w-full min-w-48"
                                  :currency-id="newBudgetCurrency"
                                  :category-id="category.categoryId"
                                  v-model="newBudgetAmount"
                                  :highlightErrors="highlightErrors"
        />

        <div class="form-control w-full min-w-24">
          <select class="select select-bordered join-item"
                  v-model="newBudgetDateType"
                  :class="{'select-error' : highlightErrors && newBudgetDateType === -1}">
            <option value="-1" disabled> {{ $t('modals.categoryBudget.placeholders.dateType.label') }} </option>
            <option value="0">{{ $t('modals.categoryBudget.placeholders.dateType.perMonth') }}</option>
            <option value="1">{{ $t('modals.categoryBudget.placeholders.dateType.perQuartal') }}</option>
          </select>
        </div>

        <plus-button class="btn" :class="{'btn-success' : newValid, 'btn-warning' : !newValid}" @event="newBudget"/>
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
import TransactionAmountField from "~/components/modal/transaction/transactionAmountField.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  category: {
    required: true
  }
})

const emit = defineEmits(['close'])

const close = () => {
  newBudgetCurrency.value = undefined;
  newBudgetDateType.value = -1;
  newBudgetAmount.value = undefined;
  highlightErrors.value = false;

  emit('close')
}

const { t } = useI18n();

const { $transactionsCategoriesApi, $categoriesBudgetApi, $toastsManager } = useNuxtApp();

const budgets = ref();

const budgetsSyncStatus = ref({});

const newBudgetCurrency = ref();
const newBudgetDateType = ref(-1);
const newBudgetAmount = ref();

const highlightErrors = ref(false);

watch([() => props.opened, () => props.category], () => {
  updateBudgets();
})

const updateBudgets = () => {
  if (!props.opened || !props.category) {
    budgets.value = null;
    budgetsSyncStatus.value = {};

    return;
  }

  let newBudgets = $categoriesBudgetApi.getCategoryToBudgetsMap().value.get(props.category.categoryId);

  if (newBudgets) {
    newBudgets = JSON.parse(JSON.stringify(newBudgets));
  }

  budgets.value = newBudgets || [];
  budgetsSyncStatus.value = {};
}

const newValid = computed(() => {
  return newBudgetCurrency.value && newBudgetDateType.value !== -1 && newBudgetAmount.value && newBudgetAmount.value !== 0 && (!budgets.value || !budgets.value.find((t) => t.currencyId === newBudgetCurrency.value))
});

const remove = (budgetId) => {
  $categoriesBudgetApi.removeBudget(budgetId).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.categoryBudget.messages.remove.success"), 2500, "success")
      updateBudgets();
    } else
      $toastsManager.pushToast(t("modals.categoryBudget.messages.remove.error"), 3000,"error")
  });
}

const editBudget = (budget) => {
  budgetsSyncStatus.value[budget.budgetId] = 0;

  $categoriesBudgetApi.editBudget(budget.budgetId, budget.categoryId, budget.currencyId, budget.dateType, budget.amount).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.categoryBudget.messages.edit.success"), 2500, "success")
      updateBudgets();
    }else {
      $toastsManager.pushToast(t("modals.categoryBudget.messages.edit.error"), 3000,"error")
      budgetsSyncStatus.value[budget.budgetId] = -1;
    }
  });
}

const newBudget = () => {
  if (!newValid.value) {
    highlightErrors.value = true;

    return;
  }

  $categoriesBudgetApi.addBudget(props.category.categoryId, newBudgetCurrency.value, newBudgetDateType.value, newBudgetAmount.value).then((s) => {
    if (s !== -1) {
      $toastsManager.pushToast(t("modals.categoryBudget.messages.new.success"), 2500, "success")
      updateBudgets();
    }else
      $toastsManager.pushToast(t("modals.categoryBudget.messages.new.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>