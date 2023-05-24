import {ServerConfigs} from "~/libs/config/ServerConfigs";
import {useCookie} from "#app";
import {useCache} from "#imports";

export class ConfigManager {
    private _configs : ServerConfigs | null = null;
    private hash: string | null = null;
    private _serverAvailable : boolean = false;

    async init(): Promise<void> {
        const {data: hash, error} = await useApi<string>("configs/hash");

        if (error.value !== null)
            return;

        this._serverAvailable = true;

        const cachedHash = useCache.get<string>("configs_hash")
        const cachedConfigs = useCache.get<ServerConfigs>("configs");

        if (cachedConfigs.value !== undefined && cachedHash.value === hash.value) {
            this._configs = cachedConfigs.value;
            this.hash = cachedHash.value;

            return;
        }

        const {data: configs} = await useApi<ServerConfigs>("configs/get");

        useCache.set("configs", JSON.stringify(configs.value));
        useCache.set("configs_hash", hash.value);

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