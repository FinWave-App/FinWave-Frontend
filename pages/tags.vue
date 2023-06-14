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
            <li v-if="view.length > 0" v-for="item in view"><a @click="cutUnder(item)"> {{tagsMap[item].tag.name}} </a></li>
          </ul>
        </div>
      </div>
      <div>
        <plus-button class="btn btn-sm btn-ghost" @event=""></plus-button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-sm lg:table-md table-zebra table-pin-rows">
        <thead>
        <tr>
          <th>{{$t("tagsPage.table.name")}}</th>
          <th>{{$t("tagsPage.table.expectedAmount")}}</th>
          <th>{{$t("tagsPage.table.type")}}</th>
          <th>{{$t("tagsPage.table.description")}}</th>
          <th class="text-right">{{$t("tagsPage.table.action")}}</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="entry in (view.length > 0 ? tagsMap[view[view.length - 1]].childs : tagsTree)">
          <th class="w-64">{{entry.tag.name}}</th>
          <td class="w-32">{{ formatter.format(entry.tag.expectedAmount)}}</td>
          <td class="w-32">{{entry.tag.type}}</td>
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

    <modal-transaction-tag-edit :opened="editOpened" :tag="tagToEdit" @close="editOpened = false"/>

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

let tagsTree = [];
let tagsMap = {};
const view = ref([]);
const tags = $transactionsTagsApi.getTags();

const editOpened = ref(false);
const tagToEdit = ref(null);

const buildTree = () => {
  tagsTree = [];
  tagsMap = {};
  
  tags.value.forEach((t) => {
    let treeObject = {
      tag: t,
      childs: []
    };

    if (tagsMap[t.tagId] === undefined) {
      tagsMap[t.tagId] = treeObject;
    }else {
      treeObject = tagsMap[t.tagId]
      treeObject.tag = t;
    }

    if (t.parentsTree === '') {
      tagsTree.push(treeObject);
    } else {
      const tree = t.parentsTree.split('.');
      const parent = Number.parseInt(tree[tree.length - 1]);

      if (tagsMap[parent] === undefined) {
        tagsMap[parent] = {
          t: null,
          childs: []
        }
      }

      tagsMap[parent].childs.push(treeObject)
    }
  })

}

watch(tags, (old, newV) => {
  buildTree()
})

buildTree()

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

const newTag = () => {
  //$transactionsTagsApi.newTag(0, 100, 4, "Test Parent", "123")
}

</script>

<style scoped>

</style>