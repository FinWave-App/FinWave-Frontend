import {AccountsApi} from "~/libs/api/accounts/AccountsApi";
import {CurrenciesApi} from "~/libs/api/currencies/CurrenciesApi";
import {AccountsTagsApi} from "~/libs/api/accounts/tags/AccountsTagsApi";

export default defineNuxtPlugin(async nuxtApp => {
    const accountsApi = new AccountsApi();
    const accountsTagsApi = new AccountsTagsApi();

    const currenciesApi = new CurrenciesApi();

    await Promise.all([
        accountsApi.init(),
        accountsTagsApi.init(),
        currenciesApi.init()
    ]);

    return {
        provide: {accountsApi, accountsTagsApi, currenciesApi}
    }
})