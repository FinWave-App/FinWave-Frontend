<template>
    <select class="select select-bordered w-full " v-model="selected" @change="langChanged">
      <option disabled selected :value="locale">{{ codeToName(locale) }}</option>
      <option v-for="locale in availableLocales" :value="locale.code"> {{locale.name}} </option>
    </select>
</template>

<script setup>
const { locale, locales } = useI18n();

const selected = ref(locale.value);

const availableLocales = computed(() => {
  return (locales.value).filter(i => i.code !== locale.value)
})

const codeToName = (code) => {
  return (locales.value).find(i => i.code === code).name
}

const langChanged = () => {
  useNuxtApp().$i18n.setLocale(selected.value)
}
</script>

<style scoped>

</style>