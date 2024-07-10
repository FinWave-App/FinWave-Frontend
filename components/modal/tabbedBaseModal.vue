<template>
  <Teleport to="body">
    <input type="checkbox" :id="name" class="modal-toggle" :checked="opened" />
    <div class="modal" :class="modalClass">
      <div v-if="title.length > 0" class="modal-box p-0" :class="modalBoxClass">
        <div class="px-6 pt-4 pb-2 font-bold text-lg">
          {{ title }}
        </div>

        <misc-tab class="w-full overflow-hidden" :tabs="tabs" :model-value="tab" @update:model-value="t => emit('update:tab', t)"/>

        <div class="p-6 pt-4">
          <slot>
          </slot>
        </div>
      </div>
      <div v-else class="modal-box" :class="modalBoxClass">
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

  modalBoxClass: {
    type: String,
    default: ""
  },

  modalClass: {
    type: String,
    default: "modal-top sm:modal-middle"
  },

  tabs: {
    type: Array
  },

  tab: {
    type: Number
  }
})

const emit = defineEmits(['update:tab'])

</script>

<style scoped>

</style>