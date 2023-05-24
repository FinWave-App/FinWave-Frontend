import {AuthManager} from "~/libs/auth/AuthManager";

export default defineNuxtPlugin(async nuxtApp => {
    const auth = new AuthManager();

    await auth.init();

    return {
        provide: {auth}
    }
})