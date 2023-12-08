import {Ref} from "vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class TransactionsTagsApi extends AbstractApi {
    private tags: Ref<Array<any>> = ref([]);
    private tagsMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private tagsTreeMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private tagsTree: Ref<Array<any>> = ref([]);

    async init(): Promise<void | boolean> {
        const {data} = await useApi<any>("/user/transactions/tags/getList");

        if (data.value === null)
            return;

        this.tags.value = data.value.tags || [];

        watch(this.tags, (old, newV) => {
            this.buildTree()
        }, { deep: true })

        this.buildTree();
    }

    private rebuildMap() {
        const newMap = new Map<number, any>();

        this.tags.value.forEach((tag) => {
            newMap.set(tag.tagId, tag);
        })

        this.tagsMap.value = newMap;
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
        this.rebuildMap();

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

    public async newTag(type: number, parentId: number, name: string, description: string | null) : Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                type: type,
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
            parentsTree: parentId !== -1 ? this.getParentTree(parentId) : "",
            name: name,
            description: description
        });

        this.rebuildMap();

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