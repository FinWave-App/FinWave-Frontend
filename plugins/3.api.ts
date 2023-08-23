import {AccountsApi} from "~/libs/api/accounts/AccountsApi";
import {CurrenciesApi} from "~/libs/api/currencies/CurrenciesApi";
import {AccountsTagsApi} from "~/libs/api/accounts/tags/AccountsTagsApi";
import {TransactionsTagsApi} from "~/libs/api/transactions/tag/TransactionsTagsApi";
import {TransactionsApi} from "~/libs/api/transactions/TransactionsApi";
import {AnalyticsApi} from "~/libs/api/analytics/AnalyticsApi";
import {NotesApi} from "~/libs/api/notes/NotesApi";
import {UserApi} from "~/libs/api/user/UserApi";
import {SessionsApi} from "~/libs/api/sessions/SessionsApi";

export default defineNuxtPlugin(async nuxtApp => {
    const {$auth} = nuxtApp;

    const userApi = new UserApi();
    const sessionsApi = new SessionsApi();

    const accountsApi = new AccountsApi();
    const accountsTagsApi = new AccountsTagsApi();

    const transactionsTagsApi = new TransactionsTagsApi();
    const transactionsApi = new TransactionsApi();

    const currenciesApi = new CurrenciesApi();
    const analyticsApi = new AnalyticsApi();
    const notesApi = new NotesApi();

    const preloadAll = async () => {
        await Promise.all([
            userApi.init(),
            sessionsApi.init(),
            accountsApi.init(),
            accountsTagsApi.init(),
            transactionsTagsApi.init(),
            transactionsApi.init(),
            currenciesApi.init(),
            analyticsApi.init(),
            notesApi.init()
        ]);
    }

    if ($auth.state().authed.value) {
        await preloadAll();
    }

    watch($auth.state().authed, async (selection, prevSelection) => {
        if (selection)
            await preloadAll();
    });

    return {
        provide: {accountsApi, accountsTagsApi, transactionsTagsApi, transactionsApi, currenciesApi, analyticsApi, notesApi, userApi, sessionsApi}
    }
})