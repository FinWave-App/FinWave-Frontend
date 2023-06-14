<template>
  <div class="collapse bg-base-100">
    <input type="checkbox" />
    <div class="collapse-title text-xl font-medium">
      <div class="flex flex-row gap-2">
        <p>
          {{treeEntry.tag.name}}
        </p>
        <p class="opacity-80">
          {{treeEntry.tag.tagId}}
        </p>
      </div>
    </div>
    <div class="collapse-content bg-base-300">
      {{treeEntry.tag}}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  treeEntry: {
    required: true
  }
})
</script>

<style scoped>

</style>