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
import {ca} from "date-fns/locale";
import {useStorage} from "@vueuse/core";
import {useServer} from "~/composables/useServer";
import {TransactionsTagsManagementApi} from "~/libs/api/transactions/tag/management/TransactionsTagsManagementApi";

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

    private readonly transactionTagsManagementApi : TransactionsTagsManagementApi;

    private readonly reportsApi: ReportsApi;

    private websocketClient : WebSocket | null = null;

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

        this.transactionTagsManagementApi = new TransactionsTagsManagementApi();

        this.reportsApi = new ReportsApi();

        this.adminApi = new AdminApi();
    }

    public async fetch() : Promise<boolean> {
        const auth = Promise.all([this.userApi.init(), this.serverConfigs.init()]);

        return Promise.all([
            auth,
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
            this.transactionTagsManagementApi.init(),
            this.reportsApi.init(),
            this.adminApi.init()
        ]).then(results => {
            if (results[0][0] === false) {
                useNuxtApp().$auth.logout();

                return false;
            }

            return results.map(r => typeof r == "boolean" ? r : true).find((v) => !v) === undefined;
        }).catch(t => {
            console.log(t);

            return false;
        });
    }

    public connectWebsocket() : void {
        const auth = useNuxtApp().$auth.state();

        this.websocketClient = new WebSocket(
            useServer.getWebSocketUrl() + "websockets/events"
        );

        this.websocketClient.onmessage = (event) => {
            if (event.data === "pong")
                return

            this.parseMessage(JSON.parse(event.data))
        };

        this.websocketClient.addEventListener("open", e =>{
            this.websocketClient.send(JSON.stringify({
                type: "auth",
                body: {
                    token: auth.token
                }
            }))

            setInterval(() => {
                this.websocketClient.send("ping")
            },15000);
        })
    }

    protected parseMessage(message : any) {
        if (message.type !== "update")
            return;

        const body = message.body;

        switch (body.updated) {
            case "accounts":
                this.accountsApi.reloadAccounts();
                break;
            case "accountTags":
                this.accountsTagsApi.fetch();
                break;
            case "accumulation":
                this.accumulationsApi.fetchMap();
                break;
            case "currencies":
                this.currenciesApi.fetch();
                break;
            case "notes":
                this.notesApi.updateNotify();
                break;
            case "transactions":
                this.accountsApi.reloadAccounts();
                this.transactionsApi.updateNotify();
                break;
            case "reports":
                this.reportsApi.updateNotify();
                break;
            case "recurringTransactions":
                this.recurringTransactionsApi.fetch();
                break;
            case "transactionTags":
                this.accountsTagsApi.fetch();
                break;
        }
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
                tagsManagementApi: this.transactionTagsManagementApi,
                reportsApi: this.reportsApi,
                adminApi: this.adminApi
            }
        }
    }

    public async initDemo()  {
        const { t} = useI18n();
        const mainCurrencyCode = t("demo.mainCurrencyCode");

        const results = await Promise.all([
            this.accountsTagsApi.newTag(t("demo.accountTags.1.name"), t("demo.accountTags.1.description")),
            this.accountsTagsApi.newTag(t("demo.accountTags.2.name"), t("demo.accountTags.2.description")),

            this.currenciesApi.newCurrency("BTC", "₿", 8, "Bitcoin"),
            this.currenciesApi.newCurrency("ETH", "Ξ", 18, "Ethereum"),

            this.transactionsTagsApi.newTag(1, -1, t("demo.tags.1"), null),
            this.transactionsTagsApi.newTag(0, -1, t("demo.tags.2"), null),
            this.transactionsTagsApi.newTag(-1, -1, t("demo.tags.3"), null),
            this.transactionsTagsApi.newTag(-1, -1, t("demo.tags.4"), null),
            this.transactionsTagsApi.newTag(-1, -1, t("demo.tags.5"), null),
            this.transactionsTagsApi.newTag(-1, -1, t("demo.tags.6"), null),
            this.transactionsTagsApi.newTag(-1, -1, t("demo.tags.7"), null),
            this.transactionsTagsApi.newTag(-1, -1, t("demo.tags.8"), null),
        ]).catch(t => {
            console.log(t);

            return []
        });

        const tradTag = results[0]
        const cryptoTag = results[1]

        const btcCurrency = results[2]
        const ethCurrency = results[3]

        const salaryTag = results[4]
        const investmentTag = results[5]
        const goodsTag = results[6]
        const housingTag = results[7]
        const entertainmentTag = results[8]
        const apparelTag = results[9]
        const healthcareTag = results[10]
        const travelTag = results[11]

        let mainCurrency = this.currenciesApi.getCurrencies().value.find((v) => v.code === mainCurrencyCode)

        if (!mainCurrency) {
            mainCurrency = 1;
        }else {
            mainCurrency = mainCurrency.currencyId;
        }

        useStorage("preferred_currency", 1).value = mainCurrency;

        const accounts = await Promise.all([
            this.accountsApi.newAccount(t("demo.accounts.3.name"), btcCurrency, cryptoTag, t("demo.accounts.3.description")),
            this.accountsApi.newAccount(t("demo.accounts.4.name"), ethCurrency, cryptoTag, t("demo.accounts.4.description")),
            this.accountsApi.newAccount(t("demo.accounts.1"), mainCurrency, tradTag, null),
            this.accountsApi.newAccount(t("demo.accounts.2"), mainCurrency, tradTag, null),
        ])

        const ledger = accounts[0];
        const binance = accounts[1];
        const paypal = accounts[2];
        const cash = accounts[3];

        const today = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        return Promise.all([
            this.transactionsApi.newTransaction(salaryTag, paypal, new Date(today - oneDay * 14), 50000, null),
            this.transactionsApi.newTransaction(housingTag, paypal, new Date(today - oneDay * 14), -5000, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 13), -421, null),
            this.transactionsApi.newInternalTransfer(investmentTag, paypal, ledger, new Date(today - oneDay * 13), -19000, 0.5, null),
            this.transactionsApi.newInternalTransfer(investmentTag, paypal, binance, new Date(today - oneDay * 13), -1000, 0.3, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 12), -515, null),
            this.transactionsApi.newTransaction(healthcareTag, paypal, new Date(today - oneDay * 12), -526, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 11), -345, null),
            this.transactionsApi.newTransaction(entertainmentTag, paypal, new Date(today - oneDay * 11), -621, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 10), -124, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 9), -235, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 8), -652, null),
            this.transactionsApi.newTransaction(entertainmentTag, paypal, new Date(today - oneDay * 8), -721, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 7), -637, null),
            this.transactionsApi.newTransaction(apparelTag, paypal, new Date(today - oneDay * 7), -715, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 6), -833, null),
            this.transactionsApi.newInternalTransfer(investmentTag, binance, cash, new Date(today - oneDay * 6), -0.15, 2000, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 5), -942, null),
            this.transactionsApi.newTransaction(healthcareTag, paypal, new Date(today - oneDay * 5), -415, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 4), -325, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 3), -634, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay * 2), -753, null),
            this.transactionsApi.newTransaction(entertainmentTag, paypal, new Date(today - oneDay * 2), -235, null),

            this.transactionsApi.newTransaction(goodsTag, paypal, new Date(today - oneDay), -179, null),
            this.transactionsApi.newTransaction(travelTag, paypal, new Date(today - oneDay), -15000, null),
        ]);
    }
}