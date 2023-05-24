<template>
  <Teleport to="body">
    <input type="checkbox" :id="name" class="modal-toggle" :checked="opened" />
    <div class="modal modal-bottom sm:modal-middle">
      <div v-if="title.length > 0" class="modal-box p-0">
        <div class="px-6 pt-4 pb-2 border-b font-bold text-lg">
          {{ title }}
        </div>
        <div class="p-6 pt-4">
          <slot>
          </slot>
        </div>
      </div>
      <div v-else class="modal-box">
        <slot>
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },

  title: {
    type: String,
    default: ""
  },

  opened: {
    type: Boolean,
    required: true
  },
})

</script>

<style scoped>

</style>