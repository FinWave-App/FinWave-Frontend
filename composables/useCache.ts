import {useCookie} from "#app";
import {Ref} from "vue";

export const useCache = new class CacheEngine {
    public get <T> (key: string) : Ref<T | undefined> {
        return useCookie<T | undefined>("cache_" + key);
    }

    public set <T> (key: string, value: T) {
        const raw = useCookie<T | undefined>("cache_" + key);

        raw.value = value;
    }
}