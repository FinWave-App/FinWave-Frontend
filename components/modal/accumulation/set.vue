<template>
  <modal-base :title="$t('modals.setAccumulation.title')" :opened="opened" :name="'accumulation-set-modal'">
    <div class="w-full flex flex-col gap-2">
      <div class="flex justify-center">
         <accounts-entry class="template-border w-1/2" v-if="account" :account="account" :hide-buttons="true"/>
      </div>

      <div class="flex gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.setAccumulation.placeholders.targetAccount') }}</span>
          </label>

          <select-account v-model="targetAccountId" :exclude-account="sourceAccountId" :currency-filter="currencyFilter"/>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.setAccumulation.placeholders.tag') }}</span>
          </label>

          <select-transaction-tag v-model="tagId" :can-be-without-parent="false" :tags-tree="tagsTree"/>
        </div>
      </div>

      <step-entry v-for="(step, index) in steps" :model-value="step" @update:model-value="args => steps[index] = args"/>

      <div class="w-full" v-if="configs.maxStepsPerAccount > steps.length">
        <plus-button class="btn w-full" @event="steps.push({from: null, to: null, step: null})" />
      </div>
    </div>

    <div class="modal-action justify-between">
      <delete-button @click="deleteAccumulation" class="btn btn-sm btn-error" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.delete') }}</delete-button>

      <div class="flex gap-2">
        <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
        <button @click="set" class="btn btn-sm btn-success" :class="{'btn-warning' : !allValid}">{{ $t('modals.buttons.set') }}</button>
      </div>
    </div>
  </modal-base>
</template>

<script setup>
import StepEntry from "~/components/modal/accumulation/stepEntry.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  },

  account: {
    required: true
  }
})

const { t } = useI18n();

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const {$serverConfigs, $accumulationsApi, $transactionsTagsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.accumulation;

const accumulationMap = $accumulationsApi.getAccumulationMap();
const tagsTree = $transactionsTagsApi.getTagsTree();

const highlightErrors = ref(false);
const allValid = computed(() => sourceAccountId.value && targetAccountId.value && tagId.value && steps.value.length > 0 && !steps.value.find(v => !v.step))

const account = ref();
const steps = ref([]);
const sourceAccountId = ref();
const targetAccountId = ref();
const tagId = ref();
const currencyFilter = ref();

watch(() => props.opened, (value) => {
  if (!value)
    return;

  const v = accumulationMap.value.get(props.account.accountId) || {};

  sourceAccountId.value = props.account.accountId;
  targetAccountId.value = v.targetAccountId;
  tagId.value = v.tagId;
  steps.value = v.steps || [{from: null, to: null, steps: null}];
  account.value = props.account;
  currencyFilter.value = props.account.currencyId;
})

const set = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  const result = {
    sourceAccountId: sourceAccountId.value,
    targetAccountId: targetAccountId.value,
    tagId: tagId.value,
    steps: steps.value
  }

  highlightErrors.value = false;
  close();

  $accumulationsApi.setAccumulation(result).then((s) => {
    if (s)
      $toastsManager.pushToast(t("modals.setAccumulation.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.setAccumulation.messages.error"), 3000,"error")
  });
}

const deleteAccumulation = () => {
  close();

  $accumulationsApi.removeAccumulation(sourceAccountId.value).then((s) => {
    if (s)
      $toastsManager.pushToast(t("modals.setAccumulation.messages.deleted"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.setAccumulation.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>