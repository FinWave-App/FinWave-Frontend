import {useApiLoader} from "#imports";

export default defineNuxtPlugin(async nuxtApp => {
    const {$auth} = nuxtApp;

    await useApiLoader.fetch();

    watch($auth.state().authed, async (selection, prevSelection) => {
        if (selection)
            await useApiLoader.fetch();
    });

    return useApiLoader.getProvider();
})