<template>
  <modal-base :title="$t('modals.changePassword.title')" :opened="opened" :name="'change-password-modal'">

    <div class="alert alert-warning">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <span>{{ $t("modals.changePassword.warning") }}</span>
    </div>

    <div class="w-full flex flex-col gap-2 mt-2">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.changePassword.placeholders.newPassword') }}</span>
        </label>

        <misc-new-password-input v-model="newPassword" v-model:password-match="newPasswordValid"/>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t('modals.changePassword.placeholders.newPasswordConfirm') }}</span>
        </label>

        <input class="input input-bordered"
               type="password"
               autocomplete="new-password"
               :class="{ 'input-success' : passwordMatches && newPasswordConfirm.length > 0, 'input-error': !passwordMatches && newPasswordConfirm.length > 0 }"
               v-model="newPasswordConfirm"
        >
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
      <button @click="apply" :disabled="!passwordMatches || newPassword.length === 0 || !newPasswordValid" class="btn btn-sm btn-success">{{ $t('modals.buttons.apply') }}</button>
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

const { t } = useI18n();

const { $userApi, $toastsManager } = useNuxtApp();

const emit = defineEmits(['close'])

const newPassword = ref("");
const newPasswordConfirm = ref("");

const newPasswordValid = ref(false);

const passwordMatches = computed(() => {
  return newPassword.value === newPasswordConfirm.value;
})

const close = () => {
  emit('close')
}

const apply = () => {
  close();

  $userApi.changePassword(newPassword.value).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.changePassword.messages.success"), 2500, "success");
    }else {
      $toastsManager.pushToast(t("modals.changePassword.messages.error"), 3000,"error");
    }
  });
}
</script>

<style scoped>

</style>