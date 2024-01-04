<template>
  <div class="panel">
    <p class="font-bold border-b pb-2 border-base-200">
      {{ $t("reportsPanel.title") }}
    </p>

    <div class="overflow-x-auto overflow-y-hidden" :key="'table'">
      <table class="table table-sm table-zebra table-pin-rows">
        <thead>
        <tr>
          <th> {{ $t("reportsPanel.table.created") }} </th>
          <th> {{ $t("reportsPanel.table.type") }}  </th>
          <th> {{ $t("reportsPanel.table.status") }}  </th>
          <th> {{ $t("reportsPanel.table.expires") }}  </th>
          <th> {{ $t("reportsPanel.table.description") }}  </th>
          <th class="text-right">{{ $t("reportsPanel.table.action")}} </th>
          <th class="text-base text-base-content flex justify-center items-center">
            <plus-button class="btn btn-sm btn-ghost px-1 h-full min-h-0" @event="newOpened = true"></plus-button>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="report in reportsList">
          <td class="w-48"> {{ new Date(report.created).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }} </td>
          <td class="w-32"> {{ $t("reportsPanel.types." + types[report.type]) }} </td>
          <td class="w-32"> {{ $t("reportsPanel.status." + statuses[report.status + 1]) }} </td>
          <td class="w-48"> {{ new Date(report.expires).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }} </td>
          <td> {{ report.description }} </td>
          <td class="text-right">
            <download-button v-if="report.status === 1" class="btn btn-ghost btn-xs" @event="download($reportsApi.getDownloadURL(report.token))"></download-button>
          </td>
          <td class="text-right w-1">
            <share-button  v-if="report.status === 1" class="btn btn-ghost btn-xs" @event="copyToClipboard($reportsApi.getDownloadURL(report.token))"></share-button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <modal-reports-create :opened="newOpened" @close="newOpened = false" @fetchReports="fetchReports"/>

  </div>
</template>

<script setup>
import TransactionsFilterDiv from "~/components/transactions/filter.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import TableEntry from "~/components/transactions/table/tableEntry.vue";
import EditButton from "~/components/buttons/editButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";
import DownloadButton from "~/components/buttons/downloadButton.vue";
import ShareButton from "~/components/buttons/shareButton.vue";

const { t, locale, getLocaleMessage } = useI18n();
const i18n = useI18n();

const { $serverConfigs, $toastsManager, $reportsApi } = useNuxtApp();

const configs = $serverConfigs.configs.reports;
const reportsList = ref();

const newOpened = ref(false);

const types = [
    "list",
    "byDays",
    "byMonths"
]

const statuses = [
  "failed",
  "inProgress",
  "available"
]

let reportsTimer;

const fetchReports = async () => {
  reportsList.value = await $reportsApi.getReports();

  const userWait = reportsList.value.find((e) => e.status === 0) !== undefined;

  if (userWait && !reportsTimer) {
    reportsTimer = setTimeout(fetchReports, 1000);
  }else if (!userWait) {
    reportsTimer = null;
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(function() {
    $toastsManager.pushToast(t("reportsPanel.messages.linkCopied"), 2500, "success");
  }, function(err) {
    $toastsManager.pushToast(t("reportsPanel.messages.linkFail"), 3000,"error");
  });
}

const download = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = ''
  link.target = '_blank'
  link.click()
}

fetchReports()

</script>

<style scoped>

</style>