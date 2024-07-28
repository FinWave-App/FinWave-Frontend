import {useServer} from "~/composables/useServer";

export const useApi = function <T> (request : any, opts : any = {}) {
    const config = useRuntimeConfig()
    const auth = useNuxtApp().$auth.state();

    if (auth.authed.value) {
        opts.headers = opts.headers || {}
        opts.headers.Authorization = 'Bearer ' + auth.token;
    }

    return useFetch<T>(request, { baseURL: useServer.getUrl(), ...opts })
}