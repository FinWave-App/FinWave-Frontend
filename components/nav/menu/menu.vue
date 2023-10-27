<template>
  <ul class="gap-2 px-1">
    <li v-for="item in items">
      <nuxt-link :to="item.url" class="">{{ $t(item.text) }}</nuxt-link>
    </li>
  </ul>
</template>

<script setup>

const items = computed(() => {
  return [
    {
      text: "navigation.main",
      url: "/"
    },
    {
      text: "navigation.notes",
      url: "/notes"
    },
    {
      text: "navigation.tags",
      url: "/tags"
    },
    {
      text: "navigation.transactions",
      url: "/transactions"
    },
    {
      text: "navigation.recurring",
      url: "/recurring"
    },
    {
      text: "navigation.currencies",
      url: "/currencies"
    },
    {
      text: "navigation.analytics",
      url: "/analytics"
    }
  ];
});
</script>

<style scoped>

</style>