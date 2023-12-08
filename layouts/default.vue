<template>
  <toasts-board>

  </toasts-board>

  <navigation>

  </navigation>

  <div class="page-content">
    <slot />
  </div>

</template>

<script setup>

import Navigation from "~/components/nav/navigation.vue";

useSeoMeta({
  title: 'FinWave App',
  ogTitle: 'FinWave App',
  description: 'A convenient open source service for financial accounting',
  ogDescription: 'A convenient open source service for financial accounting'
})

</script>

<style scoped>

</style>