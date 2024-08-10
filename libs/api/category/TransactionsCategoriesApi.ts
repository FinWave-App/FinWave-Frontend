import {Ref} from "vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class TransactionsCategoriesApi extends AbstractApi {
    private categories: Ref<Array<any>> = ref([]);
    private categoriesMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private categoriesTreeMap: Ref<Map<number, any>> = ref(new Map<number, any>);
    private categoriesTree: Ref<Array<any>> = ref([]);

    async init(): Promise<void | boolean> {
        watch(this.categories, (old, newV) => {
            this.buildTree()
        }, { deep: true })

        await this.fetch();
    }

    public async fetch() : Promise<void> {
        const {data} = await useApi<any>("/user/transactions/categories/getList");

        if (data.value === null)
            return;

        this.categories.value = data.value.categories || [];
    }

    private rebuildMap() {
        const newMap = new Map<number, any>();

        this.categories.value.forEach((category) => {
            newMap.set(category.categoryId, category);
        })

        this.categoriesMap.value = newMap;
    }

    public getCategories(): Ref<Array<any>> {
        return this.categories;
    }

    public getCategoriesMap(): Ref<Map<number, any>> {
        return this.categoriesMap;
    }

    public getCategoriesTreeMap(): Ref<Map<number, any>> {
        return this.categoriesTreeMap;
    }

    public getCategoriesTree(): Ref<Array<any>> {
        return this.categoriesTree;
    }

    private getParentTree(parentId: number) : string {
        return this.categories.value.find((t) => t.categoryId === parentId).parentsTree + "." + parentId
    }

    private buildTree() : void {
        this.rebuildMap();

        this.categoriesTreeMap.value = new Map<number, any>;
        this.categoriesTree.value = [];

        this.categories.value.forEach((t) => {
            let treeObject = {
                category: t,
                childs: []
            };

            if (this.categoriesTreeMap.value.get(t.categoryId) === undefined) {
                this.categoriesTreeMap.value.set(t.categoryId, treeObject);
            }else {
                treeObject = this.categoriesTreeMap.value.get(t.categoryId);
                treeObject.category = t;
            }

            if (t.parentsTree === '') {
                this.categoriesTree.value.push(treeObject);
            } else {
                const tree = t.parentsTree.split('.');
                const parent = Number.parseInt(tree.slice(-1));

                if (this.categoriesTreeMap.value.get(parent) === undefined) {
                    this.categoriesTreeMap.value.set(parent, {
                        t: null,
                        childs: []
                    });
                }

                this.categoriesTreeMap.value.get(parent).childs.push(treeObject);
            }
        })
    }

    public async newCategory(type: number, parentId: number, name: string, description: string | null) : Promise<number> {
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

        const {data: newCategory, error} = await useApi<any>("/user/transactions/categories/new", opts);

        if (error.value !== null) {
            return -1;
        }

        this.categories.value?.push({
            categoryId: newCategory.value.categoryId,
            type: type,
            parentsTree: parentId !== -1 ? this.getParentTree(parentId) : "",
            name: name,
            description: description
        });

        this.rebuildMap();

        return newCategory.value.categoryId;
    }

    public async editCategoryType(type: number, categoryId: number) {
        const opts = {
            method: "POST",
            params: { categoryId: categoryId, type: type }
        };

        const { error } = await useApi("/user/transactions/categories/editType", opts);

        if (error.value !== null) {
            return false;
        }

        this.categories.value.find((t) => t.categoryId == categoryId).type = type;

        return true;
    }

    public async editCategoryParent(parentId: number, categoryId: number) {
        const opts = {
            method: "POST",
            params: { categoryId: categoryId }
        };

        if (parentId !== -1) {
            opts.params.parentId = parentId;
        }else {
            opts.params.setToRoot = true;
        }

        const { error } = await useApi("/user/transactions/categories/editParent", opts);

        if (error.value !== null) {
            return false;
        }

        let parentsTree = ""

        if (parentId !== -1)
            parentsTree = this.categories.value.find((t) => t.categoryId == parentId).parentsTree + "." + parentId;

        this.categories.value.find((t) => t.categoryId == categoryId).parentsTree = parentsTree;

        return true;
    }

    public async editCategoryName(name: string, categoryId: number) {
        const opts = {
            method: "POST",
            params: { categoryId: categoryId, name: name }
        };

        const { error } = await useApi("/user/transactions/categories/editName", opts);

        if (error.value !== null) {
            return false;
        }

        this.categories.value.find((t) => t.categoryId == categoryId).name = name;

        return true;
    }

    public async editCategoryDescription(description: string, categoryId: number) {
        const opts = {
            method: "POST",
            params: { categoryId: categoryId, description: description }
        };

        const { error } = await useApi("/user/transactions/categories/editDescription", opts);

        if (error.value !== null) {
            return false;
        }

        this.categories.value.find((t) => t.categoryId == categoryId).description = description;

        return true;
    }
}