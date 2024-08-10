import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";

export class FilesApi extends AbstractApi {
    private files: Ref<Array<any>> = ref([]);
    private filesMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private availableSpace: Ref<any> = ref({usedBytes: 0, freeBytes: 0, maxBytes: 0});

    async init(): Promise<void | boolean> {
        await this.fetch();
    }

    public async fetch() : Promise<boolean> {
        const opts = {
            method: "GET",
            params: {}
        };

        useApi("/files/authed/availableSpace", {
            method: "GET",
            params: {}
        }).then((r) => {
            if (r.error.value === null && r.data.value)
                this.availableSpace.value = r.data.value;
        })

        const {data, error} = await useApi("/files/authed/getList", opts);

        if (error.value !== null) {
            return false;
        }

        this.files.value = data.value?.files || [];

        this.rebuildMap();

        return true;
    }

    public async upload(file : any, params: any) : Promise<boolean | any> {
        const formData = new FormData()
        formData.append('file', file)

        const opts = {
            method: "POST",
            params: params,
            body: formData
        };

        const {data, error} = await useApi("/files/authed/upload", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value;
    }

    public async delete(fileId: string) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                fileId: fileId
            }
        };

        const {data, error} = await useApi("/files/authed/delete", opts);

        if (error.value !== null) {
            return false;
        }

        this.files.value = this.files.value.filter(f => f.fileId !== fileId);
        this.rebuildMap()

        return true;
    }

    public async deleteAll() : Promise<boolean> {
        const opts = {
            method: "POST"
        };

        const {data, error} = await useApi("/files/authed/deleteAll", opts);

        if (error.value !== null) {
            return false;
        }

        this.files.value = [];
        this.rebuildMap()

        return true;
    }

    private rebuildMap() {
        const newMap = new Map<number, any>();

        this.files.value.forEach((file) => {
            newMap.set(file.fileId, file);
        });

        this.filesMap.value = newMap;
    }

    public getFiles(): Ref<Array<any>> {
        return this.files;
    }

    public getFilesMap(): Ref<Map<number, any>> {
        return this.filesMap;
    }

    public getAvailableSpace() : Ref<any> {
        return this.availableSpace;
    }
}