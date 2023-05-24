export class ServerConfigs {
    readonly users: any | undefined;
    readonly accounts: any | undefined;
    readonly currencies: any | undefined;
    readonly notes: any | undefined;
    readonly transactions: any | undefined;

    constructor(users: any, accounts: any, currencies: any, notes: any, transactions: any) {
        this.users = users;
        this.accounts = accounts;
        this.currencies = currencies;
        this.notes = notes;
        this.transactions = transactions;
    }
}