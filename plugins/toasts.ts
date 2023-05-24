import {ToastsManager} from "~/libs/toast/ToastsManager";

export default defineNuxtPlugin(async nuxtApp => {
    const toastsManager = new ToastsManager();

    return {
        provide: { toastsManager }
    }
})