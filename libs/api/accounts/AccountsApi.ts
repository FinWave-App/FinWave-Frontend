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

    public async editAccountTag(tagId: number, accountId: number) {
        const opts = {
            method: "POST",
            params: { accountId: accountId, tagId: tagId }
        };

        const { error } = await useApi("/user/accounts/editTag", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.find((t) => t.accountId == accountId).tagId = tagId;

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

    public async newAccount(name: string, currencyId: number, tagId: number, description: string | null) : Promise<number> {
        const opts = {
            method: "POST",
            params: {
                name: name,
                currencyId: currencyId,
                tagId: tagId
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
            tagId: tagId,
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