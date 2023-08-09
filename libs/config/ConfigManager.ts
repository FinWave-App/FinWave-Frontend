import {ServerConfigs} from "~/libs/config/ServerConfigs";
import {useCookie} from "#app";
import {useStorage} from "#imports";

export class ConfigManager {
    private _configs : ServerConfigs | null = null;
    private hash: string | null = null;
    private _serverAvailable : boolean = false;

    async init(): Promise<void> {
        const {data: hash, error} = await useApi<string>("configs/hash");

        if (error.value !== null)
            return;

        this._serverAvailable = true;

        const cachedHash = useStorage.get<string>("configs_hash")
        const cachedConfigs = useStorage.get<ServerConfigs>("configs");

        if (cachedConfigs !== undefined && cachedHash === hash.value) {
            this._configs = cachedConfigs;
            this.hash = cachedHash;

            return;
        }

        const {data: configs} = await useApi<ServerConfigs>("configs/get");

        useStorage.set("configs", JSON.stringify(configs.value));
        useStorage.set("configs_hash", hash.value);

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