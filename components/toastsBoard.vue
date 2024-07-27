<template>
  <div class="toast toast-top toast-end z-50">
    <TransitionGroup name="alerts">
      <div class="alert shadow-lg" v-for="toast in toasts" :key="toast" :class="'alert-' + toast.type">
        <div class="flex justify-between">
          <div class="flex gap-2">
            <svg v-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <svg v-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <svg v-if="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

            <p class="text-wrap">{{ toast.text }}</p>
          </div>

          <button v-if="toast.canHide" class="btn btn-xs btn-circle btn-ghost" @click="closeToast(toast)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>

const { $toastsManager } = useNuxtApp();

const toasts = $toastsManager.getToasts();
const closeToast = (t) => {
  $toastsManager.removeToast(toRaw(t));
}

</script>

<style scoped>
.alerts-move,
.alerts-enter-active,
.alerts-leave-active {
  transition: all 0.5s ease;
}
.alerts-enter-from,
.alerts-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.alerts-leave-active {
  @apply w-max;
  position: absolute;
}
</style>