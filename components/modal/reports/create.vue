<template>
  <modal-base :title="$t('modals.newReport.title')" :opened="opened" :name="'report-create-modal'"
              :modal-class="'modal-bottom sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl'">

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newReport.placeholders.filter') }}</span>
      </label>

      <div class="w-full flex flex-col gap-2">
        <transactions-filter-div v-model="filter"/>
      </div>
    </div>


    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newReport.placeholders.type') }}</span>
      </label>

      <select class="select select-bordered join-item" v-model.number="type">
        <option :value="0"> {{ $t('reportsPanel.types.list') }} </option>
        <option :value="1"> {{ $t('reportsPanel.types.byDays') }} </option>
        <option :value="2"> {{ $t('reportsPanel.types.byMonths') }} </option>
      </select>
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">{{ $t('modals.newReport.placeholders.description') }}</span>
      </label>

      <textarea class="textarea input-bordered"
                :placeholder="$t('modals.newReport.placeholders.description')"
                v-model.trim="description"
                :maxlength="configs.maxDescriptionLength">
      </textarea>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="create" class="btn btn-sm btn-success">{{ $t('modals.buttons.create') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
import TransactionsFilterDiv from "~/components/transactions/filter.vue";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, getLocaleMessage, locale } = useI18n();

const {$serverConfigs, $reportsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.reports;
console.log(configs)
const emit = defineEmits(['close', 'fetchReports'])

const filter = ref();
const description = ref();
const type = ref(0);

function extractLocalizationStrings(messages) {
  const cleanMessages = {};

  Object.keys(messages).forEach(key => {
    if (typeof messages[key] === 'object' && messages[key].loc && messages[key].loc.source) {
      cleanMessages[key] = messages[key].loc.source;
    } else if (typeof messages[key] === 'string') {
      cleanMessages[key] = messages[key];
    } else {
      cleanMessages[key] = extractLocalizationStrings(messages[key]);
    }
  });

  return cleanMessages;
}

const close = () => {
  emit('close')
}

const create = () => {
  const lang = extractLocalizationStrings(getLocaleMessage(locale.value).reportsPanel.backendLang);

  close();

  $reportsApi.newReport(filter.value, description.value, type.value, lang).then((s) => {
    emit('fetchReports');

    if (s)
      $toastsManager.pushToast(t("modals.newReport.messages.reportRequested"), 2500, "success")
    else
      $toastsManager.pushToast(t("modals.newReport.messages.reportRequestFail"), 3000,"error")
  });
}

</script>


<style scoped>

</style>