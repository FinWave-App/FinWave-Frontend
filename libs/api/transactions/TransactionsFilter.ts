export class TransactionsFilter {
    tagsIds?: Array<number>;
    accountsIds?: Array<number>;
    currenciesIds?: Array<number>;
    fromTime?: Date;
    toTime?: Date;
    description?: string;

    constructor(tagsIds: Array<number>, accountsIds: Array<number>, currenciesIds: Array<number>, fromTime: Date, toTime: Date, description: string) {
        this.tagsIds = tagsIds;
        this.accountsIds = accountsIds;
        this.currenciesIds = currenciesIds;
        this.fromTime = fromTime;
        this.toTime = toTime;
        this.description = description;
    }

    public toOptions(): any {
        return {
            tagsIds: this.tagsIds && this.tagsIds.length > 0 ? this.tagsIds.toString() : undefined,
            accountsIds: this.accountsIds && this.accountsIds.length > 0 ? this.accountsIds.toString() : undefined,
            currenciesIds: this.currenciesIds && this.currenciesIds.length > 0 ? this.currenciesIds.toString() : undefined,
            fromTime: this.fromTime ? this.fromTime.toISOString() : undefined,
            toTime: this.toTime ? this.toTime.toISOString() : undefined,
            description: this.description && this.description.length > 0 ? this.description : undefined
        };
    }
}