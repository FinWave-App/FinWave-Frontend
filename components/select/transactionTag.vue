<template>
  <Multiselect
      v-model.number="value"
      :options="parentSelectRender"
      >

    <template v-slot:singlelabel="{ value }">
      <p class="w-full p-4">
        {{ value.name }}
      </p>
    </template>

    <template v-slot:option="{ option }">
      {{ ("&nbsp;&nbsp;".repeat(option.deep)) + option.name }}
    </template>

  </Multiselect>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'

const props = defineProps({
  tagsTree: {
    required: true
  },

  canBeWithoutParent: {
    type: Boolean,
    required: true
  },

  excludeTagId: {
    required: false
  },

  modelValue: {
    type: Number
  }
})

const emit = defineEmits(['update:modelValue', 'selected'])

const { t } = useI18n();

const value = ref(props.modelValue);

const rootParent = {
  value: -1,
  disabled: false,
  deep: 0,
  name: t('transactionTagSelect.withoutParent')
};

const parentSelectRender = ref([]);

if (props.canBeWithoutParent)
  parentSelectRender.value.push(rootParent);

const selectRender = (deep, elements, resultArray) => {
  elements.forEach((e) => {
    resultArray.push(
        {
          value: e.tag.tagId,
          disabled: e.tag.tagId == props.excludeTagId,
          deep: deep,
          name: e.tag.name
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

watch(() => [props.tagsTree, props.canBeWithoutParent, props.excludeTagId], (l, n) => {
  parentSelectRender.value = [];

  if (props.canBeWithoutParent)
    parentSelectRender.value.push(rootParent);

  selectRender(0, props.tagsTree, parentSelectRender.value)
}, {deep: true})

selectRender(0, props.tagsTree, parentSelectRender.value)

</script>


<style scoped>

</style>