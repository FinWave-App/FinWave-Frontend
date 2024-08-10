import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";

export class CategoriesBudgetApi extends AbstractApi {
    private budgets : Ref<Array<any>> = ref([]);
    private categoryToBudgetsMap : Ref<Map<number, Array<any>>> = ref(new Map<number, Array<any>>);
    private budgetsMap : Ref<Map<number, any>> = ref(new Map<number, any>());

    async init(): Promise<void | boolean> {
        await this.fetch();
    }

    public async fetch() : Promise<void> {
        const {data} = await useApi<any>("/user/transactions/categories/budget/getList");

        if (data.value === null)
            return;

        this.budgets.value = data.value.budgets || [];

        this.rebuildMap();
    }

    private rebuildMap() {
        const newMap = new Map<number, Array<any>>();
        const map2 = new Map<number, any>();

        this.budgets.value.forEach((budget) => {
            if (!newMap.has(budget.categoryId))
                newMap.set(budget.categoryId, new Array<any>());

            newMap.get(budget.categoryId)?.push(budget);
            map2.set(budget.budgetId, budget);
        })

        this.categoryToBudgetsMap.value = newMap;
        this.budgetsMap.value = map2;
    }

    public getBudgets(): Ref<Array<any>> {
        return this.budgets;
    }

    public getBudgetsMap(): Ref<Map<number, any>> {
        return this.budgetsMap;
    }

    public getCategoryToBudgetsMap(): Ref<Map<number, Array<any>>> {
        return this.categoryToBudgetsMap;
    }

    public async addBudget(categoryId : number, currencyId: number, dateType: number, amount: number) : Promise<number> {
        const opts = {
            method: "POST",
            params: {
                categoryId: categoryId,
                currencyId: currencyId,
                dateType: dateType,
                amount: amount
            }
        }

        const {data: newBudget, error} = await useApi<any>("/user/transactions/categories/budget/add", opts);

        if (error.value !== null) {
            return -1;
        }

        this.budgets.value?.push({
            budgetId: newBudget.value.budgetId,
            categoryId: categoryId,
            currencyId: currencyId,
            dateType: dateType,
            amount: amount
        });

        this.rebuildMap();

        return newBudget.value.budgetId;
    }

    public async editBudget(budgetId: number, categoryId : number, currencyId: number, dateType: number, amount: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                budgetId: budgetId,
                categoryId: categoryId,
                currencyId: currencyId,
                dateType: dateType,
                amount: amount
            }
        }

        const {error} = await useApi("/user/transactions/categories/budget/edit", opts);

        if (error.value !== null)
            return false;

        const saved = this.budgets.value?.find(m => m.budgetId === budgetId);

        saved.categoryId = categoryId;
        saved.currencyId = currencyId;
        saved.dateType = dateType;
        saved.amount = amount;

        return true;
    }

    public async removeBudget(budgetId: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                budgetId: budgetId
            }
        };

        const {error} = await useApi("/user/transactions/categories/budget/remove", opts);

        if (error.value !== null) {
            return false;
        }

        this.budgets.value = this.budgets.value.filter((m) => m.budgetId != budgetId);
        this.rebuildMap();

        return true;
    }
}