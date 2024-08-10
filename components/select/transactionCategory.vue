<template>
  <Multiselect
      v-model="value"
      :options="parentSelectRender"
      :placeholder="$t('selects.transactionCategorySelect.placeholder')"
      :no-options-text="$t('selects.noOptions')"
      :no-results-text="$t('selects.noResults')"
      @search-change="search"
      >

    <template v-slot:option="{ option }">
      {{ ("&nbsp;&nbsp;".repeat(option.deep)) + option.label }}
    </template>

    <template v-slot:singlelabel="{ value }">
      <div class="multiselect-single-label flex gap-1">
        <div v-if="value.newCategory" class="badge badge-success badge-sm">{{ $t('selects.transactionCategorySelect.new') }}</div> {{ value.label }}
      </div>
    </template>

  </Multiselect>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'

const props = defineProps({
  categoriesTree: {
    required: true
  },

  canBeWithoutParent: {
    type: Boolean,
    required: true
  },

  excludeCategoryId: {
    required: false
  },

  allowNew: {
    type: Boolean,
    default: false
  },

  modelValue: {

  }
})

const emit = defineEmits(['update:modelValue', 'selected'])

const { t } = useI18n();

const value = ref(props.modelValue || null);

const rootParent = {
  value: -1,
  disabled: false,
  deep: 0,
  label: t('selects.transactionCategorySelect.withoutParent')
};

const parentSelectRender = ref([]);

if (props.canBeWithoutParent)
  parentSelectRender.value.push(rootParent);

let lastSearch = {
  text: "",
  noResults: false
}

const search = (e, ms) => {
  if (!props.allowNew)
    return;

  const noResults = lastSearch.noResults || parentSelectRender.value.length === (props.canBeWithoutParent ? 1 : 0);

  if (!e && noResults) {
    const result = {
      value: lastSearch.text,
      disabled: false,
      deep: 0,
      label: lastSearch.text,
      newCategory: true
    }

    ms.select(result);

    return;
  }

  lastSearch.text = e;
  lastSearch.noResults = ms.noResults;
}

const selectRender = (deep, elements, resultArray) => {
  elements.forEach((e) => {
    resultArray.push(
        {
          value: e.category.categoryId,
          disabled: e.category.categoryId == props.excludeCategoryId,
          deep: deep,
          label: e.category.name
        }
    )

    if (e.childs.length > 0)
      selectRender(deep + 1, e.childs, resultArray);
  })
}

watch(value, (l, n) => {
  if (value.value === null || props.modelValue == value.value)
    return;

  emit('update:modelValue', value.value);
  emit('selected');
});

watch(() => props.modelValue, () => {
  value.value = props.modelValue;
});

watch(() => [props.categoriesTree, props.canBeWithoutParent, props.excludeCategoryId], (l, n) => {
  parentSelectRender.value = [];

  if (props.canBeWithoutParent)
    parentSelectRender.value.push(rootParent);

  selectRender(0, props.categoriesTree, parentSelectRender.value)
}, {deep: true})

selectRender(0, props.categoriesTree, parentSelectRender.value)

</script>


<style scoped>

</style>