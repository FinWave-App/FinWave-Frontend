import {Ref} from "vue";

export class TransactionsTagsApi {
    private tags: Ref<Array<any>> = ref([]);

    async init(): Promise<void> {
        const {data} = await useApi<any>("/user/transactions/tags/getList");

        this.tags.value = data.value.tags || [];
    }

    public getTags(): Ref<Array<any>> {
        return this.tags;
    }

    private getParentTree(parentId: number) : string {
        return this.tags.value.find((t) => t.tagId === parentId).parentsTree + "." + parentId
    }

    public async newTag(type: number, expectedAmount: number, parentId: number | null, name: string, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                type: type,
                expectedAmount: expectedAmount,
                name: name
            }
        }

        if (description !== null && description.length > 0)
            opts.params.description = description;

        if (parentId !== null)
            opts.params.parentId = parentId;

        const {data: newTag, error} = await useApi<any>("/user/transactions/tags/new", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value?.push({
            tagId: newTag.value.tagId,
            type: type,
            expectedAmount: expectedAmount,
            parentsTree: parentId !== null ? this.getParentTree(parentId) : "",
            name: name,
            description: description
        });

        return true;
    }

    public async editTagType(type: number, tagId: number) {
        const opts = {
            method: "POST",
            params: { tagId: tagId, type: type }
        };

        const { error } = await useApi("/user/transactions/tags/editType", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value.find((t) => t.tagId == tagId).type = type;

        return true;
    }

    public async editTagExpectedAmount(expectedAmount: number, tagId: number) {
        const opts = {
            method: "POST",
            params: { tagId: tagId, expectedAmount: expectedAmount }
        };

        const { error } = await useApi("/user/transactions/tags/editExpectedAmount", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value.find((t) => t.tagId == tagId).expectedAmount = expectedAmount;

        return true;
    }

    public async editTagParent(parentId: number, tagId: number) {
        const opts = {
            method: "POST",
            params: { tagId: tagId }
        };

        if (parentId != 0) {
            opts.params.parentId = parentId;
        }else {
            opts.params.setToRoot = true;
        }

        const { error } = await useApi("/user/transactions/tags/editParent", opts);

        if (error.value !== null) {
            return false;
        }

        let parentsTree = ""

        if (parentId != 0)
            parentsTree = this.tags.value.find((t) => t.tagId == parentId).parentsTree + "." + parentId;

        this.tags.value.find((t) => t.tagId == tagId).parentsTree = parentsTree;

        return true;
    }

    public async editTagName(name: string, tagId: number) {
        const opts = {
            method: "POST",
            params: { tagId: tagId, name: name }
        };

        const { error } = await useApi("/user/transactions/tags/editName", opts);

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

        const { error } = await useApi("/user/transactions/tags/editDescription", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value.find((t) => t.tagId == tagId).description = description;

        return true;
    }
}