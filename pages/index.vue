<template>
  <div class="page-grid">
    <accounts-panel class="col-span-1 row-span-2">
    </accounts-panel>
  </div>
</template>

<script setup>

definePageMeta({
  middleware: [
      "auth"
  ]
})

const {$auth, $accountsApi} = useNuxtApp();

const authState = $auth.state();
const accounts = $accountsApi.getAccounts();

</script>

<style scoped>

</style>