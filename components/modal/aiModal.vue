<template>
  <modal-base :title="$t('modals.ai.title')" :opened="opened" :name="'ai-modal'"
              :modal-class="'modal-center sm:modal-middle'"
              :modal-box-class="'sm:max-w-5xl'">

    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="emit('close')">✕</button>
    </form>

    <ai-dialog @change-screen="emit('changeScreen')" :limited-bubble-width="false">

    </ai-dialog>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'changeScreen'])

const { t, locale } = useI18n();
</script>

<style scoped>

</style>