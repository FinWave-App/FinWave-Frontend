<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold text-error">
          {{ $t("errorPage.title") }}
        </h1>
        <p class="py-6">
          {{ $t("errorPage.description") }}
        </p>
        <nuxt-link to="/" class="btn btn-neutral">{{ $t("errorPage.tryAgain") }}</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
});
</script>

<style scoped>
</style>