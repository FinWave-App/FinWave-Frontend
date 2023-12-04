import {Ref} from "vue";
import {password} from "iron-webcrypto";

export class AdminApi {
    private allowed: Ref<Boolean> = ref(false);
    private usersCount: Ref<number> = ref(0);
    private activeUsersCount: Ref<number> = ref(0);
    private transactionsCount: Ref<number> = ref(0);

    async init(): Promise<void> {
        const {error} = await useApi("/admin/check");

        if (error.value)
            return;

        this.allowed.value = true;

        let data = (await useApi<any>("/admin/getUsersCount")).data;
        this.usersCount.value = data.value ? data.value.count : 0;

        data = (await useApi<any>("/admin/getActiveUsersCount")).data;
        this.activeUsersCount.value = data.value ? data.value.count : 0;

        data = (await useApi<any>("/admin/getTransactionsCount")).data;
        this.transactionsCount.value = data.value ? data.value.count : 0;
    }

    public async registerUser(username: string, password: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                username: username,
                password: password
            }
        };

        const {error} = await useApi("/admin/registerUser", opts);

        return error.value === null;
    }

    public async changeUserPassword(userId: number, password: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                userId: userId,
                password: password
            }
        };

        const {error} = await useApi("/admin/changeUserPassword", opts);

        return error.value === null;
    }

    public async getUsers(offset: number, count: number, nameFilter: string): Promise<any> {
        const opts = {
            method: "GET",
            params: {
                offset: offset,
                count: count
            }
        };

        if (nameFilter !== null && nameFilter.length > 0)
            opts.params.nameFilter = nameFilter;

        const {data, error} = await useApi<any>("/admin/getUsers", opts);

        if (error.value !== null) {
            return null;
        }

        return data.value?.users;
    }

    public getAllowed(): Ref<Boolean> {
        return this.allowed;
    }

    public getUsersCount(): Ref<number> {
        return this.usersCount;
    }

    public getActiveUsersCount(): Ref<number> {
        return this.activeUsersCount;
    }

    public getTransactionsCount(): Ref<number> {
        return this.transactionsCount;
    }
}