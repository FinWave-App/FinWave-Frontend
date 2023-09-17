<template>
  <div class="">
    <div class="flex gap-1">
      <h2 class="font-bold">{{ $t('accountsPanel.label') }}</h2>

      <button tabindex="0" @click="createTagModal = true" class="btn btn-ghost min-h-0 h-max m-0 p-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

    </div>

    <div v-if="tags.length > 0" class="flex flex-col gap-4 mt-2 min-w-fit">
      <transition-group name="tags">
        <tag-group v-for="tag in tags.filter((t) => !t.hide)"
                   :key="tag.tagId" :tag="tag"
                   :hide-status="tag.hide"
                   @hide="setHideTagStatus(tag, true)"
                   @unHide="setHideTagStatus(tag, false)"
                   :accounts="getTagAccounts(tag)">
        </tag-group>

        <tag-group v-for="tag in tags.filter((t) => t.hide)"
                   :key="tag.tagId"
                   :tag="tag"
                   :hide-status="tag.hide"
                   @hide="setHideTagStatus(tag, true)"
                   @unHide="setHideTagStatus(tag, false)"
                   :accounts="getTagAccounts(tag)">
        </tag-group>
      </transition-group>
    </div>
    <div v-else class="card min-w-max templateBorder mt-2">
      <div class="card-body p-5 justify-center items-center h-max">

        <button class="btn btn-ghost btn-circle text-opacity-60" @click="createTagModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        </button>

      </div>
    </div>

    <modal-account-tag-create @close="createTagModal = false" :opened="createTagModal"/>
  </div>
</template>

<script setup>

import TagGroup from "~/components/accounts/tagGroup.vue";
import { useArrayFilter } from '@vueuse/core'

const {$accountsApi, $accountsTagsApi} = useNuxtApp();

const tags = $accountsTagsApi.getTags();
const accounts = $accountsApi.getAccounts();

const getTagAccounts = (t) => {
  return useArrayFilter(accounts, a => a.tagId === t.tagId).value
}

tags.value.forEach((t) => {
  t.hide = useStorage.get("hide_status_" + t.tagId);
})

const setHideTagStatus = (tag, status) => {
  tag.hide = status;
  useStorage.set("hide_status_" + tag.tagId, status);
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