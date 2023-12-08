import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class AnalyticsApi extends AbstractApi {
    async init(): Promise<void | boolean> {

    }

    public async getAnalyticsByMonths(filter: TransactionsFilter | null): Promise<any> {
        const opts = {
            method: "GET",
            params: filter?.toOptions()
        };

        const {data, error} = await useApi<any>("/user/analytics/getByMonths", opts);

        if (error.value !== null) {
            return null;
        }

        return new Map(Object.entries(data.value.total));
    }

    public async getAnalyticsByDays(filter: TransactionsFilter | null): Promise<any> {
        const opts = {
            method: "GET",
            params: filter?.toOptions()
        };

        const {data, error} = await useApi<any>("/user/analytics/getByDays", opts);

        if (error.value !== null) {
            return null;
        }

        return new Map(Object.entries(data.value.total));
    }
}