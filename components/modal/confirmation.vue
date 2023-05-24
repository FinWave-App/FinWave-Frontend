<template>
  <modal-base :title="title" :name="name" :opened="opened">
    <slot>
    </slot>

    <div class="modal-action">
      <button @click="deny" class="btn btn-ghost">{{ $t('modals.buttons.deny') }}</button>
      <button @click="confirm" class="btn" :class="'btn-' + confirmStyle">{{ $t('modals.buttons.confirm') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
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

  confirmStyle: {
    type: String,
    default: "success"
  }
})

const emit = defineEmits(['confirm', 'deny'])

const confirm = () => {
  emit('confirm');
}

const deny = () => {
  emit('deny');
}

</script>

<style scoped>

</style>