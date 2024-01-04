import {useCookie} from "#app";
import {AbstractApi} from "~/libs/api/AbstractApi";
import {UserApi} from "~/libs/api/user/UserApi";
import {SessionsApi} from "~/libs/api/sessions/SessionsApi";
import {AccountsApi} from "~/libs/api/accounts/AccountsApi";
import {AccountsTagsApi} from "~/libs/api/accounts/tags/AccountsTagsApi";
import {TransactionsTagsApi} from "~/libs/api/transactions/tag/TransactionsTagsApi";
import {TransactionsApi} from "~/libs/api/transactions/TransactionsApi";
import {RecurringTransactionsApi} from "~/libs/api/transactions/recurring/RecurringTransactionsApi";
import {CurrenciesApi} from "~/libs/api/currencies/CurrenciesApi";
import {AnalyticsApi} from "~/libs/api/analytics/AnalyticsApi";
import {NotesApi} from "~/libs/api/notes/NotesApi";
import {NotificationApi} from "~/libs/api/notification/NotificationApi";
import {AdminApi} from "~/libs/api/admin/AdminApi";
import {ConfigManager} from "~/libs/config/ConfigManager";
import {ServerConfigs} from "~/libs/config/ServerConfigs";
import {AccumulationsApi} from "~/libs/api/accumulations/AccumulationsApi";
import {ReportsApi} from "~/libs/api/reports/ReportsApi";

export const useApiLoader = new class ApiLoader {
    private readonly serverConfigs: ConfigManager;
    private readonly userApi: UserApi;
    private readonly sessionsApi : SessionsApi;

    private readonly accountsApi : AccountsApi;
    private readonly accountsTagsApi : AccountsTagsApi;

    private readonly transactionsTagsApi : TransactionsTagsApi;
    private readonly transactionsApi : TransactionsApi;
    private readonly recurringTransactionsApi : RecurringTransactionsApi;

    private readonly currenciesApi : CurrenciesApi;
    private readonly analyticsApi : AnalyticsApi;
    private readonly notesApi : NotesApi;
    private readonly notificationsApi : NotificationApi;

    private readonly adminApi : AdminApi;
    private readonly accumulationsApi: AccumulationsApi;
    private readonly reportsApi: ReportsApi;

    constructor() {
        this.serverConfigs = new ConfigManager();
        this.userApi = new UserApi();
        this.sessionsApi = new SessionsApi();

        this.accountsApi = new AccountsApi();
        this.accountsTagsApi = new AccountsTagsApi();

        this.transactionsTagsApi = new TransactionsTagsApi();
        this.transactionsApi = new TransactionsApi();
        this.recurringTransactionsApi = new RecurringTransactionsApi(this.accountsApi);

        this.currenciesApi = new CurrenciesApi();
        this.analyticsApi = new AnalyticsApi();
        this.notesApi = new NotesApi();
        this.notificationsApi = new NotificationApi();
        this.accumulationsApi = new AccumulationsApi();
        this.reportsApi = new ReportsApi();

        this.adminApi = new AdminApi();
    }

    public async fetch() : Promise<boolean> {
        const auth = await Promise.all([this.userApi.init(), this.serverConfigs.init()]);

        if (auth[0] === false) {
            useNuxtApp().$auth.logout();

            return false;
        }

        return Promise.all([
            this.sessionsApi.init(),
            this.accountsApi.init(),
            this.accountsTagsApi.init(),
            this.transactionsTagsApi.init(),
            this.transactionsApi.init(),
            this.recurringTransactionsApi.init(),
            this.currenciesApi.init(),
            this.analyticsApi.init(),
            this.notesApi.init(),
            this.notificationsApi.init(),
            this.accumulationsApi.init(),
            this.reportsApi.init(),
            this.adminApi.init()
        ]).then(results => {
            return results.map(r => typeof r == "boolean" ? r : true).find((v) => !v) === undefined;
        });
    }

    public getProvider() : any {
        return {
            provide: {
                serverConfigs: this.serverConfigs,
                accountsApi: this.accountsApi,
                accountsTagsApi: this.accountsTagsApi,
                transactionsTagsApi: this.transactionsTagsApi,
                transactionsApi: this.transactionsApi,
                recurringTransactionsApi: this.recurringTransactionsApi,
                currenciesApi: this.currenciesApi,
                analyticsApi: this.analyticsApi,
                notesApi: this.notesApi,
                userApi: this.userApi,
                sessionsApi: this.sessionsApi,
                notificationsApi: this.notificationsApi,
                accumulationsApi: this.accumulationsApi,
                reportsApi: this.reportsApi,
                adminApi: this.adminApi
            }
        }
    }
}