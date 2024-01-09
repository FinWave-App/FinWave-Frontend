import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";

export class AccumulationsApi extends AbstractApi {
    private accumulationsMap: Ref<Map<number, any>> = ref(new Map<number, any>);

    async init(): Promise<void | boolean> {
        await this.fetchMap();
    }

    protected async fetchMap() : Promise<void> {
        const {data} = await useApi<any>("/user/accumulations/getList");

        if (data.value === null)
            return;

        const newMap = new Map<number, any>();

        data.value.accumulations.forEach((accumulation) => {
            newMap.set(accumulation.sourceAccountId, accumulation);
        })

        this.accumulationsMap.value = newMap;
    }

    public async setAccumulation(accumulation: any) {
        const opts = {
            method: "POST",
            body: accumulation
        };

        const { error } = await useApi("/user/accumulations/set", opts);

        if (error.value !== null) {
            return false;
        }

        this.accumulationsMap.value.set(accumulation.sourceAccountId, accumulation);

        return true;
    }

    public getAccumulationMap(): Ref<Map<number, any>> {
        return this.accumulationsMap;
    }

    public async removeAccumulation(accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId}
        };

        const { error } = await useApi("/user/accumulations/remove", opts);

        if (error.value !== null) {
            return false;
        }

        this.accumulationsMap.value.delete(accountId);

        return true;
    }

}