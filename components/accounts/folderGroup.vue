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

      <p v-if="!hideStatus" class="opacity-80 text-sm">
        {{folder.description}}
      </p>
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

const emit = defineEmits(['hide', 'unHide']);

const {$serverConfigs, $accountsApi, $accountsFoldersApi, $toastsManager} = useNuxtApp();
const { t } = useI18n();

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