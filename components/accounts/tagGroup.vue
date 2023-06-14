<template>
  <div class="transition-all" :class="{'opacity-70 hover:opacity-100': hideStatus}">
    <div class="transition-all tag-info mb-0" :class="{'rounded-2xl': hideStatus}">
      <div class="flex justify-between">
        <p class="font-bold text-lg">
          {{tag.name}}
        </p>

        <div class="flex gap-1 items-center">
          <plus-button class="btn btn-xs btn-ghost m-0 p-0.5" v-if="!hideStatus" @event="createAccountModal = true" />
          <edit-button class="btn btn-xs btn-ghost m-0 p-0.5" v-if="!hideStatus" @event="tagEditModal = true"/>

          <delete-button class="btn btn-xs btn-ghost m-0 p-0.5" v-if="hideStatus && accounts.length === 0" @click="deleteTag" />
          <hide-button class="btn btn-xs btn-ghost m-0 p-0.5" :hide-status="hideStatus" @hide="setHide" @unHide="unHide"/>
        </div>
      </div>

      <p v-if="!hideStatus" class="opacity-80 text-sm">
        {{tag.description}}
      </p>
    </div>
    <div v-if="!hideStatus" class="bg-base-300 rounded-b-2xl p-2">
      <div v-if="accounts.length > 0" class="flex flex-col gap-2">
        <transition-group name="accounts">
          <entry v-for="account in showedAccounts" :account="account" @edit-modal="openEditAccountModal(account)" :key="account.accountId"/>

          <entry v-for="account in hiddenAccounts" :account="account" @edit-modal="openEditAccountModal(account)" :key="account.accountId"/>
        </transition-group>
      </div>
      <div v-else class="card min-w-max templateBorder">
        <div class="card-body p-5 justify-center items-center h-max">

          <button class="btn btn-ghost btn-circle text-opacity-60" @click="createAccountModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>

        </div>
      </div>
    </div>

    <modal-account-create :tag="tag" @close="createAccountModal = false" :opened="createAccountModal"/>

    <confirmation :opened="tagDeleteModal" :name="'tag-delete-confirmation-modal'" :confirm-style="'error'" @confirm="confirmDelete" @deny="tagDeleteModal = false">
      <div class="flex justify-center">
        <p class="text-lg font-bold">
          Delete tag?
        </p>
      </div>
    </confirmation>

    <modal-account-tag-edit @close="tagEditModal = false" :opened="tagEditModal" :tag="tag"/>
    <modal-account-edit :account="accountToEdit" :opened="accountEditModal" @close="accountEditModal = false"></modal-account-edit>
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

const {$serverConfigs, $accountsApi, $accountsTagsApi, $toastsManager} = useNuxtApp();
const { t } = useI18n();

const props = defineProps({
  accounts: {
    required: true
  },

  tag: {
    required: true
  },

  hideStatus: {
    required: true
  }

})

const showedAccounts = computed(() => props.accounts.filter((a) => !a.hidden));
const hiddenAccounts = computed(() => props.accounts.filter((a) => a.hidden));

const createAccountModal = ref(false);
const tagDeleteModal = ref(false);
const tagEditModal = ref(false);

const accountEditModal = ref(false);

const accountToEdit = ref(null);

const setHide = () => {
  emit('hide');
}

const unHide = () => {
  emit('unHide');
}

const deleteTag = () => {
  tagDeleteModal.value = true;
}

const openEditAccountModal = (account) => {
  accountToEdit.value = account;
  accountEditModal.value = true;
}

const confirmDelete = () => {
  tagDeleteModal.value = false;

  $accountsTagsApi.deleteTag(props.tag.tagId).then((s) => {
    if (s)
      $toastsManager.pushToast(t("accountTagEntry.messages.deleted"), 2500, "success")
    else
      $toastsManager.pushToast(t("accountTagEntry.messages.deleteFail"), 3000,"error")
  });
}

</script>

<style scoped>
.tag-info {
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