<template>
  <div class="tabs">
    <div v-for="(item, index) in tabs"
       class="tab tab-lifted flex-1"
       :class="{ 'tab-active' : index === modelValue }"
       @click="tabSelected(index)">

      {{ item }}
    </div>
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