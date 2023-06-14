<template>
  <li v-if="entry.url !== undefined">
    <nuxt-link :to="entry.url" class="btn btn-ghost p-4">{{ $t(entry.text) }}</nuxt-link>
  </li>
  <li v-else>
    <div class="">
      {{ $t(entry.text) }}
      <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>
    </div>
    <ul class="p-2 menu bg-base-100 shadow gap-1">
      <nav-menu-entry v-for="menu in entry.subMenu" :entry="menu">
      </nav-menu-entry>
    </ul>
  </li>
</template>

<script setup>
defineProps({
  entry: {}
})

</script>

<style scoped>

</style>r