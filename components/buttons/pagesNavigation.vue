<template>
  <div class="join">
    <button :class="{'btn-active' : page === 1}" class="join-item btn" @click="changePage(1)"> 1 </button>

    <button v-if="1 - page < -3" class="join-item btn btn-disabled">...</button>
    <button v-else-if="1 - page < -2" class="join-item btn" @click="changePage(2)"> {{ 2 }}</button>

    <button v-if="page - 1 > 1" class="join-item btn" @click="changePage(page - 1)"> {{ page - 1 }}</button>
    <button v-if="page !== 1 && page !== maxPages" class="join-item btn btn-active">{{ page }}</button>
    <button v-if="page + 1 < maxPages" class="join-item btn" @click="changePage(page + 1)"> {{ page + 1 }}</button>

    <button v-if="maxPages - page > 3" class="join-item btn btn-disabled">...</button>
    <button v-else-if="maxPages - page > 2" class="join-item btn" @click="changePage(maxPages - 1)"> {{ maxPages - 1 }}</button>

    <button :class="{'btn-active' : page === maxPages}" v-if="maxPages > 1" class="join-item btn" @click="changePage(maxPages)"> {{ maxPages }} </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['changePage']);

const props = defineProps({
  page: {
    required: true,
    type: Number
  },

  maxPages: {
    required: true,
    type: Number
  }
});

const changePage = (page) => {
  emit('changePage', page)
}
</script>


<style scoped>

</style>