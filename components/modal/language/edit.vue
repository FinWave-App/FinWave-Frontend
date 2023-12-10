<template>
  <modal-base :title="$t('modals.editLanguage.title')" :opened="opened" :name="'language-edit-modal'">
    <div class="w-full flex flex-col gap-2">

      <div class="flex gap-2 w-full">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">{{ $t('modals.editLanguage.placeholders.language') }}</span>
          </label>

          <select-lang />

        </div>
      </div>
    </div>

    <div class="modal-action">
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.cancel') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, locale } = useI18n();

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

</script>

<style scoped>

</style>