<template>
  <div role="tablist" class="tabs tabs-lifted">
    <a v-for="(item, index) in tabs"
       role="tab"
       class="tab flex-1"
       :class="{ 'tab-active' : index === modelValue }"
       @click="tabSelected(index)">

      {{ item }}
    </a>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number
  },

  tabs: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const tabSelected = (tab) => {
  emit('update:modelValue', tab);
}

</script>

<style scoped>

</style>