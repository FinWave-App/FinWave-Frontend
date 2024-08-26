<template>
  <modal-base :title="$t('modals.sessions.title')" :opened="opened" :name="'sessions-modal'"
              :modal-class="'modal-top sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl'">
    <div class="alert alert-warning">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <span>{{ $t("modals.sessions.warning") }}</span>
    </div>

    <div v-if="newToken" class="alert alert-success mt-2 flex-col">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stroke-current shrink-0 h-6 w-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
      </svg>
      <span class="sm:text-nowrap">{{ $t("modals.sessions.newToken") }}</span>

      <p class="p-2 py-0 bg-base-100/20 rounded-2xl w-full overflow-x-scroll no-scrollbar">
        {{ newToken }}
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-xs mt-4">
        <thead>
        <tr>
          <th>{{ $t('modals.sessions.table.created') }}</th>
          <th>{{ $t('modals.sessions.table.expires') }}</th>
          <th>{{ $t('modals.sessions.table.meta') }}</th>
          <th>{{ $t('modals.sessions.table.description') }}</th>
          <th class="text-right">{{ $t('modals.sessions.table.action') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="session in sessionsData.sessions" :class="{'bg-base-200' : session.sessionId === sessionsData.currentId}">
          <td class="w-36">{{ new Date(session.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
          <td class="w-36">{{ new Date(session.expiresAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
          <td>
            <div class="flex gap-2 w-fit">
              <div class="badge badge-primary badge-outline" v-if="session.sessionId === sessionsData.currentId">
                {{ $t('modals.sessions.badges.current') }}
              </div>
              <div class="badge badge-warning badge-outline" v-if="session.limited">
                {{ $t('modals.sessions.badges.limited') }}
              </div>
            </div>
          </td>
          <td><p>{{ session.description }}</p></td>
          <td class="text-right w-1 p-1">
            <buttons-delete-button @click="deleteSession(session)" class="btn btn-ghost btn-xs"/>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-action mt-2 items-end">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t("modals.sessions.newSession") }}</span>
        </label>

        <div class="flex join w-full">
          <input class="input input-bordered input-sm join-item w-full"
                 :placeholder="$t('modals.sessions.placeholders.description')"
                 :maxlength="configs.maxSessionDescriptionLength"
                 v-model="newSessionDescription"
          >

          <button class="btn btn-sm btn-success join-item" @click="newSession()"> {{ $t('modals.buttons.create') }} </button>
        </div>
      </div>
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, locale } = useI18n();

const {$serverConfigs, $sessionsApi, $auth, $toastsManager } = useNuxtApp();

const configs = $serverConfigs.configs.users;

const emit = defineEmits(['close'])

const sessionsData = ref([]);
const newSessionDescription = ref();

const newToken = ref(null);

const fetchSessions = async () => {
  sessionsData.value = await $sessionsApi.getSessions();
}

watch(() => props.opened, async () => {
  if (props.opened) {
    newToken.value = null;
    await fetchSessions();
  }
})

const close = () => {
  emit('close')
}

const newSession = () => {
  $sessionsApi.newSession(configs.userSessionsLifetimeDays, newSessionDescription.value && newSessionDescription.value.length > 0 ? newSessionDescription.value : null).then(async (s) => {
    if (s) {
      newToken.value = s;
      await copyToClipboard(s);
      $toastsManager.pushToast(t("modals.sessions.messages.successCreate"), 2500, "success");
      fetchSessions();
    } else {
      $toastsManager.pushToast(t("modals.sessions.messages.errorCreate"), 3000, "error");
    }
  });
}

const deleteSession = (session) => {
  $sessionsApi.deleteSession(session.sessionId).then((s) => {
    if (s && session.sessionId === sessionsData.value.currentId) {
      $auth.logout(true);

      return;
    }

    if (s) {
      $toastsManager.pushToast(t("modals.sessions.messages.successDelete"), 2500, "success");
      fetchSessions();
    }else {
      $toastsManager.pushToast(t("modals.sessions.messages.errorDelete"), 3000,"error");
    }
  });
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text).then(function () {
      $toastsManager.pushToast(t("modals.sessions.messages.successCopy"), 2500, "success");
    });
  } catch (err) {
    console.error(err);
    $toastsManager.pushToast(t("modals.sessions.messages.errorCopy"), 3000, "error");
  }
}

</script>

<style scoped>

</style>