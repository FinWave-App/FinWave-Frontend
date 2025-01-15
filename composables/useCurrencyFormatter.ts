export const useCurrencyFormatter = function (delta: number, currency: any, locale: string) {
    const formatter = Intl.NumberFormat(locale, {
        style: 'currency',
        currency: "TMP", // temp currency for replacement
        minimumFractionDigits: 2,
        maximumFractionDigits: currency.decimals
    });
    return formatter.format(delta).replace("TMP ", currency.symbol).replace(" TMP", " " + currency.symbol);
}