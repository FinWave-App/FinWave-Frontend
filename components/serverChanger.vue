<template>
  <div>
    <p class="font-bold text-xl text-center">Server</p>
    <div class=" w-full mt-4">
      <input type="text" autocomplete="server" v-model="newServerUrl" class="input input-bordered w-full join-item" />
    </div>

    <button class="btn w-full btn-warning mt-8" @click="changeServer(newServerUrl)">Change Server</button>
  </div>
</template>

<script setup>
import {useServer} from "~/composables/useServer";

const server = useServer;

const newServerUrl = ref(server.getUrl())

const emit = defineEmits(['serverChanged'])

const changeServer = (newUrl) => {
  server.setUrl(newUrl);

  emit('serverChanged');
}

</script>

<style scoped>

</style>