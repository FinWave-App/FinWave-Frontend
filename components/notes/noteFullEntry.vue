<template>
  <div class="flex gap-2 flex-col">
    <div class="flex justify-between items-center gap-2">
      <div class="flex gap-2">
        <p class="text-xs opacity-60 w-fit whitespace-nowrap text-center">
          {{ new Date(entry.lastEdit).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}
        </p>
        <p v-if="entry.notificationTime"
           class="text-xs w-fit whitespace-nowrap text-center"
           :class="notificationTimeColor"
        >
          {{ new Date(entry.notificationTime).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}
        </p>
      </div>

      <div class="flex gap-1">
        <edit-button class="btn btn-xs btn-ghost m-0 p-0.5" @click="emit('edit')"/>
        <delete-button class="btn btn-xs btn-ghost m-0 p-0.5" @click="emit('delete')"/>
      </div>
    </div>

    <p>
      {{ entry.text }}
    </p>
  </div>
</template>

<script setup>
import DeleteButton from "~/components/buttons/deleteButton.vue";
import EditButton from "~/components/buttons/editButton.vue";

const emit = defineEmits(['edit', 'delete'])

const props = defineProps({
  entry: {
    required: true
  }
})

const {t, locale } = useI18n();

const notificationDelta = computed(() => props.entry.notificationTime ? Math.max(new Date(props.entry.notificationTime).getTime() - new Date().getTime(), 0) : -1);
const notificationTimeColor = computed(() => notificationDelta.value > 0 ? (notificationDelta.value / 86400000 < 1 ? 'text-error' : 'text-warning') : "");

</script>

<style scoped>

</style>