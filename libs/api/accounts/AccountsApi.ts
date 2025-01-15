import {Ref} from "vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class AccountsApi extends AbstractApi {
    private accounts: Ref<Array<any>> = ref([]);
    private accountsMap: Ref<Map<number, any>> = ref(new Map<number, any>);

    async init(): Promise<void | boolean> {
        await this.reloadAccounts();
    }

    private reloadMap() {
        const newMap = new Map<number, any>();

        this.accounts.value.forEach((account) => {
            newMap.set(account.accountId, account);
        })

        this.accountsMap.value = newMap;
    }

    public async reloadAccounts(): Promise<void> {
        const {data} = await useApi<any>("/user/accounts/getList");

        if (data.value === null)
            return;

        this.accounts.value = data.value.accounts || [];

        this.reloadMap();
    }

    public getAccounts(): Ref<Array<any>> {
        return this.accounts;
    }

    public getAccountsMap(): Ref<Map<number, any>> {
        return this.accountsMap;
    }

    public async editAccountDescription(description: string, accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId, description: description }
        };

        const { error } = await useApi("/user/accounts/editDescription", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.find((t) => t.accountId == accountId).description = description;

        return true;
    }

    public async editAccountName(name: string, accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId, name: name }
        };

        const { error } = await useApi("/user/accounts/editName", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.find((t) => t.accountId == accountId).name = name;

        return true;
    }

    public async editAccountFolder(folderId: number, accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId, folderId: folderId }
        };

        const { error } = await useApi("/user/accounts/editFolder", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.find((t) => t.accountId == accountId).folderId = folderId;

        return true;
    }

    public async hideAccount(accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId }
        };

        const { error } = await useApi("/user/accounts/hide", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.find((t) => t.accountId == accountId).hidden = true;

        return true;
    }

    public async deleteAccount(accountId: number) : Promise<{success: boolean, errorMessage: string | null}> {
        const opts = {
            method: "POST",
            params: { accountId: accountId }
        };

        const { data, error } = await useApi("/user/accounts/delete", opts);

        if (error.value !== null) {
            if (!data.value || !data.value.data)
                return {success: false, errorMessage: null}

            return {success: false, errorMessage: data.value.data.message};
        }

        this.accounts.value = this.accounts.value.filter((t) => t.accountId != accountId);
        this.reloadMap();

        return {success: true, errorMessage: null};
    }

    public async showAccount(accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId }
        };

        const { error } = await useApi("/user/accounts/show", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.find((t) => t.accountId == accountId).hidden = false;

        return true;
    }

    public async newAccount(name: string, currencyId: number, folderId: number, description: string | null) : Promise<number> {
        const opts = {
            method: "POST",
            params: {
                name: name,
                currencyId: currencyId,
                folderId: folderId
            }
        }

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {data: newAccount, error} = await useApi<any>("/user/accounts/new", opts);

        if (error.value !== null) {
            return -1;
        }

        this.accounts.value?.push({
            accountId: newAccount.value.accountId,
            folderId: folderId,
            currencyId: currencyId,
            amount: 0,
            hidden: false,
            name: name,
            description: description
        });

        this.reloadMap();

        return newAccount.value.accountId;
    }
}