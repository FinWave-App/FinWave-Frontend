import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";

export class ServerApi extends AbstractApi {
    private version: Ref<string | null> = ref(null);

    async init(): Promise<void | boolean> {
        const {data, error} = await useApi<any>("/server/getVersion");

        if (data.value === null || error.value)
            return false;

        this.version.value = data.value.version;
    }

    public getVersion(): Ref<string | null> {
        return this.version;
    }
}