<template>
  <div class="page-grid">
    <accounts-panel class="col-span-1 row-span-2">
    </accounts-panel>

    <total-panel class="col-span-1 lg:col-span-2 row-span-1">
    </total-panel>
  </div>
</template>

<script setup>

import TotalByPeriod from "~/components/analytics/totalByPeriod.vue";
import TotalPanel from "~/components/analytics/totalPanel.vue";

definePageMeta({
  middleware: [
      "auth"
  ]
})

</script>

<style scoped>
.panel {
  @apply p-2;
}
</style>