import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";

export class TransactionsApi {
    async init(): Promise<void> {

    }

    public async newTransaction(tagId: number, accountId: number, createdAt: Date, delta: number, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                tagId: tagId,
                accountId: accountId,
                createdAt: createdAt.toISOString(),
                delta: delta
            }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {error} = await useApi("/user/transactions/new", opts);

        return error.value === null;
    }

    public async deleteTransaction(transactionId: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                transactionId: transactionId
            }
        };

        const {error} = await useApi("/user/transactions/delete", opts);

        return error.value === null;
    }

    public async editTransaction(transactionId: number, tagId: number, accountId: number, createdAt: Date, delta: number, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                transactionId: transactionId,
                tagId: tagId,
                accountId: accountId,
                createdAt: createdAt.toISOString(),
                delta: delta
            }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {error} = await useApi("/user/transactions/edit", opts);

        return error.value === null;
    }

    public async getTransactions(offset: number, count: number, filter: TransactionsFilter | null): Promise<any> {
        const filt = filter !== null ? {
            tagsIds: filter.tagsIds && filter.tagsIds.length > 0 ? filter.tagsIds.toString() : undefined,
            accountsIds: filter.accountsIds && filter.accountsIds.length > 0 ? filter.accountsIds.toString() : undefined,
            currenciesIds: filter.currenciesIds && filter.currenciesIds.length > 0 ? filter.currenciesIds.toString() : undefined,
            fromTime: filter.fromTime ? filter.fromTime.toISOString() : undefined,
            toTime: filter.toTime ? filter.toTime.toISOString() : undefined,
            description: filter.description && filter.description.length > 0 ? filter.description : undefined
        } : {};

        const opts = {
            method: "GET",
            params: {
                offset: offset,
                count: count,
                ...filt
            }
        };

        const {data, error} = await useApi<any>("/user/transactions/getList", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value?.transactions;
    }
}