import {ServerConfigs} from "~/libs/config/ServerConfigs";
import {useCookie} from "#app";
import {useStorage} from "@vueuse/core";

export class ConfigManager {
    private _configs : ServerConfigs | null = null;
    private hash: string | null = null;
    private _serverAvailable : boolean = false;

    async init(): Promise<void> {
        const {data: hash, error} = await useApi<string>("configs/hash");

        if (error.value !== null)
            return;

        this._serverAvailable = true;

        const cachedHash = useStorage("configs_hash", "").value
        const cachedConfigs = useStorage("configs", {}).value;

        if (cachedConfigs !== undefined && cachedHash === hash.value) {
            this._configs = cachedConfigs;
            this.hash = cachedHash;

            return;
        }

        const {data: configs} = await useApi<ServerConfigs>("configs/get");

        useStorage("configs", {}).value = configs.value;
        useStorage("configs_hash", "").value = hash.value;

        this._configs = configs.value;
        this.hash = hash.value;
    }


    get configs(): ServerConfigs | null {
        return this._configs;
    }

    get serverAvailable(): boolean {
        return this._serverAvailable;
    }
}