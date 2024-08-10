import {Ref} from "vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class AccountsFoldersApi extends AbstractApi {
    private folders: Ref<Array<any>> = ref([]);

    async init(): Promise<void | boolean> {
        await this.fetch();
    }

    public getFolders(): Ref<Array<any> | null> {
        return this.folders;
    }

    public async fetch(): Promise<void> {
        const {data} = await useApi<any>("/user/accounts/folders/getList");

        if (data.value === null)
            return;

        this.folders.value = data.value.folders || [];
    }

    public async newFolder(name: string, description: string | null) : Promise<number> {
        const opts = {
            method: "POST",
            params: { name: name }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {data: newFolder, error} = await useApi("/user/accounts/folders/new", opts);

        if (error.value !== null) {
            return -1;
        }

        this.folders.value.push({
            folderId: newFolder.value.folderId,
            name: name,
            description: description
        });

        return newFolder.value.folderId;
    }

    public async editFolderName(name: string, folderId: number) {
        const opts = {
            method: "POST",
            params: { folderId: folderId, name: name }
        };

        const { error } = await useApi("/user/accounts/folders/editName", opts);

        if (error.value !== null) {
            return false;
        }

        this.folders.value.find((t) => t.folderId == folderId).name = name;

        return true;
    }

    public async editFolderDescription(description: string, folderId: number) {
        const opts = {
            method: "POST",
            params: { folderId: folderId, description: description }
        };

        const { error } = await useApi("/user/accounts/folders/editDescription", opts);

        if (error.value !== null) {
            return false;
        }

        this.folders.value.find((t) => t.folderId == folderId).description = description;

        return true;
    }

    public async deleteFolder(id: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { folderId: id }
        };

        const {error} = await useApi("/user/accounts/folders/delete", opts);

        if (error.value !== null) {
            return false;
        }

        this.folders.value = this.folders.value.filter((t) => t.folderId != id);

        return true;
    }
}