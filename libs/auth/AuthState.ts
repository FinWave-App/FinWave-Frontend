export class AuthState {
    private _authed: Ref<Boolean> = ref(false);
    private _token: string | null = null;

    public update(token: string | null) {
        if (token == null) {
            this._authed.value = false;
            this._token = null;

            return;
        }

        this._authed.value = true;
        this._token = token;
    }

    get token(): string | null {
        return this._token;
    }

    get authed(): Ref<Boolean> {
        return this._authed;
    }
}