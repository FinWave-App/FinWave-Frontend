<template>
  <div class="w-full flex flex-col justify-center items-center transition-all dialog-sizes">
    <div v-if="context" class="w-full flex flex-col gap-2 justify-between h-full" @dragover.prevent="dropStateUpdate" @dragenter.prevent @drop.prevent>
      <div class="flex gap-1 items-center absolute z-10 backdrop-blur py-0.5 pl-1 pr-1 rounded-xl">
        <button v-if="messages.length > 0" class="btn btn-ghost btn-sm p-0.5" @click="startDialog">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <div class="badge badge-sm badge-outline">
          #{{ context }}
        </div>
      </div>

      <div v-if="messages.length > 0" class="overflow-auto h-full" id="messagesContainer">
        <transition-group name="messages">
          <div class="chat" v-for="m in messages" :class="{'chat-start' : m.fromBot, 'chat-end' : !m.fromBot}" :key="m.id">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full">
                <svg v-if="m.fromBot" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
            </div>
            <div v-if="m.status === 1" class="chat-bubble" :class="{'max-w-72' : limitedBubbleWidth, 'from-emerald-300/20 bg-gradient-to-r' : m.attachment && !m.isImage}">
              <MDC v-if="!m.attachment || m.isImage" class="markdown" :value="m.message" />
              <div v-else class="max-w-48 h-8 flex justify-between gap-2 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
                <p class="text-center font-bold truncate">
                  {{ m.name}}
                </p>
              </div>
            </div>
            <div v-else-if="m.status === 0" class="skeleton w-52 h-11 bg-opacity-50">
            </div>
            <div v-else class="chat-bubble chat-bubble-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
            </div>
          </div>
        </transition-group>
      </div>

      <div v-if="messages.length === 0" class="flex w-full h-full items-center">
        <p class="font-bold opacity-80 text-lg text-center p-4">
          {{ $t("modals.ai.emptyTip") }}
        </p>
      </div>

      <div class="flex gap-2 w-full">

        <template v-if="!userWantDrop">
          <input type="file" accept="image/jpeg,.jpeg,.jpg,image/gif,.gif,image/png,.png,application/pdf,.pdf,text/plain,.txt,.md" id="hidden_file_select" class="hidden" @change="fileSelected" />
          <button class="btn btn-ghost btn-sm p-1" @click="invokeFileSelect">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
          </button>

          <input class="input input-bordered input-ghost w-full input-sm" v-on:keyup.enter="sendMessage" v-model="newMessage">
          <button class="btn btn-ghost btn-sm p-1" @click="sendMessage">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </template>
        <template v-else>
          <div id="drop-zone" class="w-full h-32 template-border rounded-lg flex justify-center items-center" @drop.prevent="filesDropped">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-10 h-10 opacity-70">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
        </template>

      </div>
    </div>
    <div v-else class="w-full h-full flex flex-col justify-between items-center">
      <div class="flex flex-col justify-center items-center h-full">
        <div class="flex w-full justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-32 h-32">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <p class="font-bold text-lg m-4">
          {{ $t("modals.ai.startText") }}
        </p>
      </div>

      <button class="btn btn-outline btn-success animate-pulse w-full justify-self-end" @click="startDialog"> {{ $t("modals.ai.buttons.start") }} </button>
    </div>
  </div>
</template>

<script setup>
import {find} from "vue3-treeselect";

const props = defineProps({
  limitedBubbleWidth: {
    type: Boolean,
    required: false,
    default: true
  }
})

const emit = defineEmits(['changeScreen'])

const { t, locale } = useI18n();

const { $aiApi, $filesApi, $toastsManager } = useNuxtApp();

const newMessage = ref();
const context = $aiApi.getContextId();
const messages = $aiApi.getMessages();

const userWantDrop = ref(false);
let dragTimeout = null;
let lastDropCall = Date.now();

const dropStateUpdate = () => {
  userWantDrop.value = true;
  let now = Date.now();

  if (now - lastDropCall < 1000)
    return;

  lastDropCall = now;

  if (dragTimeout)
    clearTimeout(dragTimeout);

  dragTimeout = setTimeout(() => {
    userWantDrop.value = false
    dragTimeout = null;
  }, 2000);
}

const invokeFileSelect = () => {
  document.getElementById('hidden_file_select').click();
}

const uploadFile = async (file) => {
  const result = await $filesApi.upload(file, {
    isPublic: true,
    description: "AI context upload"
  });

  if (!result.fileId) {
    $toastsManager.pushToast(t("modals.ai.messages.uploadError"), 3000,"error")

    return;
  }

  const attachResult = await $aiApi.attachFile(result.fileId, file.type.startsWith("image/"), file.name);

  if (!attachResult) {
    $toastsManager.pushToast(t("modals.ai.messages.uploadError"), 3000,"error")

    return;
  }

  scrollToBottom();
}

const fileSelected = async (event) => {
  const file = event.target.files[0];

  if (!file)
    return;

  await uploadFile(file);
}

const filesDropped = async (event) => {
  console.log("dropped")

  const files = event.dataTransfer.files

  if (!files)
    return

  files.forEach(uploadFile)
}

const startDialog = async () => {
  await $aiApi.newContext();
}

const sendMessage = async () => {
  const newM = newMessage.value;

  if (!newM)
    return

  newMessage.value = "";

  await $aiApi.ask(newM);

  scrollToBottom();
}

watch(messages, async () => {
  scrollToBottom();
}, {deep: true})

const scrollToBottom = () => {
  setTimeout(() => {
    const containerElement = document.getElementById('messagesContainer');

    if (containerElement === null)
      return;

    containerElement.scroll({
      top: containerElement.scrollHeight + 1000,
      behavior: 'smooth',
    });
  }, 50)
}

</script>

<style scoped>
.dialog-sizes {
  height: calc(100vh - 16rem);
  min-height: 32rem;
  min-width: 24rem;
}

@keyframes pulse {
  50% {
    @apply brightness-125;
  }
}
.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.messages-move,
.messages-enter-active,
.messages-leave-active {
  transition: all 0.5s ease;
}
.messages-enter-from,
.messages-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.messages-leave-active {
  position: absolute;
}


</style>

<style>

.markdown h1 {
  @apply text-2xl font-extrabold my-2;
}

.markdown h2 {
  @apply text-xl font-bold my-2;
}

.markdown h3,h4,h5,h6 {
  @apply text-lg font-bold my-1;
}

.markdown a {
  @apply underline;
}

.markdown h2 a, .markdown h3 a, .markdown h4 a, .markdown h5 a, .markdown h6 a {
  @apply no-underline;
}

.markdown table {
  @apply table table-xs
}

.markdown p {
  @apply my-2
}

.markdown blockquote {
  @apply italic border-l-4 border-base-100 border-opacity-40 pl-2
}

.markdown li {
  display: list-item;
  @apply ml-2 my-2;
}

.markdown li::marker {
  @apply font-bold
}

.markdown code {
  @apply bg-accent/10 rounded p-0.5;
}

.markdown pre {
  @apply bg-accent/10 rounded overflow-x-scroll h-fit p-2 leading-none;
}

.markdown pre code {
  @apply bg-transparent !important;
}

.markdown ol {
  list-style-type: decimal;
  list-style-position: inside;
}

.markdown ul ul, .markdown ol ul {
  list-style-type: circle;
  list-style-position: inside;
  margin-left: 15px;
}

.markdown ol ol, .markdown ul ol {
  list-style-type: lower-latin;
  list-style-position: inside;
  margin-left: 15px;
}

.markdown {
  @apply overflow-scroll
}
</style>