<template>
  <div class="hero min-h-screen">
    <div class="hero-content w-full">
      <div class="panel w-1/3">
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


            <div class="dropdown dropdown-right">
              <input type="password"
                     tabindex="0"
                     :disabled="loading"
                     autocomplete="current-password"
                     v-model="password"
                     :placeholder="$t('loginPage.passwordField.placeholder')"
                     class="input input-bordered w-full"
                     :class=" { 'input-success' : passwordMatch && password.length > 0, 'input-error' : !passwordMatch && password.length > 0}"
              />
              <div tabindex="0" class="dropdown-content ml-2 flex flex-col gap-4 min-w-max">
                <div class="badge badge-md badge-error gap-2 shadow-xl" v-for="error in passwordRequirements">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  {{ $t(error) }}
                </div>
              </div>
            </div>

          </div>

          <div class="flex flex-row gap-2">
            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">{{ $t('registerPage.lang.label') }}</span>
              </label>
              <select class="select select-bordered w-full " :disabled="loading" v-model="selected" @change="langChanged">
                <option disabled selected>{{ locale }}</option>
                <option v-for="locale in availableLocales"> {{locale.code}} </option>
              </select>
            </div>

            <div class="form-control w-full">
              <label class="label">
                <span class="label-text">{{ $t('registerPage.timezone.label') }}</span>
              </label>
              <select class="select select-bordered w-full " :disabled="loading" v-model="timezone">
                <option selected disabled> {{timezone}} </option>
                <option v-for="tz in timezones"> {{tz}} </option>
              </select>
            </div>
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
          <div class="text-neutral text-sm underline" :class="{ 'text-opacity-50' : loading}">

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
    () => {
    const {$serverConfigs, $auth} = useNuxtApp()

      if ($auth.state().authed.value || !$serverConfigs.configs.users.registration.enabled)
        return navigateTo("/");
    }
  ],
  layout: false
})

const timezones = [
  "UTC-11",  "UTC-10",  "UTC-9",  "UTC-8",  "UTC-7",  "UTC-6",  "UTC-5",  "UTC-4",  "UTC-3",  "UTC-2",  "UTC-1",  "UTC+0",
  "UTC+1",   "UTC+2",   "UTC+3",  "UTC+4",  "UTC+5",  "UTC+6",  "UTC+7",  "UTC+8",  "UTC+9",  "UTC+10", "UTC+11", "UTC+12",
]

const login = ref("");
const password = ref("");
const timezoneNumber = (-new Date().getTimezoneOffset() / 60);

const timezone = ref("UTC" + (timezoneNumber >= 0 ? "+" : "") + timezoneNumber);
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

const passwordMatch = computed(() => {
  const regex = new RegExp(userConfig.registration.passwordRegexFilter)

  return regex.test(password.value) &&
      password.value.length >= userConfig.minPasswordLength &&
      password.value.length <= userConfig.maxPasswordLength
});

const passwordRequirements = computed(() => {
  const result = [];
  const symbols = /\W/;
  const numbers = /\d/;

  if (password.value.length < userConfig.minPasswordLength)
    result.push("registerPage.errors.password.tooShort");

  if (password.value.length > userConfig.maxPasswordLength)
    result.push("registerPage.errors.password.tooLong");

  if (!symbols.test(password.value))
    result.push("registerPage.errors.password.missingSpecials");

  if (!numbers.test(password.value))
    result.push("registerPage.errors.password.missingNumbers");

  return result;
});

const { locale, locales } = useI18n();

const availableLocales = computed(() => {
  return (locales.value).filter(i => i.code !== locale.value)
})

const selected = ref(locale.value);

const langChanged = () => {
  useNuxtApp().$i18n.setLocale(selected.value)
}

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
    query: {login: login.value, password: password.value, lang: locale, timezone: timezone.value}
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

  const {data, error} = await useApi('auth/login', {
    method: "POST",
    query: {login: login.value, password: password.value}
  })

  if (error.value !== null) {
    errorMessage.value = "registerPage.errors.serverError";
    loading.value = false;

    return;
  }

  $auth.auth(data.value.token, data.value.lifetimeDays);

  loading.value = false;

  await navigateTo("/");
}

</script>

<style scoped>
.panel {
  @apply p-8;
}
</style>