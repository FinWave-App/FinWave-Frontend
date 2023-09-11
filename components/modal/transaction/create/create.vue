<template>
  <modal-tabbed-base-modal
      :title="$t('modals.newTransaction.title')"
      :opened="opened"
      :name="'transaction-create-modal'"
      :tabs="[
          $t('modals.newTransaction.tabs.default'),
          $t('modals.newTransaction.tabs.internalTransfer')]"
      v-model:tab="tab">

    <default v-if="tab === 0" @close="emit('close')" @reload-transactions="emit('reloadTransactions')"/>
    <internal v-if="tab === 1" @close="emit('close')" @reload-transactions="emit('reloadTransactions')"/>
  </modal-tabbed-base-modal>
</template>

<script setup>
import Datepicker from '@vuepic/vue-datepicker';
import Default from "~/components/modal/transaction/create/default.vue";
import Internal from "~/components/modal/transaction/create/internal.vue";

const props = defineProps({
  opened: {
    required: true,
    type: Boolean
  }
})

const {$serverConfigs, $transactionsTagsApi, $transactionsApi, $currenciesApi, $accountsApi, $toastsManager} = useNuxtApp();


const emit = defineEmits(['close', 'reloadTransactions']);
const { t, locale } = useI18n();

const tab = ref(0);

</script>

<style scoped>

</style>