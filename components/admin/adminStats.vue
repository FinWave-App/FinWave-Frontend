<template>
  <div class="stats stats-vertical shadow">

    <div class="stat">
      <div class="stat-title">Users Count</div>
      <div class="stat-value">{{usersCount}}</div>
    </div>

    <div class="stat">
      <div class="stat-title">Active Users Count</div>
      <div class="stat-value">{{activeUsersCount}}</div>
    </div>

    <div class="stat">
      <div class="stat-title">Transactions Count</div>
      <div class="stat-value">{{transactionsCount}}</div>
    </div>
  </div>
</template>

<script setup>

const { $adminApi } = useNuxtApp();

const usersCount = $adminApi.getUsersCount();
const activeUsersCount = $adminApi.getActiveUsersCount();
const transactionsCount = $adminApi.getTransactionsCount();

</script>

<style scoped>

</style>