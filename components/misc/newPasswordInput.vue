<template>
  <div class="dropdown dropdown-top">
    <input type="password"
           tabindex="0"
           :disabled="disabled"
           autocomplete="new-password"
           v-model="password"
           :placeholder="$t('loginPage.passwordField.placeholder')"
           class="input input-bordered w-full"
           :class="{ 'input-success' : passwordMatch && password.length > 0, 'input-error' : !passwordMatch && password.length > 0 }"
    />
    <div tabindex="0" class="dropdown-content mb-2 flex flex-col gap-2 min-w-max">
      <div class="badge badge-md badge-error gap-2 shadow-xl" v-for="error in passwordRequirements">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        {{ $t(error) }}
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  modelValue: {
  },
  passwordMatch: {
  },

  disabled: {
    type: Boolean
  }
})

const emit = defineEmits(['update:modelValue', 'update:passwordMatch'])

const { $serverConfigs } = useNuxtApp();
const userConfig = $serverConfigs.configs.users;

const password = ref("");

watch(password, (l, n) => {
  if (password.value === null || props.modelValue == password.value)
    return;

  emit('update:modelValue', password.value);
});

const passwordMatch = computed(() => {
  const regex = new RegExp(userConfig.registration.passwordRegexFilter)

  return regex.test(password.value) &&
      password.value.length >= userConfig.minPasswordLength &&
      password.value.length <= userConfig.maxPasswordLength
});

watch(passwordMatch, () => {
  emit('update:passwordMatch', passwordMatch.value);
})

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
</script>

<style scoped>

</style>