<template>
  <div class="page-grid">
    <div class="col-span-3">
      <categories-budget-summary />
    </div>

    <div class="panel col-span-3">
      <div class="flex flex-row justify-between gap-2">
        <div class="flex flex-row gap-2 items-center">
          <p class="font-bold">
            {{$t("categoriesPage.path")}}
          </p>

          <div class="text-sm breadcrumbs">
            <ul>
              <li><a @click="resetView()"> {{$t("categoriesPage.root")}} </a></li>
              <li v-if="view.length > 0" v-for="item in view"><a @click="cutUnder(item)"> {{categoriesMap.get(item).category.name}} </a></li>
            </ul>
          </div>
        </div>
        <div>
          <plus-button class="btn btn-sm btn-ghost" @event="newOpened = true"></plus-button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-sm lg:table-md table-zebra table-pin-rows">
          <thead>
          <tr>
            <th>{{$t("categoriesPage.table.name")}}</th>
            <th>{{$t("categoriesPage.table.categoryType.type")}}</th>
            <th>{{$t("categoriesPage.table.budget.title")}}</th>
            <th>{{$t("categoriesPage.table.description")}}</th>
            <th class="text-right">{{$t("categoriesPage.table.action")}}</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="entry in (view.length > 0 ? categoriesMap.get(view[view.length - 1]).childs : categoriesTree)">
            <th class="w-64">{{entry.category.name}}</th>
            <td class="w-32 font-bold"
                :class="{'text-success' : entry.category.type == 1, 'text-error' : entry.category.type == -1}">
              {{ categoryTypeToString(entry.category.type) }}
            </td>
            <td>
              <plus-button v-if="findBudgets(entry).length === 0" class="btn btn-ghost btn-xs" @event="budgetCategory(entry.category)"></plus-button>
              <template v-else>
                <div class="flex gap-2 items-center">
                  <edit-button class="btn btn-ghost btn-xs" @event="budgetCategory(entry.category)"></edit-button>

                  <div class="flex gap-2 flex-wrap items-center">
                    <div class="badge whitespace-nowrap" v-for="budget in findBudgets(entry)" :class="{'badge-primary' : budget.categoryId === entry.category.categoryId, 'badge-neutral' : budget.categoryId !== entry.category.categoryId}">
                      {{ formatDelta(budget.amount, budget.currencyId) + " " + $t("categoriesPage.table.budget.dateTypes." + (budget.dateType == 0 ? "perMonth" : "perQuartal")) }}
                    </div>
                  </div>
                </div>
              </template>
            </td>
            <td>{{entry.category.description}}</td>
            <td class="text-right">
              <edit-button class="btn btn-ghost btn-xs" @event="editCategory(entry.category)"></edit-button>
            </td>
            <td class="text-right w-1 p-1">
              <arrow-left-button @event="pushToView(entry.category.categoryId)" v-if="entry.childs.length > 0" class="btn btn-ghost btn-xs"></arrow-left-button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-if="(view.length > 0 ? categoriesMap.get(view[view.length - 1]).childs : categoriesTree).length === 0" class="w-full template-border flex items-center justify-center text-center rounded-xl h-min p-4 mt-2">
        <p class="font-bold opacity-50">{{ $t("categoriesPage.emptyMessage") }}</p>
      </div>

      <modal-transaction-category-edit :opened="editOpened" :category="categoryToEdit" :categories-map="categoriesMap" :categories-tree="categoriesTree" @close="editOpened = false"/>
      <modal-transaction-category-create :opened="newOpened" @close="newOpened = false"></modal-transaction-category-create>
      <modal-transaction-category-budget :opened="budgetOpened" :category="categoryToEdit" @close="budgetOpened = false" />
    </div>
  </div>

</template>

<script setup>
import EditButton from "~/components/buttons/editButton.vue";
import ArrowLeftButton from "~/components/buttons/arrowLeftButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import CategoriesBudgetSummary from "~/components/misc/categoriesBudgetSummary.vue";
import {useCurrencyFormatter} from "~/composables/useCurrencyFormatter";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const { t, locale } = useI18n();
const { $transactionsCategoriesApi, $categoriesBudgetApi, $currenciesApi } = useNuxtApp();

const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();
const categoriesMap = $transactionsCategoriesApi.getCategoriesTreeMap();
const view = ref([]);
const categories = $transactionsCategoriesApi.getCategories();

const budgetsMap = $categoriesBudgetApi.getCategoryToBudgetsMap();

const currenciesMap = $currenciesApi.getCurrenciesMap();

const budgetOpened = ref(false);
const editOpened = ref(false);
const newOpened = ref(false);
const categoryToEdit = ref(null);

const formatDelta = (delta, currencyId) => {
  const currency = currenciesMap.value.get(currencyId);
  return useCurrencyFormatter(delta, currency, locale.value);
}

const findBudgets = (treeEntry, fromRoot = true) => {
  let result = [];

  if (!treeEntry || !treeEntry.category)
    return result;

  const budget = budgetsMap.value.get(treeEntry.category.categoryId);

  if (budget)
    result = JSON.parse(JSON.stringify(budget)) // deep copy array;

  let children = [];

  for (const child of treeEntry.childs) {
    const childrenBudgets = findBudgets(child, false);

    if (!childrenBudgets)
      continue;

    for (const childBudget of childrenBudgets) {
      const ownBudget = children.find((m) => m.currencyId === childBudget.currencyId && m.dateType == childBudget.dateType);

      if (ownBudget) {
        ownBudget.amount += childBudget.amount;
      }else {
        children.push(childBudget)
      }
    }
  }

  return result.concat(children);
}

const categoryTypeToString = (type) => {
  const text = type == 1 ? "income" : (type == -1 ? "expense" : "mixed");

  return t("categoriesPage.table.categoryType." + text);
}

const pushToView = (categoryId) => {
  view.value.push(categoryId)
}

const cutUnder = (categoryId) => {
  view.value.length = view.value.findIndex(id => id === categoryId) + 1;
}

const resetView = () => {
  view.value = [];
}

const editCategory = (category) => {
  categoryToEdit.value = category;
  editOpened.value = true;
}

const budgetCategory = (category) => {
  categoryToEdit.value = category;
  budgetOpened.value = true;
}

</script>

<style scoped>

</style>