import {AccountsApi} from "~/libs/api/accounts/AccountsApi";
import {CurrenciesApi} from "~/libs/api/currencies/CurrenciesApi";
import {AccountsTagsApi} from "~/libs/api/accounts/tags/AccountsTagsApi";
import {TransactionsTagsApi} from "~/libs/api/transactions/tag/TransactionsTagsApi";
import {TransactionsApi} from "~/libs/api/transactions/TransactionsApi";
import {AnalyticsApi} from "~/libs/api/analytics/AnalyticsApi";

export default defineNuxtPlugin(async nuxtApp => {
    const {$auth} = nuxtApp;

    const accountsApi = new AccountsApi();
    const accountsTagsApi = new AccountsTagsApi();

    const transactionsTagsApi = new TransactionsTagsApi();
    const transactionsApi = new TransactionsApi();

    const currenciesApi = new CurrenciesApi();

    const analyticsApi = new AnalyticsApi();

    const preloadAll = async () => {
        await Promise.all([
            accountsApi.init(),
            accountsTagsApi.init(),
            transactionsTagsApi.init(),
            transactionsApi.init(),
            currenciesApi.init(),
            analyticsApi.init()
        ]);
    }

    if ($auth.state().authed.value) {
        await preloadAll();
    } else {
        watch($auth.state().authed, async (selection, prevSelection) => {
            await preloadAll();
        });
    }

    return {
        provide: {accountsApi, accountsTagsApi, transactionsTagsApi, transactionsApi, currenciesApi, analyticsApi}
    }
})