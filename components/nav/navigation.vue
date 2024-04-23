<template>
  <div class="navbar bg-base-100 shadow">
    <div class="navbar-start gap-2">
      <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button" class="btn btn-ghost xl:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </div>

        <nav-menu tabindex="0" class="menu menu-compact dropdown-content p-2 px-2 gap-1 shadow bg-base-100 rounded-box w-52 z-[2]">
        </nav-menu>
      </div>

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
      <div class="hidden xl:flex w-full">
        <nav-menu class="menu menu-horizontal px-1">
        </nav-menu>
      </div>
    </div>

    <div class="navbar-end mr-4 gap-3">
      <theme/>
      <user/>
    </div>
  </div>
</template>

<script setup>

import Theme from "~/components/nav/user/theme.vue";
import User from "~/components/nav/user/user.vue";

const { $serverConfigs } = useNuxtApp();
const configs = $serverConfigs.configs.users;
const demoMode = configs.demoMode;

</script>

<style scoped>

</style>