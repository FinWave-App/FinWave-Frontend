<template>
  <div class="panel flex flex-col lg:flex-row">
    <div class="flex flex-col gap-2 flex-1">
      <input class="input input-sm input-bordered" placeholder="Filter by name" v-model.lazy="nameFilter" />
      <div class="overflow-x-auto overflow-y-hidden">
        <table class="table table-sm lg:table-md table-zebra table-pin-rows">
          <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th class="text-right">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users">
            <td> {{user.id}} </td>
            <td> {{user.username}} </td>
            <td class="text-right">
              <edit-button class="btn btn-ghost btn-xs" @event="selectUserToEdit(user.id, user.username)"></edit-button>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="usersCount > countInPage && !nameFilter" class="flex justify-center w-full mt-4">
          <pages-navigation :max-pages="maxPages" :page="page" @change-page="changePage"/>
        </div>
      </div>
    </div>

    <div class="divider h-full lg:divider-horizontal"></div>

    <div class="flex-1 flex flex-col gap-2">
      <div class="form-control">

        <label class="label">
          <span class="label-text">New User</span>
        </label>

        <div class="join flex">
          <input class="input input-bordered join-item w-full" placeholder="Username" v-model="newUsername">
          <input class="input input-bordered join-item w-full" placeholder="Password" type="password" v-model="newUserPassword">
          <button class="btn btn-warning join-item" @click="registerNewUser"> Register </button>
        </div>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Edit {{ editUsername ? editUsername : "User" }}'s Password</span>
        </label>

        <div class="join flex">
          <input class="input input-bordered join-item w-full" disabled placeholder="ID" v-model="editUserId">
          <input class="input input-bordered join-item w-full" placeholder="Password" type="password" v-model="editPassword">
          <button class="btn btn-warning join-item" @click="editUserPassword"> Apply </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import DeleteButton from "~/components/buttons/deleteButton.vue";
import TableEntry from "~/components/transactions/table/tableEntry.vue";
import EditButton from "~/components/buttons/editButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import PagesNavigation from "~/components/buttons/pagesNavigation.vue";

const { $adminApi, $toastsManager } = useNuxtApp();

const countInPage = 5;

const usersCount = $adminApi.getUsersCount();

const page = ref(1);
const maxPages = computed(() => Math.ceil(usersCount.value / countInPage));
const users = ref([]);

const nameFilter = ref(null);

const newUsername = ref(null);
const newUserPassword = ref(null);

const editPassword = ref(null);
const editUserId = ref(null);
const editUsername = ref(null);

const fetchUsers = async () => {
  users.value = await $adminApi.getUsers((page.value - 1) * countInPage, countInPage, nameFilter.value);
}

const changePage = (nextPage) => {
  page.value = nextPage;

  fetchUsers();
}

fetchUsers();

watch(nameFilter, () => {
  page.value = 1;
  fetchUsers();
})

const registerNewUser = () => {
  if (!newUsername.value || !newUserPassword.value) {
    $toastsManager.pushToast("Fill inputs first!", 3000, "error");

    return;
  }

  $adminApi.registerUser(newUsername.value, newUserPassword.value).then((s) => {
    if (s) {
      $toastsManager.pushToast("Registered", 2500, "success");

      newUsername.value = null;
      newUserPassword.value = null;
    }else {
      $toastsManager.pushToast("Fail", 3000, "error");
    }
  });
}

const editUserPassword = () => {
  if (!editUserId.value || !editPassword.value) {
    $toastsManager.pushToast("Fill inputs first!", 3000, "error");

    return;
  }

  $adminApi.changeUserPassword(editUserId.value, editPassword.value).then((s) => {
    if (s) {
      $toastsManager.pushToast("Edited", 2500, "success");

      editUserId.value = null;
      editPassword.value = null;
    }else {
      $toastsManager.pushToast("Fail", 3000, "error");
    }
  });
}

const selectUserToEdit = (userId, username) => {
  editUserId.value = userId;
  editUsername.value = username;

  $toastsManager.pushToast("Selected " + username + " (" + userId + ")", 2500, "warning");
}

</script>

<style scoped>

</style>