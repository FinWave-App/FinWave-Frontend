<template>
  <div class="account-panel">
    <div class="flex justify-between gap-2">
      <p class="text-lg">
        {{account.name}}
      </p>
      <div class="flex gap-2">
        <hide-button class="btn btn-xs btn-ghost m-0 p-0.5" :hide-status="hideStatus" @hide="setHide" @unHide="unHide"> </hide-button>
      </div>
    </div>

    <p v-if="!account.hidden" class="opacity-80 text-sm">
      {{account.description}}
    </p>

    <p class="font-bold">
      {{ formatter.format(123123123.123456) }}
    </p>


  </div>
</template>

<script setup>
import HideButton from "~/components/buttons/hideButton.vue";

const props = defineProps({
  account: {}
})

const hideStatus = ref(props.account.hidden);

const { t, locale } = useI18n();
const { $currenciesApi } = useNuxtApp();
const currency = (await $currenciesApi.getCurrencies()).value.find(c => c.currencyId === props.account.currencyId)

const formatter = Intl.NumberFormat(locale.value, {
  style: 'currency',
  currency: currency.code
});

const setHide = () => {

}

const unHide = () => {

}

</script>

<style scoped>
.account-panel {
  @apply p-3 px-4 bg-base-100 rounded-xl shadow;
}
</style>