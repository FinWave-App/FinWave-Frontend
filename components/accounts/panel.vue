<template>
  <div class="">
    <div class="flex gap-1">
      <h2 class="font-bold">{{ $t('accountsPanel.label') }}</h2>

      <button tabindex="0" @click="createFolderModal = true" class="btn btn-ghost min-h-0 h-max m-0 p-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

    </div>

    <div v-if="folders.length > 0" class="flex flex-col gap-4 mt-2 min-w-fit">
      <transition-group name="folders">
        <folder-group v-for="folder in folders.filter((t) => !t.hide)"
                   :key="folder.folderId" :folder="folder"
                   :hide-status="folder.hide"
                   @hide="setHideFolderStatus(folder, true)"
                   @unHide="setHideFolderStatus(folder, false)"
                   :accounts="getFolderAccounts(folder)">
        </folder-group>

        <folder-group v-for="folder in folders.filter((t) => t.hide)"
                   :key="folder.folderId"
                   :folder="folder"
                   :hide-status="folder.hide"
                   @hide="setHideFolderStatus(folder, true)"
                   @unHide="setHideFolderStatus(folder, false)"
                   :accounts="getFolderAccounts(folder)">
        </folder-group>
      </transition-group>
    </div>
    <div v-else class="card min-w-max template-border mt-2">
      <div class="card-body p-5 justify-center items-center h-max">

        <button class="btn btn-ghost btn-circle text-opacity-60" @click="createFolderModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>

      </div>
    </div>

    <modal-account-folder-create @close="createFolderModal = false" :opened="createFolderModal"/>
  </div>
</template>

<script setup>

import FolderGroup from "~/components/accounts/folderGroup.vue";
import { useArrayFilter } from '@vueuse/core'
import {useStorage} from "@vueuse/core";

const {$accountsApi, $accountsFoldersApi} = useNuxtApp();

const folders = $accountsFoldersApi.getFolders();
const accounts = $accountsApi.getAccounts();

const getFolderAccounts = (t) => {
  return useArrayFilter(accounts, a => a.folderId === t.folderId).value
}

folders.value.forEach((t) => {
  t.hide = useStorage("hide_status_" + t.folderId, false).value;
})

const setHideFolderStatus = (folder, status) => {
  folder.hide = status;
  useStorage("hide_status_" + folder.folderId, false).value = status;
}

const createFolderModal = ref(false);

</script>

<style scoped>

.folders-move,
.folders-enter-active,
.folders-leave-active {
  transition: all 0.5s ease;
}
.folders-enter-from,
.folders-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.folders-leave-active {
  @apply w-max;
  position: absolute;
}

</style>