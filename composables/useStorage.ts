import {useCookie} from "#app";
import {Ref} from "vue";

export const useStorage = new class StorageEngine {
    public get <T> (key: string) : T | undefined {
        return useCookie<T | undefined>("cache_" + key).value;
    }

    public getOrDefault <T> (key: string, defaultValue: T) : T {
        const result = this.get<T>(key);

        return result ? result : defaultValue;
    }

    public set <T> (key: string, value: T) {
        const raw = useCookie<T | undefined>("cache_" + key);

        raw.value = value;
    }
}