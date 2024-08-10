import {useServer} from "~/composables/useServer";

export const useApi = async function <T>(request: any, opts: any = {}) {
    const config = useRuntimeConfig()
    const auth = useNuxtApp().$auth.state();

    if (auth.authed.value) {
        opts.headers = opts.headers || {}
        opts.headers.Authorization = 'Bearer ' + auth.token;
    }

    let error = null;
    let data = null;

    await $fetch<T>(request, {baseURL: useServer.getUrl(), ...opts})
        .catch(e => error = e)
        .then(r => data = r);

    return {data: ref(data), error: ref(error)};
}