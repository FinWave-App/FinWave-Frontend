import {Ref} from "vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class ExchangeRateApi extends AbstractApi {
    private cacheMap: Ref<Map<string, number>> = ref(new Map<string, number>);

    async init(): Promise<void | boolean> {

    }

    public async getExchangeRate(fromCurrencyId: number, toCurrencyId: number) : Promise<number> {
        const cacheKey = fromCurrencyId + "-" + toCurrencyId;
        const cached = this.cacheMap.value.get(cacheKey);

        if (cached)
            return cached;

        const opts = {
            method: "GET",
            params: {
                fromCurrencyId: fromCurrencyId,
                toCurrencyId: toCurrencyId
            }
        };

        const {data: response, error} = await useApi("/user/currencies/exchange/getExchangeRate", opts);

        if (error.value !== null || !response.value) {
            return -1;
        }

        this.cacheMap.value.set(cacheKey, response.value.rate);

        return response.value.rate;
    }
}