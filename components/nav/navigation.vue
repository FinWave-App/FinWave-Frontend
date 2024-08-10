<template>
  <div class="navbar bg-base-100 shadow max-w-full">
    <div class="navbar-start gap-2">
      <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button" class="btn btn-ghost 2xl:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </div>

        <nav-menu tabindex="0" class="menu menu-compact dropdown-content p-2 px-2 gap-1 shadow bg-base-100 rounded-box w-52 z-[2]">
        </nav-menu>
      </div>

      <modal-ai-modal :opened="aiModal" @close="aiModal = false" @change-screen="" />

      <div class="normal-case text-xl font-bold flex items-start gap-1 ml-2">
        <div class="flex justify-center items-center gap-2">
          <img src="/public/favicon.ico" class="h-12">
          FinWave
        </div>

        <div v-if="!demoMode" class="badge badge-info badge-sm font-normal">Beta</div>
        <div v-else class="badge badge-error badge-sm font-bold">Demo</div>
      </div>
    </div>

    <div class="navbar-center">
      <div class="hidden 2xl:flex w-full">
        <nav-menu class="menu menu-horizontal px-1">
        </nav-menu>
      </div>
    </div>

    <div class="navbar-end mr-4 gap-3">
      <details v-if="aiAvailable" class="hidden lg:block dropdown dropdown-bottom dropdown-end min-w-fit">
        <summary class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-1 -1 26 26" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </summary>

        <ai-dialog v-if="!aiModal" class="text-sm dropdown-content bg-base-200 bg-opacity-70 backdrop-blur rounded-box z-50 w-96 min-h-96 max-h-screen p-2 shadow-xl"/>
      </details>

      <theme/>
      <user :aiAvailable="aiAvailable" @callAi="aiModal = true"/>
    </div>
  </div>
</template>

<script setup>

import Theme from "~/components/nav/user/theme.vue";
import User from "~/components/nav/user/user.vue";

const { $serverConfigs } = useNuxtApp();
const configs = $serverConfigs.configs;
const demoMode = configs.users.demoMode;

const aiModal = ref(false);
const aiAvailable = configs.ai.enabled;

</script>

<style scoped>

</style>