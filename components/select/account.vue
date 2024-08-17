<template>
  <Multiselect
      v-model="value"
      :groups="true"
      :options="options"
      :placeholder="$t('selects.accountSelect.placeholder')"
      :no-options-text="$t('selects.noOptions')"
      :no-results-text="$t('selects.noResults')"
  >

  </Multiselect>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";
import {useArrayFilter} from "@vueuse/core";

const props = defineProps({
  modelValue: {
  },

  excludeAccount: {
    type: Number
  },

  currencyFilter: {
    type: Number
  },

  overrideHidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'selected'])
const { t } = useI18n();
const {$accountsApi, $accountsFoldersApi} = useNuxtApp();

const folders = $accountsFoldersApi.getFolders();
const accounts = $accountsApi.getAccounts();

const value = ref(props.modelValue || null);

const getFolderAccounts = (t) => {
  return useArrayFilter(accounts, a => a.folderId === t.folderId && (!props.currencyFilter || a.currencyId === props.currencyFilter)).value
}

const options = computed(() => {
  const resultArray = [];

  folders.value.forEach((t) => {
    const options = getFolderAccounts(t)
        .map((a) => {
          if (props.excludeAccount && props.excludeAccount === a.accountId || !props.overrideHidden && a.hidden)
            return null;

          return {
            label: a.name,
            value: a.accountId
          }
        })
        .filter(a => a !== null);

    if (options.length > 0)
      resultArray.push({
        label: t.name,
        options: options
      });
  });

  return resultArray;
});

watch(value, (l, n) => {
  if (value.value === null || props.modelValue == value.value)
    return;

  emit('update:modelValue', value.value);
  emit('selected');
});

watch(() => props.modelValue, () => {
  value.value = props.modelValue;
});

</script>

<style scoped>

</style>