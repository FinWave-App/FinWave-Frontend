<template>
  <div class="flex flex-col justify-between">
    <div class="min-h-screen">
      <toasts-board/>
      <navigation/>

      <div class="page-content">
        <slot />
      </div>
    </div>

    <fw-footer class="mt-24"/>
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