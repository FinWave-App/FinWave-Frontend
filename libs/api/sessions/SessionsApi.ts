import {TransactionsFilter} from "~/libs/api/transactions/TransactionsFilter";

export class SessionsApi {
    async init(): Promise<void> {

    }

    public async getSessions(): Promise<any> {
        const opts = {
            method: "GET",
            params: {}
        };

        const {data, error} = await useApi<any>("/user/sessions/getList", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value?.sessions;
    }

    public async newSession(lifetimeDays: number, description: string | null): Promise<any> {
        const opts = {
            method: "POST",
            params: {
                lifetimeDays: lifetimeDays
            }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {data, error} = await useApi<any>("/user/sessions/new", opts);

        if (error.value !== null)
            return false;

        return data.value?.token;
    }

    public async deleteSession(sessionId: number): Promise<any> {
        const opts = {
            method: "POST",
            params: {
                sessionId: sessionId
            }
        };

        const {error} = await useApi<any>("/user/sessions/delete", opts);

        return error.value === null;
    }
}