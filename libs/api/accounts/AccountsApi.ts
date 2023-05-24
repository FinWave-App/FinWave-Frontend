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