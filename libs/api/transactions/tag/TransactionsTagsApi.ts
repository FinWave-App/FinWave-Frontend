import {Ref} from "vue";

export class TransactionsTagsApi {
    private tags: Ref<Array<any>> = ref([]);
    private tagsMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private tagsTreeMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private tagsTree: Ref<Array<any>> = ref([]);

    async init(): Promise<void> {
        const {data} = await useApi<any>("/user/transactions/tags/getList");

        this.tags.value = data.value.tags || [];

        data.value.tags.forEach((tag) => {
            this.tagsMap.value.set(tag.tagId, tag);
        })

        watch(this.tags, (old, newV) => {
            this.buildTree()
        }, { deep: true })

        this.buildTree();
    }

    public getTags(): Ref<Array<any>> {
        return this.tags;
    }

    public getTagsMap(): Ref<Map<number, any>> {
        return this.tagsMap;
    }

    public getTagsTreeMap(): Ref<Map<number, any>> {
        return this.tagsTreeMap;
    }

    public getTagsTree(): Ref<Array<any>> {
        return this.tagsTree;
    }

    private getParentTree(parentId: number) : string {
        return this.tags.value.find((t) => t.tagId === parentId).parentsTree + "." + parentId
    }

    private buildTree() : void {
        this.tagsTreeMap.value = new Map<number, any>;
        this.tagsTree.value = [];

        this.tags.value.forEach((t) => {
            let treeObject = {
                tag: t,
                childs: []
            };

            if (this.tagsTreeMap.value.get(t.tagId) === undefined) {
                this.tagsTreeMap.value.set(t.tagId, treeObject);
            }else {
                treeObject = this.tagsTreeMap.value.get(t.tagId);
                treeObject.tag = t;
            }

            if (t.parentsTree === '') {
                this.tagsTree.value.push(treeObject);
            } else {
                const tree = t.parentsTree.split('.');
                const parent = Number.parseInt(tree.slice(-1));

                if (this.tagsTreeMap.value.get(parent) === undefined) {
                    this.tagsTreeMap.value.set(parent, {
                        t: null,
                        childs: []
                    });
                }

                this.tagsTreeMap.value.get(parent).childs.push(treeObject);
            }
        })
    }

    public async newTag(type: number, expectedAmount: number, parentId: number, name: string, description: string | null) : Promise<boolean> {
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

        if (parentId !== -1)
            opts.params.parentId = parentId;

        const {data: newTag, error} = await useApi<any>("/user/transactions/tags/new", opts);

        if (error.value !== null) {
            return false;
        }

        this.tags.value?.push({
            tagId: newTag.value.tagId,
            type: type,
            expectedAmount: expectedAmount,
            parentsTree: parentId !== -1 ? this.getParentTree(parentId) : "",
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

        if (parentId !== -1) {
            opts.params.parentId = parentId;
        }else {
            opts.params.setToRoot = true;
        }

        const { error } = await useApi("/user/transactions/tags/editParent", opts);

        if (error.value !== null) {
            return false;
        }

        let parentsTree = ""

        if (parentId !== -1)
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