<template>
  <div class="navbar bg-base-100 shadow">
    <div class="navbar-start gap-2">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </label>

        <nav-menu tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 px-2 gap-1 shadow bg-base-100 rounded-box w-52 z-10">
        </nav-menu>
      </div>

      <div class="normal-case text-xl font-bold flex items-start gap-1 ml-2">
        FinWave
        <div class="badge badge-info badge-sm font-normal">Beta</div>
      </div>
    </div>

    <div class="navbar-center">
      <div class="hidden lg:flex w-full">
        <nav-menu class="menu menu-horizontal px-1">
        </nav-menu>
      </div>
    </div>

    <div class="navbar-end mr-4">
      <user/>
    </div>
  </div>
</template>

<script>
import User from "~/components/nav/user/user.vue";

export default {
  name: "navigation",
  components: {User}
}
</script>

<style scoped>

</style>