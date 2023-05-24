<template>
  <div class="transition-all" :class="{'opacity-70 hover:opacity-100': hideStatus}">
    <div class="transition-all tag-info mb-0" :class="{'rounded-2xl': hideStatus}">
      <div class="flex justify-between">
        <p class="font-bold text-lg">
          {{tag.name}}
        </p>

        <div class="flex gap-1 items-center">
          <div v-if="hideStatus && accounts.length === 0" @click="deleteTag" class="btn btn-ghost btn-xs m-0 p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>

          <div v-if="!hideStatus" @click="tagEditModal = true" class="btn btn-ghost btn-xs m-0 p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>

          <hide-button class="btn btn-xs btn-ghost m-0 p-0.5" :hide-status="hideStatus" @hide="setHide" @unHide="unHide"> </hide-button>
        </div>
      </div>

      <p v-if="!hideStatus" class="opacity-80 text-sm">
        {{tag.description}}
      </p>
    </div>
    <div v-if="!hideStatus" class="border-x-4 border-b-4 rounded-b-2xl p-2">
      <div v-if="accounts.length > 0" class="flex flex-col gap-2">
        <entry v-for="account in accounts" :account="account">

        </entry>
      </div>
      <div v-else class="card min-w-max templateBorder">
        <div class="card-body p-5 justify-center items-center h-max">

          <button class="btn btn-ghost btn-circle text-opacity-60" @click="createAccountModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>

        </div>
      </div>
    </div>

    <modal-account-create :tag="tag" @close="createAccountModal = false" :opened="createAccountModal">

    </modal-account-create>

    <confirmation :opened="tagDeleteModal" :name="'tag-delete-confirmation-modal'" :confirm-style="'error'" @confirm="confirmDelete" @deny="tagDeleteModal = false">
      <div class="flex justify-center">
        <p class="text-lg font-bold">
          Delete tag?
        </p>
      </div>
    </confirmation>

    <modal-account-edit-tag @close="tagEditModal = false" :opened="tagEditModal" :tag="tag">

    </modal-account-edit-tag>
  </div>
</template>

<script setup>
import Entry from "~/components/accounts/entry.vue";
import Confirmation from "~/components/modal/confirmation.vue";
import HideButton from "~/components/buttons/hideButton.vue";

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

const createAccountModal = ref(false);
const tagDeleteModal = ref(false);
const tagEditModal = ref(false);
const setHide = () => {
  emit('hide');
}

const unHide = () => {
  emit('unHide');
}

const deleteTag = () => {
  tagDeleteModal.value = true;
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
  @apply p-2 px-3 bg-base-100 shadow rounded-t-2xl;
}
</style>