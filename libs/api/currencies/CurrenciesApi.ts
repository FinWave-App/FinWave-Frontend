import {Ref} from "vue";

export class CurrenciesApi {
    private currencies: Ref<Array<any> | null> = ref(null);

    async init(): Promise<void> {

    }

    public async getCurrencies(): Promise<Ref<Array<any> | null>> {
        if (this.currencies.value === null)
            await this.fetchCurrencies();

        return this.currencies;
    }

    private async fetchCurrencies() {
        const {data} = await useApi<any>("/user/currencies/getList");

        this.currencies.value = data.value.currencies || [];
    }

    public async newCurrency(code: string, symbol: string, description: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { code: code, symbol: symbol, description: description }
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