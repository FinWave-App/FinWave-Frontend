<template>
  <div>
    <default :opened="typeOpened === 0 || typeOpened === 2 || typeOpened === 3" :transaction="transaction"  @reload-transactions="emit('reloadTransactions')" @close="emit('close')"/>
    <internal :opened="typeOpened === 1" :transaction="transaction" @reload-transactions="emit('reloadTransactions')" @close="emit('close')"/>
  </div>
</template>

<script setup>
import Default from "~/components/modal/transaction/edit/default.vue";
import Internal from "~/components/modal/transaction/edit/internal.vue";

const props = defineProps({
  opened: {
    required: true,
    type: Boolean
  },

  transaction: {
    type: Object
  }
})

const emit = defineEmits(['close', 'reloadTransactions']);

const typeOpened = computed(() => {
  if (!props.opened || !props.transaction)
    return -1;

  return !props.transaction.metadata ? 0 : props.transaction.metadata.type;
})

</script>

<style scoped>

</style>