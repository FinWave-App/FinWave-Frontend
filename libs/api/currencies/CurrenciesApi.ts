import {Ref} from "vue";

export class CurrenciesApi {
    private currencies: Ref<Array<any>> = ref([]);
    private currenciesMap: Ref<Map<number, any>> = ref(new Map<number, any>);

    async init(): Promise<void> {
        const {data} = await useApi<any>("/user/currencies/getList");

        if (data.value === null)
            return;

        this.currencies.value = data.value.currencies || [];

        this.currencies.value.forEach((currency) => {
            this.currenciesMap.value.set(currency.currencyId, currency);
        });
    }

    public getCurrencies(): Ref<Array<any>> {
        return this.currencies;
    }

    public getCurrenciesMap(): Ref<Map<number, any>> {
        return this.currenciesMap;
    }

    public async newCurrency(code: string, symbol: string, decimals: number, description: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { code: code, symbol: symbol, decimals: decimals, description: description }
        };

        const {data: newCurrency, error} = await useApi("/user/currencies/new", opts);

        if (error.value !== null) {
            return false;
        }

        this.currencies.value.push({
            currencyId: newCurrency.value.currencyId,
            owned: true,
            code: code,
            symbol: symbol,
            decimals: decimals,
            description: description
        });

        return true;
    }

    public async editCurrencyCode(code: string, currencyId: number) {
        const opts = {
            method: "POST",
            params: { currencyId: currencyId, code: code }
        };

        const { error } = await useApi("/user/currencies/editCode", opts);

        if (error.value !== null) {
            return false;
        }

        this.currencies.value.find((t) => t.currencyId == currencyId).code = code;

        return true;
    }

    public async editCurrencySymbol(symbol: string, currencyId: number) {
        const opts = {
            method: "POST",
            params: { currencyId: currencyId, symbol: symbol }
        };

        const { error } = await useApi("/user/currencies/editSymbol", opts);

        if (error.value !== null) {
            return false;
        }

        this.currencies.value.find((t) => t.currencyId == currencyId).symbol = symbol;

        return true;
    }

    public async editCurrencyDescription(description: string, currencyId: number) {
        const opts = {
            method: "POST",
            params: { currencyId: currencyId, description: description }
        };

        const { error } = await useApi("/user/currencies/editDescription", opts);

        if (error.value !== null) {
            return false;
        }

        this.currencies.value.find((t) => t.currencyId == currencyId).description = description;

        return true;
    }
}