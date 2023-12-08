import {Ref} from "vue";
import {AccountsApi} from "~/libs/api/accounts/AccountsApi";
import recurring from "~/pages/recurring.vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class RecurringTransactionsApi extends AbstractApi {
    private recurring: Ref<Array<any>> = ref([]);
    private recurringMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private accountsApi: any;

    constructor(accountsApi: any) {
        super();
        this.accountsApi = accountsApi;
    }

    async init(): Promise<void | boolean> {
        const {data} = await useApi<any>("/user/transactions/recurring/getList");

        if (data.value === null)
            return;

        this.recurring.value = data.value.recurringList || [];

        this.rebuildMap();
    }

    private rebuildMap() {
        const newMap = new Map<number, any>();

        this.recurring.value.forEach((recurring) => {
            newMap.set(recurring.recurringTransactionId, recurring);
        });

        this.recurringMap.value = newMap;
    }

    public getRecurring(): Ref<Array<any>> {
        return this.recurring;
    }

    public getRecurringMap(): Ref<Map<number, any>> {
        return this.recurringMap;
    }

    public async newRecurring(tagId: number, accountId: number, nextRepeat: Date, repeatType: number, repeatArg: number, notificationMode: number, delta: number, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                tagId: tagId,
                accountId: accountId,
                nextRepeat: nextRepeat.toISOString(),
                repeatType: repeatType,
                repeatArg: repeatArg,
                notificationMode: notificationMode,
                delta: delta
            }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {data: newRecurring, error} = await useApi<any>("/user/transactions/recurring/new", opts);

        if (error.value !== null) {
            return false;
        }

        this.recurring.value?.push({
            recurringTransactionId: newRecurring.value.recurringTransactionId,
            tagId: tagId,
            accountId: accountId,
            currencyId: this.accountsApi.getAccountsMap().value.get(accountId).currencyId,
            lastRepeat: new Date(),
            nextRepeat: nextRepeat,
            repeatType: repeatType,
            repeatArg: repeatArg,
            notificationMode: notificationMode,
            delta: delta,
            description: description
        });

        this.rebuildMap();

        return true;
    }

    public async editRecurring(recurringTransactionId: number, tagId: number, accountId: number, nextRepeat: Date, repeatType: number, repeatArg: number, notificationMode: number, delta: number, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                recurringTransactionId: recurringTransactionId,
                tagId: tagId,
                accountId: accountId,
                nextRepeat: nextRepeat.toISOString(),
                repeatType: repeatType,
                repeatArg: repeatArg,
                notificationMode: notificationMode,
                delta: delta
            }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {error} = await useApi("/user/transactions/recurring/edit", opts);

        if (error.value !== null)
            return false;

        const edited = this.recurring.value.find((r) => r.recurringTransactionId === recurringTransactionId);

        edited.tagId = tagId;
        edited.accountId = accountId;
        edited.currencyId = this.accountsApi.getAccountsMap().value.get(accountId).currencyId;
        edited.nextRepeat = nextRepeat;
        edited.repeatType = repeatType;
        edited.repeatArg = repeatArg;
        edited.notificationMode = notificationMode;
        edited.delta = delta;
        edited.description = description;

        return true;
    }

    public async deleteRecurringTransaction(recurringTransactionId: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                recurringId: recurringTransactionId
            }
        };

        const {error} = await useApi("/user/transactions/recurring/delete", opts);

        if (error.value !== null)
            return false;

        this.recurring.value = this.recurring.value.filter((r) => r.recurringTransactionId !== recurringTransactionId);
        this.rebuildMap();

        return true;
    }
}