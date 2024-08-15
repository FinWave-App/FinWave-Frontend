<template>
  <div class="flex flex-col justify-center items-center">
    <div class="dropdown dropdown-bottom dropdown-hover">
      <div tabindex="0" role="button" class="cursor-pointer size-10 flex justify-center items-center">
        <theme-icon :theme="currentTheme"/>
      </div>
      <ul tabindex="0" class="dropdown-content z-[2] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li @click="handleClick">
          <div class="flex gap-2 rounded-xl" :class="{ 'bg-base-200' : currentTheme === 'system' }" @click="currentTheme = 'system'">
            <theme-icon :theme="'system'"/>

            {{ $t("navigation.themes.system") }}
          </div>
        </li>
        <li @click="handleClick">

          <div class="flex gap-2 rounded-xl" :class="{ 'bg-base-200' : currentTheme === 'dark' }" @click="currentTheme = 'dark'">
            <theme-icon :theme="'dark'"/>

            {{ $t("navigation.themes.dark") }}
          </div>
        </li>
        <li @click="handleClick">
          <div class="flex gap-2 rounded-xl" :class="{ 'bg-base-200' : currentTheme === 'light' }" @click="currentTheme = 'light'">
            <theme-icon :theme="'light'"/>

            {{ $t("navigation.themes.light") }}
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

const handleClick = () => {
  const elem = document.activeElement;
  if (elem) {
    elem?.blur();
  }
};

</script>

<style scoped>

</style>