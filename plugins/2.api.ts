import {useApiLoader} from "#imports";

export default defineNuxtPlugin(async nuxtApp => {
    await useApiLoader.fetch();

    return useApiLoader.getProvider();
})