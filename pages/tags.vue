<template>
  <div class="page-grid">
    <div class="col-span-3">
      <tags-management-summary />
    </div>

    <div class="panel col-span-3">
      <div class="flex flex-row justify-between gap-2">
        <div class="flex flex-row gap-2 items-center">
          <p class="font-bold">
            {{$t("tagsPage.path")}}
          </p>

          <div class="text-sm breadcrumbs">
            <ul>
              <li><a @click="resetView()"> {{$t("tagsPage.root")}} </a></li>
              <li v-if="view.length > 0" v-for="item in view"><a @click="cutUnder(item)"> {{tagsMap.get(item).tag.name}} </a></li>
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
            <th>{{$t("tagsPage.table.name")}}</th>
            <th>{{$t("tagsPage.table.tagType.type")}}</th>
            <th>{{$t("tagsPage.table.management.title")}}</th>
            <th>{{$t("tagsPage.table.description")}}</th>
            <th class="text-right">{{$t("tagsPage.table.action")}}</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="entry in (view.length > 0 ? tagsMap.get(view[view.length - 1]).childs : tagsTree)">
            <th class="w-64">{{entry.tag.name}}</th>
            <td class="w-32 font-bold"
                :class="{'text-success' : entry.tag.type == 1, 'text-error' : entry.tag.type == -1}">
              {{ tagTypeToString(entry.tag.type) }}
            </td>
            <td>
              <plus-button v-if="findManagements(entry).length === 0" class="btn btn-ghost btn-xs" @event="managementTag(entry.tag)"></plus-button>
              <template v-else>
                <div class="flex gap-2 items-center">
                  <edit-button class="btn btn-ghost btn-xs" @event="managementTag(entry.tag)"></edit-button>

                  <div class="flex gap-2 flex-wrap items-center">
                    <div class="badge whitespace-nowrap" v-for="management in findManagements(entry)" :class="{'badge-primary' : management.tagId === entry.tag.tagId, 'badge-neutral' : management.tagId !== entry.tag.tagId}">
                      {{ formatDelta(management.amount, management.currencyId) + " " + $t("tagsPage.table.management.dateTypes." + (management.dateType == 0 ? "perMonth" : "perQuartal")) }}
                    </div>
                  </div>
                </div>
              </template>
            </td>
            <td>{{entry.tag.description}}</td>
            <td class="text-right">
              <edit-button class="btn btn-ghost btn-xs" @event="editTag(entry.tag)"></edit-button>
            </td>
            <td class="text-right w-1 p-1">
              <arrow-left-button @event="pushToView(entry.tag.tagId)" v-if="entry.childs.length > 0" class="btn btn-ghost btn-xs"></arrow-left-button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <modal-transaction-tag-edit :opened="editOpened" :tag="tagToEdit" :tags-map="tagsMap" :tags-tree="tagsTree" @close="editOpened = false"/>
      <modal-transaction-tag-create :opened="newOpened" @close="newOpened = false"></modal-transaction-tag-create>
      <modal-transaction-tag-management :opened="managementOpened" :tag="tagToEdit" @close="managementOpened = false" />
    </div>
  </div>

</template>

<script setup>
import Tag from "~/components/transactions/tag.vue";
import EditButton from "~/components/buttons/editButton.vue";
import ArrowLeftButton from "~/components/buttons/arrowLeftButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";
import TagsManagementSummary from "~/components/misc/tagsManagementSummary.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const { t, locale } = useI18n();
const { $transactionsTagsApi, $tagsManagementApi, $currenciesApi } = useNuxtApp();

const formatter = Intl.NumberFormat(locale.value, {});

const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();
const view = ref([]);
const tags = $transactionsTagsApi.getTags();

const managementsMap = $tagsManagementApi.getTagToManagementsMap();

const currenciesMap = $currenciesApi.getCurrenciesMap();

const managementOpened = ref(false);
const editOpened = ref(false);
const newOpened = ref(false);
const tagToEdit = ref(null);

const formatDelta = (delta, currencyId) => {
  const currency = currenciesMap.value.get(currencyId);
  const formatter = Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency.decimals
  });
  return formatter.format(delta).replace(currency.code + " ", currency.symbol).replace(" " + currency.code, " " + currency.symbol);
}

const findManagements = (treeEntry, fromRoot = true) => {
  let result = [];

  if (!treeEntry || !treeEntry.tag)
    return result;

  const management = managementsMap.value.get(treeEntry.tag.tagId);

  if (management)
    result = JSON.parse(JSON.stringify(management)) // deep copy array;

  let children = [];

  for (const child of treeEntry.childs) {
    const childrenManagements = findManagements(child, false);

    if (!childrenManagements)
      continue;

    for (const childManagement of childrenManagements) {
      const ownManagement = children.find((m) => m.currencyId === childManagement.currencyId && m.dateType == childManagement.dateType);

      if (ownManagement) {
        ownManagement.amount += childManagement.amount;
      }else {
        children.push(childManagement)
      }
    }
  }

  return result.concat(children);
}

const tagTypeToString = (type) => {
  const text = type == 1 ? "income" : (type == -1 ? "expense" : "mixed");

  return t("tagsPage.table.tagType." + text);
}

const pushToView = (tagId) => {
  view.value.push(tagId)
}

const cutUnder = (tagId) => {
  view.value.length = view.value.findIndex(id => id === tagId) + 1;
}

const resetView = () => {
  view.value = [];
}

const editTag = (tag) => {
  tagToEdit.value = tag;
  editOpened.value = true;
}

const managementTag = (tag) => {
  tagToEdit.value = tag;
  managementOpened.value = true;
}

</script>

<style scoped>

</style>