<template>
  <modal-base :title="$t('modals.tagManagement.title')" :opened="opened" :name="'transaction-transactionTag-management-modal'"
              :modal-class="'modal-top sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl'">

    <div class="w-full flex flex-col gap-2 overflow-x-auto sm:overflow-x-visible">
      <div v-if="managements"
           v-for="entry in managements"
           :key="entry.id"
           class="border-base-200 border-2 rounded-xl transition-colors flex gap-2 p-1 items-center min-w-full w-fit"
           :class="{'border-error' : managementsSyncStatus[entry.managementId] === -1, 'border-warning' : managementsSyncStatus[entry.managementId] === 0}">
        <select-currency class="w-full min-w-48"
                         v-model="entry.currencyId"
                         :exclude-currencies="managements.map((m) => m.currencyId).filter((c) => c !== entry.currencyId)"
                         @selected="editManagement(entry)"
        />

        <transaction-amount-field class="w-full min-w-48"
                                  :currency-id="entry.currencyId"
                                  :tag-id="entry.tagId"
                                  v-model="entry.amount"
                                  @change="editManagement(entry)"
        />

        <div class="form-control w-full min-w-24">
          <select class="select select-bordered join-item"
                  v-model="entry.dateType"
                  @change="editManagement(entry)"
          >
            <option value="-1" disabled> {{ $t('modals.tagManagement.placeholders.dateType.label') }} </option>
            <option value="0">{{ $t('modals.tagManagement.placeholders.dateType.perMonth') }}</option>
            <option value="1">{{ $t('modals.tagManagement.placeholders.dateType.perQuartal') }}</option>
          </select>
        </div>

        <delete-button class="btn btn-ghost" @event="remove(entry.managementId)" />
      </div>

      <div v-if="tag && managements" class="template-border rounded-xl flex gap-2 items-center p-1 min-w-full w-fit">
        <select-currency class="w-full min-w-48"
                         v-model="newManagementCurrency"
                         :exclude-currencies="managements.map((m) => m.currencyId)"
                         :class="{'border-error' : highlightErrors && !newManagementCurrency}"
        />

        <transaction-amount-field class="w-full min-w-48"
                                  :currency-id="newManagementCurrency"
                                  :tag-id="tag.tagId"
                                  v-model="newManagementAmount"
                                  :highlightErrors="highlightErrors"
        />

        <div class="form-control w-full min-w-24">
          <select class="select select-bordered join-item"
                  v-model="newManagementDateType"
                  :class="{'select-error' : highlightErrors && newManagementDateType === -1}">
            <option value="-1" disabled> {{ $t('modals.tagManagement.placeholders.dateType.label') }} </option>
            <option value="0">{{ $t('modals.tagManagement.placeholders.dateType.perMonth') }}</option>
            <option value="1">{{ $t('modals.tagManagement.placeholders.dateType.perQuartal') }}</option>
          </select>
        </div>

        <plus-button class="btn" :class="{'btn-success' : newValid, 'btn-warning' : !newValid}" @event="newManagement"/>
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

  tag: {
    required: true
  }
})

const emit = defineEmits(['close'])

const close = () => {
  newManagementCurrency.value = undefined;
  newManagementDateType.value = -1;
  newManagementAmount.value = undefined;
  highlightErrors.value = false;

  emit('close')
}

const { t } = useI18n();

const { $transactionsTagsApi, $tagsManagementApi, $toastsManager } = useNuxtApp();

const managements = ref();

const managementsSyncStatus = ref({});

const newManagementCurrency = ref();
const newManagementDateType = ref(-1);
const newManagementAmount = ref();

const highlightErrors = ref(false);

watch([() => props.opened, () => props.tag], () => {
  updateManagements();
})

const updateManagements = () => {
  if (!props.opened || !props.tag) {
    managements.value = null;
    managementsSyncStatus.value = {};

    return;
  }

  let newManagements = $tagsManagementApi.getTagToManagementsMap().value.get(props.tag.tagId);

  if (newManagements) {
    newManagements = JSON.parse(JSON.stringify(newManagements));
  }

  managements.value = newManagements || [];
  managementsSyncStatus.value = {};
}

const newValid = computed(() => {
  return newManagementCurrency.value && newManagementDateType.value !== -1 && newManagementAmount.value && newManagementAmount.value !== 0 && (!managements.value || !managements.value.find((t) => t.currencyId === newManagementCurrency.value))
});

const remove = (managementId) => {
  $tagsManagementApi.removeManagement(managementId).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.tagManagement.messages.remove.success"), 2500, "success")
      updateManagements();
    } else
      $toastsManager.pushToast(t("modals.tagManagement.messages.remove.error"), 3000,"error")
  });
}

const editManagement = (management) => {
  managementsSyncStatus.value[management.managementId] = 0;

  $tagsManagementApi.editManagement(management.managementId, management.tagId, management.currencyId, management.dateType, management.amount).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.tagManagement.messages.edit.success"), 2500, "success")
      updateManagements();
    }else {
      $toastsManager.pushToast(t("modals.tagManagement.messages.edit.error"), 3000,"error")
      managementsSyncStatus.value[management.managementId] = -1;
    }
  });
}

const newManagement = () => {
  if (!newValid.value) {
    highlightErrors.value = true;

    return;
  }

  $tagsManagementApi.addManagement(props.tag.tagId, newManagementCurrency.value, newManagementDateType.value, newManagementAmount.value).then((s) => {
    if (s !== -1) {
      $toastsManager.pushToast(t("modals.tagManagement.messages.new.success"), 2500, "success")
      updateManagements();
    }else
      $toastsManager.pushToast(t("modals.tagManagement.messages.new.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>