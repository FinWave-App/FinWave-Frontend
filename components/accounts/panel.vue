<template>
  <div>
    <div class="flex items-center justify-start">
      <h2 class="font-bold mb-0.5">{{ $t('accountsPanel.label') }}</h2>

      <div class="dropdown ml-1.5">
        <label tabindex="0" class="btn btn-sm btn-ghost m-0 p-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </label>

        <div tabindex="1" class="dropdown-content transition min-w-max menu p-2 shadow bg-base-100 rounded-box flex flex-col gap-2">
          <div @click="createTagModal = true" class="btn btn-sm gap-2 min-w-max justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <p>
              {{ $t('accountsPanel.newTag') }}
            </p>
          </div>

          <div v-if="tags.length > 0" class="btn btn-sm gap-2 min-w-max justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('accountsPanel.newAccount') }}
          </div>
        </div>

      </div>
    </div>

    <div v-if="tags.length > 0" class="flex flex-col gap-4 mt-2">
      <transition-group name="tags">
        <tag-group v-for="tag in tags.filter((t) => !t.hide)" :key="tag.tagId" :tag="tag" :hide-status="tag.hide" @hide="setHideTagStatus(tag, true)" @unHide="setHideTagStatus(tag, false)" :accounts="getTagAccounts(tag)">
        </tag-group>
        <tag-group v-for="tag in tags.filter((t) => t.hide)" :key="tag.tagId" :tag="tag" :hide-status="tag.hide" @hide="setHideTagStatus(tag, true)" @unHide="setHideTagStatus(tag, false)" :accounts="getTagAccounts(tag)">
        </tag-group>
      </transition-group>
    </div>
    <div v-else class="card min-w-max templateBorder">
      <div class="card-body p-5 justify-center items-center h-max">

        <button class="btn btn-ghost btn-circle text-opacity-60" @click="createTagModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>

      </div>
    </div>

    <modal-account-create-tag @close="createTagModal = false" :opened="createTagModal">
    </modal-account-create-tag>
  </div>
</template>

<script setup>

import TagGroup from "~/components/accounts/tagGroup.vue";
import { useArrayFilter } from '@vueuse/core'

const {$accountsApi, $accountsTagsApi} = useNuxtApp();

const tags = await $accountsTagsApi.getTags();
const accounts = await $accountsApi.getAccounts();

const getTagAccounts = (t) => {
  return useArrayFilter(accounts, a => a.tagId === t.tagId).value
}

tags.value.forEach((t) => {
  t.hide = useCache.get("hide_status_" + t.tagId).value;
})

const setHideTagStatus = (tag, status) => {
  tag.hide = status;
  useCache.set("hide_status_" + tag.tagId, status);
}

const createTagModal = ref(false);

</script>

<style scoped>

.templateBorder {
  @apply border-4 border-dashed;
}

.tags-move,
.tags-enter-active,
.tags-leave-active {
  transition: all 0.5s ease;
}
.tags-enter-from,
.tags-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.tags-leave-active {
  @apply w-max;
  position: absolute;
}

</style>