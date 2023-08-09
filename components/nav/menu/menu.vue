<template>
  <ul class="gap-2 px-1">
    <nav-menu-entry v-for="item in items" :entry="item">
    </nav-menu-entry>
  </ul>
</template>

<script setup>

const items = computed(() => {
  return [
    {
      text: "navigation.main",
      url: "/"
    },
    {
      text: "navigation.tags",
      url: "/tags"
    },
    {
      text: "navigation.transactions",
      url: "/transactions"
    },
    {
      text: "navigation.currencies",
      url: "/currencies"
    },
    {
      text: "navigation.analytics",
      url: "/analytics"
    }
  ];
});
/*
  return [
    {
      text: "Test 1",
      subMenu: [

      ]
    },
    {
      text: "Test 1",
      subMenu: [
        {
          text: "Test 1",
          subMenu: [
            {
              text: "Test 11",
              url: "/register"
            },
            {
              text: "Test 12",
              url: "/123"
            }
          ]
        },
        {
          text: "Test 12",
          url: "/123"
        }
      ]
    },

    {
      text: "Test 3",
      url: "/login"
    }
  ]
 */

</script>

<style scoped>

</style>