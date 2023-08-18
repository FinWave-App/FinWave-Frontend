<template>
  <div class="flex gap-2 items-center">
    <div class="avatar placeholder">
      <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
        <span class="text-xs font-bold"> {{ avatarLetter }} </span>
      </div>
    </div>

    <p class=" font-bold">
      {{ username }}
    </p>
  </div>
</template>

<script setup>

const props = defineProps({
  username: {
    required: true,
    type: String
  },

  avatarLetter: {
    required: true,
    type: String
  }
})
</script>

<style scoped>

</style>