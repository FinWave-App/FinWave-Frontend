<template>
  <modal-base :title="$t('modals.files.title')" :opened="opened" :name="'files-view-modal'"
              :modal-class="'modal-top sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl '">
    <div class="flex flex-col gap-0.5 items-center w-full">
      <p class="font-bold">
        {{ prettyBytes(Math.max(storage.freeBytes, 0), {locale: locale}) }} / {{ prettyBytes(storage.maxBytes, {locale: locale}) }}
      </p>
      <progress class="progress progress-primary w-full" :value="storage.freeBytes" :max="storage.maxBytes"></progress>
    </div>


    <div class="overflow-y-auto list-max-h">
      <div class="flex flex-col gap-2 mt-6 min-w-fit">
        <div v-for="file in files.filter(f => f.size && f.size > 0)" :key="file.fileId" class="border border-accent/40 p-4 gap-4 rounded-xl flex justify-between items-center">

          <div class="flex gap-4 items-center">
            <div>
              <svg v-if="file.mimeType && file.mimeType.includes('image')" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <svg v-else-if="file.mimeType && file.mimeType.includes('text')"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>

            <div>
              <p class="font-bold text-wrap text-ellipsis overflow-hidden">
                {{ file.name }}
              </p>
              <p class="text-wrap text-ellipsis overflow-hidden text-sm opacity-60">
                {{file.description }}
              </p>
              <div class="flex gap-1 items-end">
                <p class="">
                  {{ prettyBytes(file.size) }}
                </p>
                <p class="text-sm opacity-70">
                  {{ formatter.format(Math.round(file.size / storage.usedBytes * 10000) / 100) }}%
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <p class="text-wrap text-ellipsis overflow-hidden text-sm opacity-60 text-justify">
              {{ $t("modals.files.createdAt") }}
              {{ new Date(file.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric'}) }}
              <br>
              {{ $t("modals.files.expiresAt") }}
              {{ new Date(file.expiresAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric'}) }}
            </p>
            <div class="flex flex-col gap-1">
              <download-button v-if="file.isPublic" class="btn btn-ghost btn-xs" @event="download(getDownloadURL(file.fileId))"></download-button>
              <share-button v-if="file.isPublic" class="btn btn-ghost btn-xs" @event="copyToClipboard(getDownloadURL(file.fileId))"></share-button>
              <delete-button class="btn btn-xs btn-ghost" @event="remove(file.fileId)" />
            </div>
          </div>
        </div>

        <div v-if="files.length === 0" class="template-border rounded-xl p-4">
          <p class="text-center font-bold opacity-70">
            {{ $t("modals.files.empty") }}
          </p>
        </div>
      </div>
    </div>

    <div class="modal-action justify-between flex-row-reverse">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.close') }}</button>

      <button v-if="files.length > 0" @click="removeAll" class="btn btn-sm btn-error"> {{ $t('modals.files.deleteAll') }} </button>
    </div>
  </modal-base>
</template>

<script setup>
import prettyBytes from "pretty-bytes";
import DownloadButton from "~/components/buttons/downloadButton.vue";
import ShareButton from "~/components/buttons/shareButton.vue";
import DeleteButton from "~/components/buttons/deleteButton.vue";
import {useServer} from "~/composables/useServer";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, locale } = useI18n();
const { $filesApi, $toastsManager } = useNuxtApp();

const emit = defineEmits(['close']);

const files = $filesApi.getFiles();
const storage = $filesApi.getAvailableSpace();

const formatter = Intl.NumberFormat(locale.value, {});

const close = () => {
  emit('close');
}

const remove = (fileId) => {
  $filesApi.delete(fileId).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.files.messages.delete.success"), 2500, "success");
    }else {
      $toastsManager.pushToast(t("modals.files.messages.delete.error"), 3000,"error");
    }
  })
}

const removeAll = () => {
  $filesApi.deleteAll().then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.files.messages.deleteAll.success"), 2500, "success");
    }else {
      $toastsManager.pushToast(t("modals.files.messages.deleteAll.error"), 3000,"error");
    }
  })
}

const getDownloadURL = (fileId) => {
  return useServer.getUrl() + "files/download?fileId=" + fileId;
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(function() {
    $toastsManager.pushToast(t("modals.files.messages.linkCopy.success"), 2500, "success");
  }, function(err) {
    $toastsManager.pushToast(t("modals.files.messages.linkCopy.fail"), 3000,"error");
  });
}

const download = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = ''
  link.target = '_blank'
  link.click()
}

</script>

<style scoped>
.list-max-h {
  max-height: 50vh;
}
</style>