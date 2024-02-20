import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class TransactionsApi extends AbstractApi {
    async init(): Promise<void | boolean> {

    }

    public async newBulkTransaction(transactions : any) : Promise<boolean> {
        const opts = {
            method: "POST",
            body: {
                entries: transactions.map(t => {
                    if (t.description === null) t.description = undefined;
                    t._id = undefined;

                    return t;
                })
            }
        };

        const {error} = await useApi("/user/transactions/newBulk", opts);

        return error.value === null;
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

    public async newInternalTransfer(tagId: number, fromAccountId: number, toAccountId: number, createdAt: Date, fromDelta: number, toDelta: number, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                tagId: tagId,
                fromAccountId: fromAccountId,
                toAccountId: toAccountId,
                createdAt: createdAt.toISOString(),
                fromDelta: fromDelta,
                toDelta: toDelta
            }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {error} = await useApi("/user/transactions/newInternal", opts);

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

    public async getTransactionsCount(filter: TransactionsFilter | null): Promise<number> {
        const opts = {
            method: "GET",
            params: filter?.toOptions()
        };

        const {data, error} = await useApi<any>("/user/transactions/getCount", opts);

        if (error.value !== null) {
            return 0;
        }

        return data.value?.count;
    }

    public async getTransactions(offset: number, count: number, filter: TransactionsFilter | null): Promise<any> {
        const opts = {
            method: "GET",
            params: {
                offset: offset,
                count: count,
                ...filter?.toOptions()
            }
        };

        const {data, error} = await useApi<any>("/user/transactions/getList", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value?.transactions;
    }


}