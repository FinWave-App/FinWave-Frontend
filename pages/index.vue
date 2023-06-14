<template>
  <div class="page-grid">
    <accounts-panel class="col-span-1 row-span-2">
    </accounts-panel>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: [
      "auth"
  ]
})

</script>

<style scoped>

</style>