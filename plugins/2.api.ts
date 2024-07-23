import {useApiLoader} from "#imports";

export default defineNuxtPlugin(async nuxtApp => {
    await useApiLoader.fetch();

    useApiLoader.connectWebsocket();

    return useApiLoader.getProvider();
})