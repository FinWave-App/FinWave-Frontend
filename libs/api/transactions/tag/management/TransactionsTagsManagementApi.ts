import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";

export class TransactionsTagsManagementApi extends AbstractApi {
    private managements : Ref<Array<any>> = ref([]);
    private tagToManagementsMap : Ref<Map<number, Array<any>>> = ref(new Map<number, Array<any>>);
    private managementsMap : Ref<Map<number, any>> = ref(new Map<number, any>());

    async init(): Promise<void | boolean> {
        await this.fetch();
    }

    public async fetch() : Promise<void> {
        const {data} = await useApi<any>("/user/transactions/tags/management/getList");

        if (data.value === null)
            return;

        this.managements.value = data.value.managements || [];

        this.rebuildMap();
    }

    private rebuildMap() {
        const newMap = new Map<number, Array<any>>();
        const map2 = new Map<number, any>();

        this.managements.value.forEach((management) => {
            if (!newMap.has(management.tagId))
                newMap.set(management.tagId, new Array<any>());

            newMap.get(management.tagId)?.push(management);
            map2.set(management.managementId, management);
        })

        this.tagToManagementsMap.value = newMap;
        this.managementsMap.value = map2;
    }

    public getManagements(): Ref<Array<any>> {
        return this.managements;
    }

    public getManagementsMap(): Ref<Map<number, any>> {
        return this.managementsMap;
    }

    public getTagToManagementsMap(): Ref<Map<number, Array<any>>> {
        return this.tagToManagementsMap;
    }

    public async addManagement(tagId : number, currencyId: number, dateType: number, amount: number) : Promise<number> {
        const opts = {
            method: "POST",
            params: {
                tagId: tagId,
                currencyId: currencyId,
                dateType: dateType,
                amount: amount
            }
        }

        const {data: newManagement, error} = await useApi<any>("/user/transactions/tags/management/add", opts);

        if (error.value !== null) {
            return -1;
        }

        this.managements.value?.push({
            managementId: newManagement.value.managementId,
            tagId: tagId,
            currencyId: currencyId,
            dateType: dateType,
            amount: amount
        });

        this.rebuildMap();

        return newManagement.value.managementId;
    }

    public async editManagement(managementId: number, tagId : number, currencyId: number, dateType: number, amount: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                managementId: managementId,
                tagId: tagId,
                currencyId: currencyId,
                dateType: dateType,
                amount: amount
            }
        }

        const {error} = await useApi("/user/transactions/tags/management/edit", opts);

        if (error.value !== null)
            return false;

        const saved = this.managements.value?.find(m => m.managementId === managementId);

        saved.tagId = tagId;
        saved.currencyId = currencyId;
        saved.dateType = dateType;
        saved.amount = amount;

        return true;
    }

    public async removeManagement(managementId: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                managementId: managementId
            }
        };

        const {error} = await useApi("/user/transactions/tags/management/remove", opts);

        if (error.value !== null) {
            return false;
        }

        this.managements.value = this.managements.value.filter((m) => m.managementId != managementId);
        this.rebuildMap();

        return true;
    }
}