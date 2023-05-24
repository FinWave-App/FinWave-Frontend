export class AuthState {
    private _authed: boolean = false;
    private _token: string | null = null;

    public update(token: string | null) {
        if (token == null) {
            this._authed = false;
            this._token = null;

            return;
        }

        this._authed = true;
        this._token = token;
    }

    get token(): string | null {
        return this._token;
    }

    get authed(): boolean {
        return this._authed;
    }
}