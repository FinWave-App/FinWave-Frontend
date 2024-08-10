import {useApiLoader} from "#imports";
import {ca} from "date-fns/locale";

export default defineNuxtPlugin(async nuxtApp => {
    try {
        await useApiLoader.fetch();
    }catch (e) {
        console.log(e)
    }

    return useApiLoader.getProvider();
})