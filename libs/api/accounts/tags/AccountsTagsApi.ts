import {Ref} from "vue";

export class AccountsTagsApi {
    private tags: Ref<Array<any>> = ref([]);

    async init(): Promise<void> {
        const {data} = await useApi<any>("/user/accounts/tags/getList");

        this.tags.value = data.value.tags || [];
    }

    public getTags(): Ref<Array<any> | null> {
        return this.tags;
    }

    public async newTag(name: string, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { name: name }
        };

        if (description !== null && description.length > 0)
            opts.params.description = description;

        const {data: newTag, error} = await useApi("/user/accounts/tags/new", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value.push({
            tagId: newTag.value.tagId,
            name: name,
            description: description
        });

        return true;
    }

    public async editTagName(name: string, tagId: number) {
        const opts = {
            method: "POST",
            params: { tagId: tagId, name: name }
        };

        const { error } = await useApi("/user/accounts/tags/editName", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value.find((t) => t.tagId == tagId).name = name;

        return true;
    }

    public async editTagDescription(description: string, tagId: number) {
        const opts = {
            method: "POST",
            params: { tagId: tagId, description: description }
        };

        const { error } = await useApi("/user/accounts/tags/editDescription", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value.find((t) => t.tagId == tagId).description = description;

        return true;
    }

    public async deleteTag(id: number) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: { tagId: id }
        };

        const {error} = await useApi("/user/accounts/tags/delete", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value = this.tags.value.filter((t) => t.tagId != id);

        return true;
    }
}