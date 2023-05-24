import {NuxtApp, useCookie, useNuxtApp} from "#app";
import {AuthState} from "~/libs/auth/AuthState";
import {integer} from "vscode-languageserver-types";

export class AuthManager {
    readonly nuxt: NuxtApp;
    private readonly _state: AuthState;

    constructor() {
        this.nuxt = useNuxtApp();
        this._state = new AuthState();
    }

    async init(): Promise<void> {
        const sessionCookie = useCookie<string | undefined>("session_token");

        if (sessionCookie.value !== undefined)
            this._state.update(sessionCookie.value)
    }

    public state() : AuthState {
        return this._state;
    }

    public auth(token: string, lifetimeDays: integer) {
        const tokenCookie = useCookie<string>("session_token", {
            maxAge: lifetimeDays * 24 * 60 * 60,
            sameSite: true,
            secure: true
        });

        tokenCookie.value = token;
        this._state.update(token);
    }
}