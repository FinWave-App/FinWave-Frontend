<template>
  <div class="hero min-h-screen">
    <div class="hero-content w-full flex-col">
      <server-changer v-if="server.allowCustomUrl()" class="panel lg:w-1/3" @serverChanged="reloadPage"/>

      <div class="panel lg:w-1/3">
        <p class="font-bold text-xl text-center">{{ $t('loginPage.title') }}</p>

        <form class="flex gap-4 flex-col mt-2">
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('loginPage.loginField.label') }}</span>
            </label>
            <input type="text" :disabled="loading" autocomplete="username" v-model="login" :placeholder="$t('loginPage.loginField.placeholder')" class="input input-bordered w-full" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('loginPage.passwordField.label') }}</span>
            </label>
            <input type="password" :disabled="loading" autocomplete="current-password" v-model="password" :placeholder="$t('loginPage.passwordField.placeholder')" class="input input-bordered w-full" />
          </div>
        </form>

        <div v-if="!demoMode" class="form-control mt-2">
          <label class="label cursor-pointer">
            <span class="label-text">{{ $t('loginPage.rememberMe') }}</span>
            <input type="checkbox" :disabled="loading" v-model="rememberMe" checked="checked" class="checkbox" />
          </label>
        </div>

        <div class="alert alert-error shadow-lg mt-4" v-if="(errorMessage !== '')">
          <div class="flex gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ $t(errorMessage) }}</span>
          </div>
        </div>

        <button class="btn w-full btn-success mt-8" :disabled="loading" @click="singIn">{{ $t('loginPage.actions.singIn') }}</button>

        <div class="w-full flex justify-end mt-2" v-if="registrationEnabled">
          <div class="text-base-content text-sm underline" :class="{ 'text-opacity-50' : loading}">

            <nuxt-link v-if="!loading" to="/register">
              {{ $t('loginPage.actions.singUp') }}
            </nuxt-link>
            <p v-else>
              {{ $t('loginPage.actions.singUp') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useApiLoader} from "~/composables/useApiLoader";
import {useServer} from "~/composables/useServer";

definePageMeta({
  middleware: [
    "server-available",
    () => {
      if (useNuxtApp().$auth.state().authed.value)
        return navigateTo("/");
    }
  ],
  layout: false
})

const login = ref();
const password = ref();
const rememberMe = ref(true);

const errorMessage = ref("");

const loading = ref(false);

const { $auth, $serverConfigs, $toastsManager } = useNuxtApp();
const server = useServer;

const { t, locale } = useI18n();
const configs = $serverConfigs.configs.users;

const reloadPage = () => {
  window.location.reload();
}

const singIn = async () => {
  if (login.value === "" || login.value == null) {
    errorMessage.value = "loginPage.errors.needUsername";

    return;
  }

  if (password.value === "" || password.value == null) {
    errorMessage.value = "loginPage.errors.needPassword";

    return;
  }
  errorMessage.value = "";

  loading.value = true;

  const {data, error} = await useApi('auth/login', {
    method: "POST",
    query: {login: login.value, password: password.value}
  })

  if (error.value !== null) {
    loading.value = false;

    if (error.value.statusCode === 401) {
      errorMessage.value = "loginPage.errors.invalidCredentials";
      password.value = "";
    } else {
      errorMessage.value = "loginPage.errors.serverError";
    }

    return;
  }

  $auth.auth(data.value.token, data.value.lifetimeDays);
  await useApiLoader.fetch();

  navigateTo("/").then(() => {
    loading.value = false;
  })
}

const registrationEnabled = configs.registration.enabled;
const demoMode = configs.demoMode;

if (demoMode) {
  const {data, error} = await useApi('auth/demo', {
    method: "POST"
  })

  if (error.value !== null) {
    loading.value = false;

    errorMessage.value = "loginPage.errors.demoError";
  }else {
    login.value = data.value.username;
    password.value = data.value.password;
  }
}

</script>

<style scoped>
.panel {
  @apply p-8;
}
</style>