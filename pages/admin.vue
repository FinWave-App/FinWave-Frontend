<template>
  <div class="page-grid">
    <admin-stats/>

    <admin-user-panel class="lg:col-span-2"/>
  </div>
</template>

<script setup>

definePageMeta({
  middleware: [
    "auth", "admin-auth"
  ]
})

const { $adminApi } = useNuxtApp();

</script>

<style scoped>

</style>