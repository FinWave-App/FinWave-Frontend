export interface TransactionsFilter {
    tagsIds: Array<number> | null;
    accountsIds: Array<number> | null;
    currenciesIds: Array<number> | null;
    fromTime: Date | null;
    toTime: Date | null;
    description: string | null;
}