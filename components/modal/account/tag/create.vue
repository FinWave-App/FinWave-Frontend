<template>
  <modal-base :title="$t('modals.newAccountTag.title')" :opened="opened" :name="'account-transactionTag-create-modal'">
    <div class="w-full flex flex-col gap-2">
      <input type="text"
             class="input input-bordered"
             :placeholder="$t('modals.newAccountTag.placeholders.tagName')"
             v-model.trim="name"
             :maxlength="tagsConfigs.maxNameLength"
             :class="{'input-error' : highlightErrors && name.length < 1}"
      />

      <textarea class="textarea input-bordered" :placeholder="$t('modals.newAccountTag.placeholders.tagDescription')" v-model.trim="description" :maxlength="tagsConfigs.maxDescriptionLength">
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

const emit = defineEmits(['close'])

const { t } = useI18n();

const close = () => {
  emit('close')
}

const {$serverConfigs, $accountsTagsApi, $toastsManager} = useNuxtApp();
const tagsConfigs = $serverConfigs.configs.accounts.tags;

const name = ref("");
const description = ref("");

const highlightErrors = ref(false);
const allValid = computed(() => name.value.length >= 1)

watch(() => props.opened, (selection, prevSelection) => {
  if (selection) {
    name.value = "";
    description.value = "";
  }
})

const create = () => {
  if (!allValid.value) {
    highlightErrors.value = true;

    return;
  }

  highlightErrors.value = false;
  close();

  $accountsTagsApi.newTag(name.value, description.value.length > 0 ? description.value : null).then((s) => {
    if (s !== -1)
      $toastsManager.pushToast(t("modals.newAccountTag.messages.success"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newAccountTag.messages.error"), 3000,"error")
  });
}

</script>

<style scoped>

</style>