<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content text-center w-full flex-col">
      <div class="max-w-md border-error border-2 rounded-2xl p-4">
        <h1 class="text-5xl font-bold text-error">
          {{ $t("errorPage.title") }}
        </h1>
        <p class="py-6">
          {{ $t("errorPage.description") }}
        </p>
        <a href="/" class="btn btn-neutral">{{ $t("errorPage.tryAgain") }}</a>
      </div>

      <server-changer v-if="server.allowCustomUrl()" class="panel lg:w-1/3" @serverChanged="reloadPage"/>
    </div>
  </div>
</template>

<script setup>
import {useServer} from "~/composables/useServer";

definePageMeta({
  middleware: [
    "server-not-available"
  ],
  layout: false,
});

const server = useServer;

const reloadPage = () => {
  window.location.reload();
}


</script>

<style scoped>
</style>