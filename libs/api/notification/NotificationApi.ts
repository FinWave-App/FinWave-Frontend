import {Ref} from "vue";

export class NotificationApi {
    private publicVapidKey: Ref<string | null> = ref();

    async init(): Promise<void> {
        const {data} = await useApi<any>("/user/notifications/points/vapidKey");

        if (data.value === null)
            return;

        this.publicVapidKey.value = data.value?.publicKey || null;
    }

    public async registerWebPushPoint(endpoint: string, auth: string, p256dh: string, description: string): Promise<number> {
        const opts = {
            method: "POST",
            params: {
                endpoint: endpoint,
                auth: auth,
                p256dh: p256dh,
                description: description
            }
        };

        const {data, error} = await useApi<any>("/user/notifications/points/newWebPush", opts);

        if (error.value !== null)
            return -1;

        return data.value?.pointId;
    }

    public async getPoints(): Promise<any> {
        const {data, error} = await useApi<any>("/user/notifications/points/getList");

        if (error.value !== null)
            return null;

        return data.value?.points;
    }

    public getVapidKey(): Ref<string | null> {
        return this.publicVapidKey;
    }

    public async editPointDescription(pointId: number, description: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                pointId: pointId,
                description: description
            }
        };

        const {data, error} = await useApi<any>("/user/notifications/points/editDescription", opts);

        return error.value === null;
    }

    public async editPointPrimary(pointId: number, isPrimary: boolean) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                pointId: pointId,
                primary: isPrimary
            }
        };

        const {data, error} = await useApi<any>("/user/notifications/points/editPrimary", opts);

        return error.value === null;
    }

    public async deletePoint(pointId: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                pointId: pointId
            }
        };

        const {data, error} = await useApi<any>("/user/notifications/points/delete", opts);

        return error.value === null;
    }

    public async pushNotification(pointId: number, text: string) {
        const opts = {
            method: "POST",
            params: {
                pointId: pointId,
                text: text
            }
        };

        const {data, error} = await useApi<any>("/user/notifications/push", opts);

        return error.value === null;
    }
}