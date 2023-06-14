import {useLazyFetch} from "#app";

export const useLazyApi = function <T> (request : any, opts : any = {}) {
    const config = useRuntimeConfig()
    const auth = useNuxtApp().$auth.state();

    if (auth.authed.value) {
        opts.headers = opts.headers || {}
        opts.headers.authorization = 'Bearer ' + auth.token;
    }

    return useLazyFetch<T>(request, { baseURL: config.public.baseURL, ...opts })
}