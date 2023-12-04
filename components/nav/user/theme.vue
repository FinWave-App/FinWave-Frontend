<template>
  <div class="flex flex-col justify-center items-center">
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="cursor-pointer">
        <theme-icon :theme="currentTheme"/>
      </label>
      <ul tabindex="0" class="dropdown-content z-[2] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <div class="flex gap-2 rounded-xl" :class="{ 'bg-base-200' : currentTheme === 'system' }" @click="currentTheme = 'system'">
            <theme-icon :theme="'system'"/>
            System
          </div>
        </li>
        <li>

          <div class="flex gap-2 rounded-xl" :class="{ 'bg-base-200' : currentTheme === 'dark' }" @click="currentTheme = 'dark'">
            <theme-icon :theme="'dark'"/>
            Dark
          </div>
        </li>
        <li>
          <div class="flex gap-2 rounded-xl" :class="{ 'bg-base-200' : currentTheme === 'light' }" @click="currentTheme = 'light'">
            <theme-icon :theme="'light'"/>
            Light
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>

import Avatar from "~/components/nav/user/avatar.vue";
import ThemeIcon from "~/components/misc/themeIcon.vue";

const getCurrentTheme = () => {
  const theme = document.querySelector('html').getAttribute('data-theme');

  return theme ? theme : "system";
}

const currentTheme = ref(getCurrentTheme());

watch(currentTheme, (value) => {
  if (!value) {
    document.querySelector('html').removeAttribute('data-theme');

    return;
  }

  document.querySelector('html').setAttribute('data-theme', value);
})

</script>

<style scoped>

</style>