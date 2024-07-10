<template>
  <modal-base :title="$t('modals.sessions.title')" :opened="opened" :name="'sessions-modal'"
              :modal-class="'modal-top sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl'">
    <div class="overflow-x-auto">
      <div class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>{{ $t("modals.sessions.warning") }}</span>
      </div>

      <table class="table table-xs mt-4">
        <thead>
        <tr>
          <th>Created</th>
          <th>Expires</th>
          <th>Token</th>
          <th>Description</th>
          <th class="text-right">Action</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="session in sessions">
          <td class="w-36">{{ new Date(session.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
          <td class="w-36">{{ new Date(session.expiresAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
          <td><p class="w-24 sm:w-56 overflow-hidden overflow-ellipsis"> {{ session.token }} </p></td>
          <td><p>{{ session.description }}</p></td>
          <td class="text-right">
            <buttons-copy-button @click="copyToClipboard(session.token)" class="btn btn-ghost btn-xs"/>
          </td>
          <td class="text-right w-1 p-1">
            <buttons-delete-button @click="deleteSession(session)" v-if="session.token !== currentSessionToken" class="btn btn-ghost btn-xs"/>
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

const {$serverConfigs, $auth, $sessionsApi, $toastsManager } = useNuxtApp();

const configs = $serverConfigs.configs.users;

const emit = defineEmits(['close'])

const sessions = ref([]);
const currentSessionToken = $auth.state().token;

const newSessionDescription = ref();

const fetchSessions = async () => {
  sessions.value = await $sessionsApi.getSessions();
}

watch(() => props.opened, async () => {
  if (props.opened)
    await fetchSessions();
})

const close = () => {
  emit('close')
}

const newSession = () => {
  $sessionsApi.newSession(configs.userSessionsLifetimeDays, newSessionDescription.value.length > 0 ? newSessionDescription.value : null).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.sessions.messages.successCreate"), 2500, "success");
      fetchSessions();
    }else {
      $toastsManager.pushToast(t("modals.sessions.messages.errorCreate"), 3000,"error");
    }
  });
}

const deleteSession = (session) => {
  $sessionsApi.deleteSession(session.sessionId).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.sessions.messages.successDelete"), 2500, "success");
      fetchSessions();
    }else {
      $toastsManager.pushToast(t("modals.sessions.messages.errorDelete"), 3000,"error");
    }
  });
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(function() {
    $toastsManager.pushToast(t("modals.sessions.messages.successCopy"), 2500, "success");
  }, function(err) {
    $toastsManager.pushToast(t("modals.sessions.messages.errorCopy"), 3000,"error");
  });
}

</script>

<style scoped>

</style>