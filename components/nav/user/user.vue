<template>
  <div class="flex flex-col justify-center items-center">
    <div class="dropdown dropdown-end dropdown-hover">
      <div tabindex="0" role="button" class="cursor-pointer m-1">
        <avatar :avatar-letter="avatarLetter" :username="username"/>
      </div>
      <ul tabindex="0" class="dropdown-content z-[2] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li v-if="adminAllowed" @click="handleClick">
          <nuxt-link to="admin">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>

            {{ $t("navigation.userButtons.admin") }}
          </nuxt-link>
        </li>
        <li @click="handleClick">
          <a @click="changePasswordOpened = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>

            {{ $t("navigation.userButtons.changePassword") }}
          </a>
        </li>
        <li @click="handleClick">
          <a @click="sessionsOpened = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>

            {{ $t("navigation.userButtons.sessions") }}
          </a>
        </li>
        <li @click="handleClick">
          <a @click="notificationsOpened = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
            </svg>

            {{ $t("navigation.userButtons.notifications") }}
          </a>
        </li>
        <li @click="handleClick">
          <a @click="logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>

            {{ $t("navigation.userButtons.logout") }}
          </a>
        </li>
      </ul>
    </div>

    <modal-user-change-password :opened="changePasswordOpened" @close="changePasswordOpened = false"/>
    <modal-user-sessions :opened="sessionsOpened" @close="sessionsOpened = false"/>
    <modal-notifications-points-view :opened="notificationsOpened" @close="notificationsOpened = false"/>
  </div>
</template>

<script setup>
import Avatar from "~/components/nav/user/avatar.vue";

const { $userApi, $adminApi } = useNuxtApp();

const adminAllowed = $adminApi.getAllowed();

const username = $userApi.getUsername();
const avatarLetter = username.value.charAt(0).toUpperCase();

const changePasswordOpened = ref(false);
const sessionsOpened = ref(false);
const notificationsOpened = ref(false);

const logout = () => {
  $userApi.logout();
}

const handleClick = () => {
  const elem = document.activeElement;
  if (elem) {
    elem?.blur();
  }
};

</script>

<style scoped>

</style>