import {Ref} from "vue";

export class AccountsApi {
    private accounts: Ref<Array<any> | null> = ref(null);

    async init(): Promise<void> {

    }

    public async getAccounts(): Promise<Ref<Array<any> | null>> {
        if (this.accounts.value === null)
            await this.fetchAccounts();

        return this.accounts;
    }

    private async fetchAccounts() {
        const {data} = await useApi<any>("/user/accounts/getList");

        this.accounts.value = data.value.accounts || [];
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

    public async newAccount(name: string, currencyId: number, tagId: number, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { name: name, currencyId: currencyId, tagId: tagId }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {data: newAccount, error} = await useApi("/user/accounts/new", opts);

        if (error.value !== null) {
            return false;
        }

        this.accounts.value.push({
            accountId: newAccount.value.accountId,
            tagId: tagId,
            currencyId: currencyId,
            amount: 0,
            hidden: false,
            name: name,
            description: description
        });

        return true;
    }
}