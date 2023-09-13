import {Ref} from "vue";

export class UserApi {
    private username: Ref<string | null> = ref(null);

    async init(): Promise<boolean> {
        const {data} = await useApi<any>("/user/getUsername");

        if (data.value === null)
            return false;

        this.username.value = data.value.username;

        return true;
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