import {Ref} from "vue";

export class UserApi {
    private username: Ref<string | null> = ref(null);

    async init(): Promise<void> {
        const {data} = await useApi<any>("/user/getUsername");

        if (data.value === null)
            return;

        this.username.value = data.value.username;
    }

    public getUsername(): Ref<string | null> {
        return this.username;
    }

    public async changePassword(newPassword: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { password: newPassword }
        };

        const {error} = await useApi("/user/changePassword", opts);

        const {$auth} = useNuxtApp();

        $auth.logout();

        return error.value === null;
    }

    public async logout() : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {}
        };

        const {error} = await useApi("/user/logout", opts);

        const {$auth} = useNuxtApp();

        $auth.logout();

        return error.value === null;
    }
}