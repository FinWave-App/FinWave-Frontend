<template>
  <div class="hero min-h-screen">
    <div class="hero-content w-full">
      <div class="panel lg:w-1/3">
        <p class="font-bold text-xl text-center">{{ $t('registerPage.title') }}</p>

        <form class="flex gap-4 flex-col mt-2">
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('registerPage.loginField.label') }}</span>
            </label>

            <input type="text"
                   :disabled="loading"
                   autocomplete="username"
                   v-model="login"
                   :placeholder="$t('loginPage.loginField.placeholder')"
                   class="input input-bordered w-full"
                   :class=" { 'input-success' : loginMatch && login.length > 0, 'input-error' : !loginMatch && login.length > 0}"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('registerPage.passwordField.label') }}</span>
            </label>

            <misc-new-password-input v-model="password" :disabled="loading" v-model:passwordMatch="passwordMatch"/>

          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('selects.langSelect.label') }}</span>
            </label>

            <select-lang class="w-full" />
          </div>
        </form>

        <div class="alert alert-error shadow-lg mt-4" v-if="(errorMessage !== '')">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{{ $t(errorMessage) }}</span>
          </div>
        </div>

        <button class="btn w-full btn-success mt-8" :disabled="loading || !loginMatch || !passwordMatch" :class=" { 'loading' : loading }" @click="register">{{ $t('registerPage.actions.singUp') }}</button>
        <div class="w-full flex justify-end mt-2">
          <div class="text-base-content text-sm underline" :class="{ 'text-opacity-50' : loading}">

            <nuxt-link v-if="!loading" to="/login">
              {{ $t('registerPage.actions.singIn') }}
            </nuxt-link>
            <p v-else>
              {{ $t('registerPage.actions.singIn') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: [
    "server-available",
    () => {
    const {$serverConfigs, $auth} = useNuxtApp()

      if ($auth.state().authed.value || !$serverConfigs.configs.users.registration.enabled)
        return navigateTo("/");
    }
  ],
  layout: false
})

const login = ref("");
const password = ref("");
const passwordMatch = ref(false);

const errorMessage = ref("");
const loading = ref(false);

const { $auth, $serverConfigs } = useNuxtApp();
const userConfig = $serverConfigs.configs.users;

const loginMatch = computed(() => {
  const regex = new RegExp(userConfig.registration.loginRegexFilter)

  return regex.test(login.value) &&
  login.value.length >= userConfig.minLoginLength &&
  login.value.length <= userConfig.maxLoginLength
});

const { locale, locales } = useI18n();

const register = async () => {
  if (login.value === "" || login.value == null) {
    errorMessage.value = "registerPage.errors.needUsername";

    return;
  }

  if (password.value === "" || password.value == null) {
    errorMessage.value = "registerPage.errors.needPassword";

    return;
  }

  errorMessage.value = "";

  loading.value = true;

  const {error: errorRegister} = await useApi('auth/register', {
    method: "POST",
    query: {login: login.value, password: password.value}
  })

  if (errorRegister.value !== null) {
    loading.value = false;

    if (errorRegister.value.statusCode === 409) {
      errorMessage.value = "registerPage.errors.userExists";
      login.value = "";
    } else {
      errorMessage.value = "registerPage.errors.serverError";
    }

    return;
  }

  loading.value = false;

  await navigateTo("/login");
}

</script>

<style scoped>
.panel {
  @apply p-8;
}
</style>