import {Ref} from "vue";
import {password} from "iron-webcrypto";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class AdminApi extends AbstractApi {
    private allowed: Ref<Boolean> = ref(false);
    private usersCount: Ref<number> = ref(0);
    private activeUsersCount: Ref<number> = ref(0);
    private transactionsCount: Ref<number> = ref(0);

    async init(): Promise<void | boolean> {
        useApi("/admin/check").then(result => {
            if (result.error.value) {
                this.allowed.value = false;

                return;
            }

            this.allowed.value = true;

            Promise.all([
                useApi<any>("/admin/getUsersCount"),
                useApi<any>("/admin/getActiveUsersCount"),
                useApi<any>("/admin/getTransactionsCount"),
            ]).then(results => {
                let data = results[0].data;
                this.usersCount.value = data.value ? data.value.count : 0;

                data = results[1].data;
                this.activeUsersCount.value = data.value ? data.value.count : 0;

                data = results[2].data;
                this.transactionsCount.value = data.value ? data.value.count : 0;
            });
        });
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