<template>
  <div class="page-panel">
    <div class="flex flex-row justify-between gap-2">
      <div class="flex flex-row gap-2 items-center">
        <p class="font-bold">
          {{$t("tagsPage.path")}}
        </p>

        <div class="text-sm breadcrumbs">
          <ul>
            <li><a @click="resetView()">Root</a></li>
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
  </div>
</template>

<script setup>
import Tag from "~/components/transactions/tag.vue";
import EditButton from "~/components/buttons/editButton.vue";
import ArrowLeftButton from "~/components/buttons/arrowLeftButton.vue";
import PlusButton from "~/components/buttons/plusButton.vue";

definePageMeta({
  middleware: [
    "auth"
  ]
})

const { t, locale } = useI18n();
const { $transactionsTagsApi } = useNuxtApp();

const formatter = Intl.NumberFormat(locale.value, {});

const tagsTree = $transactionsTagsApi.getTagsTree();
const tagsMap = $transactionsTagsApi.getTagsTreeMap();
const view = ref([]);
const tags = $transactionsTagsApi.getTags();

const editOpened = ref(false);
const newOpened = ref(false);
const tagToEdit = ref(null);

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

</script>

<style scoped>

</style>