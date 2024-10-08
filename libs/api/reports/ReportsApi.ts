import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";
import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import {useServer} from "~/composables/useServer";

export class ReportsApi extends AbstractApi {
    private notifyListeners : Array<Function> = new Array<Function>();

    public updateNotify() {
        this.notifyListeners.forEach(func => func());
    }

    public registerUpdateListener(func : Function) : void {
        this.notifyListeners.push(func);
    }

    async init(): Promise<void | boolean> {
    }

    public async getReports(): Promise<any> {
        const opts = {
            method: "GET",
            params: {}
        };

        const {data, error} = await useApi<any>("/user/reports/getList", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value?.reports;
    }

    public async newReport(filter: TransactionsFilter | null, description: string | null, type: number, lang: any): Promise<any> {
        const opts = {
            method: "POST",
            body: {
                description: description,
                filter: filter,
                type: type,
                lang: lang
            }
        };

        const {data, error} = await useApi<any>("/user/reports/new", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value;
    }

    public getDownloadURL(fileId: string) : string {
        const config = useRuntimeConfig();

        return useServer.getUrl() + "files/download?fileId=" + fileId;
    }
}