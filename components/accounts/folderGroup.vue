<template>
  <div class="transition-all" :class="{'opacity-70 hover:opacity-100': hideStatus}">
    <div class="transition-all folder-info mb-0" :class="{'rounded-2xl': hideStatus}">
      <div class="flex justify-between">
        <p class="font-bold text-lg">
          {{folder.name}}
        </p>

        <div class="flex gap-1 items-center">
          <plus-button class="btn btn-xs btn-ghost m-0 p-0.5" v-if="!hideStatus" @event="createAccountModal = true" />
          <edit-button class="btn btn-xs btn-ghost m-0 p-0.5" v-if="!hideStatus" @event="folderEditModal = true"/>

          <delete-button class="btn btn-xs btn-ghost m-0 p-0.5" v-if="hideStatus && accounts.length === 0" @click="deleteFolder" />
          <hide-button class="btn btn-xs btn-ghost m-0 p-0.5" :hide-status="hideStatus" @hide="setHide" @unHide="unHide"/>
        </div>
      </div>

      <div v-if="!hideStatus">
        <div v-if="map.size > 0" class="flex flex-wrap gap-1 mb-1">
          <div v-if="exchangesEnabled" class="badge badge-xs badge-accent opacity-90 font-bold min-text p-1.5">
            <p v-if="preferredResult">
              {{ formatAmount(preferredResult, preferredCurrency) }}
            </p>
            <span v-else class="loading loading-dots loading-xs"></span>
          </div>

          <template v-if="showBadges">
            <div v-for="[key, value] in map" class="badge badge-xs badge-neutral opacity-90 font-bold min-text p-1.5">
              {{ formatAmount(value, key) }}
            </div>
          </template>
        </div>

        <p class="opacity-80 text-sm">
          {{folder.description}}
        </p>
      </div>
    </div>
    <div v-if="!hideStatus" class="bg-base-300 rounded-b-2xl p-2">
      <div v-if="accounts.length > 0" class="flex flex-col gap-2">
        <transition-group name="accounts">
          <entry v-for="account in showedAccounts"
                 :account="account"
                 @edit-modal="openEditAccountModal(account)"
                 :key="account.accountId"
          />

          <entry v-for="account in hiddenAccounts"
                 :account="account"
                 @edit-modal="openEditAccountModal(account)"
                 :key="account.accountId"
          />
        </transition-group>
      </div>
      <div v-else class="card min-w-max template-border">
        <div class="card-body p-5 justify-center items-center h-max">

          <button class="btn btn-ghost btn-circle text-opacity-60" @click="createAccountModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>

        </div>
      </div>
    </div>

    <modal-account-create :folder="folder" @close="createAccountModal = false" :opened="createAccountModal"/>

    <confirmation :opened="folderDeleteModal" :name="'folder-delete-confirmation-modal'" :confirm-style="'error'" @confirm="confirmDelete" @deny="folderDeleteModal = false">
      <div class="flex justify-center">
        <p class="text-lg font-bold">
          {{ $t("modals.confirmations.deleteAccountFolder") }}
        </p>
      </div>
    </confirmation>

    <modal-account-folder-edit @close="folderEditModal = false" :opened="folderEditModal" :folder="folder"/>
    <modal-account-edit :account="accountToEdit" :opened="accountEditModal" @close="accountEditModal = false" @open-accumulation="openAccumulationModal(accountToEdit)" ></modal-account-edit>
    <modal-accumulation-set @close="accumulationSetModal = false" :opened="accumulationSetModal" :account="accountToAccumulation" ></modal-accumulation-set>
  </div>
</template>

<script setup>
import Entry from "~/components/accounts/entry.vue";
import Confirmation from "~/components/modal/confirmation.vue";
import HideButton from "~/components/buttons/hideButton.vue";
import EditButton from "~/components/buttons/editButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";
import {useCurrencyFormatter} from "~/composables/useCurrencyFormatter";
import {useStorage} from "@vueuse/core";

const emit = defineEmits(['hide', 'unHide']);

const {$currenciesApi, $accountsFoldersApi, $toastsManager, $exchangeRateApi, $serverConfigs} = useNuxtApp();
const { t, locale } = useI18n();

const currencyMap = $currenciesApi.getCurrenciesMap();
const exchangesEnabled = $serverConfigs.configs.exchanges.enabled;

const preferredCurrencyId = useStorage("preferred_currency", 1);
const preferredCurrency = computed(() => currencyMap.value.get(preferredCurrencyId.value))
const preferredResult = ref()

const props = defineProps({
  accounts: {
    required: true
  },

  folder: {
    required: true
  },

  hideStatus: {
    required: true
  }

})

const showedAccounts = computed(() => props.accounts.filter((a) => !a.hidden));
const hiddenAccounts = computed(() => props.accounts.filter((a) => a.hidden));

const formatAmount = (delta, currency) => {
  return useCurrencyFormatter(delta, currency, locale.value);
}

const map = computed(() => {
  const result = new Map();

  for (const account of showedAccounts.value) {
    const currency = currencyMap.value.get(account.currencyId);

    if (!currency)
      continue;

    if (!result.has(currency))
      result.set(currency, 0);

    result.set(currency, result.get(currency) + account.amount);
  }

  return result;
})

const calculatePreferred = async () => {
  preferredResult.value = null;

  const target = preferredCurrencyId.value;
  let result = 0;

  for (const [key, value] of map.value) {
    if (key.currencyId === target) {
      result += value;
      continue;
    }

    const rate = await $exchangeRateApi.getExchangeRate(key.currencyId, target)

    if (rate === -1)
      continue;

    result += value * rate;
  }

  preferredResult.value = result;
}

const showBadges = computed(() => {
  return !exchangesEnabled || map.value.size > 1 || (map.value.size === 1 && !map.value.has(preferredCurrency.value));
});

if (exchangesEnabled) {
  watch([() => map.value, preferredCurrencyId], () => {
    calculatePreferred();
  })

  calculatePreferred();
}

const createAccountModal = ref(false);
const folderDeleteModal = ref(false);
const folderEditModal = ref(false);
const accumulationSetModal = ref(false);

const accountEditModal = ref(false);
const accountToEdit = ref(null);
const accountToAccumulation = ref(null);

const setHide = () => {
  emit('hide');
}

const unHide = () => {
  emit('unHide');
}

const deleteFolder = () => {
  folderDeleteModal.value = true;
}

const openEditAccountModal = (account) => {
  accountToEdit.value = account;
  accountEditModal.value = true;
}

const openAccumulationModal = (account) => {
  accountToAccumulation.value = account;
  accumulationSetModal.value = true;
}

const confirmDelete = () => {
  folderDeleteModal.value = false;

  $accountsFoldersApi.deleteFolder(props.folder.folderId).then((s) => {
    if (s)
      $toastsManager.pushToast(t("accountFolderEntry.messages.deleted"), 2500, "success")
    else
      $toastsManager.pushToast(t("accountFolderEntry.messages.deleteFail"), 3000,"error")
  });
}

</script>

<style scoped>
.min-text {
  font-size: 0.65rem;
  line-height: 5rem;
}

.folder-info {
  @apply p-2 px-3 bg-base-100 rounded-t-2xl;
}

.accounts-move,
.accounts-enter-active,
.accounts-leave-active {
  transition: all 0.5s ease;
}
.accounts-enter-from,
.accounts-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.accounts-leave-active {
  @apply w-max;
  position: absolute;
}

</style>