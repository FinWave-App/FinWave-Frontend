<template>
    <modal-base :title="$t('modals.csvImport.title')" :opened="opened" :name="'csv-import-modal'"
                :modal-class="'modal-top sm:modal-middle'"
                :modal-box-class="'sm:w-fit sm:max-w-5xl'">
      <ul class="steps mb-4 w-full">
        <li class="step" :class="{'step-success' : step >= 0}">{{ $t('modals.csvImport.steps.fileSelect') }}</li>
        <li class="step" :class="{'step-success' : step >= 1}">{{ $t('modals.csvImport.steps.columnsDefining') }}</li>
        <li class="step" :class="{'step-success' : step >= 2}">{{ $t('modals.csvImport.steps.unknownValuesDefinition') }}</li>
      </ul>

      <template v-if="step === 0">
        <div class="w-full flex justify-center items-center">
          <input type="file" @change="handleFileUpload" accept=".csv" class="file-input file-input-bordered w-full max-w-lg" />
        </div>
      </template>

      <template v-if="step === 1">
        <div class="alert alert-warning my-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>{{ $t("modals.csvImport.warning") }}</span>
        </div>

        <div class="flex justify-center w-full gap-4">
          <div class="join">
            <div class="join-item flex justify-center items-center px-4 bg-base-200">
              {{ignoreText()[0]}}
            </div>

            <input type="number"
                   class="input input-bordered w-32 join-item"
                   min="0"
                   v-model.number="ignoreFirst"
            />

            <div class="join-item flex justify-center items-center px-4 bg-base-200">
              {{ignoreText()[2]}}
            </div>
          </div>

          <div class="flex justify-center items-center px-4 bg-base-200 rounded-lg">
            {{ $t('modals.csvImport.readLines', parsedData.length) }}
          </div>
        </div>

        <div class="overflow-x-auto mt-2">
          <table class="table">
            <thead>

            <tr>
              <th v-for="i in maxColumns">
                <select class="select select-sm w-fit" v-model="definedColumns[i - 1]" :class="{'select-error' : (highlightError && definedColumnsValid() === i - 1)}">
                  <option :value="-1" disabled> {{ $t("modals.csvImport.columnsTypes.toSelect") }} </option>
                  <option v-for="(type, index) in columTypes" :value="index"> {{ $t("modals.csvImport.columnsTypes." + type) }} </option>
                </select>
              </th>
            </tr>

            </thead>
            <tbody>

            <tr v-for="(row, i) in parsedData.slice(Math.max(ignoreFirst - 1, 0), 5 + Math.max(ignoreFirst - 1, 0))" :class="{'opacity-20' : ignoreFirst > 0 && i === 0}">
              <th v-for="cell in row">{{ cell }}</th>
            </tr>

            <tr v-if="5 + ignoreFirst < parsedData.length">
              <th v-for="i in maxColumns">
                ...
              </th>
            </tr>

            </tbody>
          </table>
        </div>
      </template>

      <template v-if="step === 2">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-center gap-2 w-full items-center" v-if="needDate || needAccount || needCategory">
            <div class="form-control w-full" v-if="needDate">
              <label class="label">
                <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionDate') }}</span>
              </label>

              <Datepicker class="input-bordered dp-h-12"
                          v-model="date"
                          :teleport="true"
                          :locale="locale"
                          :class="{'input-error' : highlightError && !date}"
                          teleport-center
              />
            </div>

            <div class="form-control w-full" v-if="needAccount">
              <label class="label">
                <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionAccount') }}</span>
              </label>

              <select-account class="w-full"
                              v-model="account"
                              :class="{'input-error' : highlightError && account === undefined}"
              />
            </div>

            <div class="form-control w-full" v-if="needCategory">
              <label class="label">
                <span class="label-text">{{ $t('modals.newTransaction.placeholders.transactionCategory') }}</span>
              </label>

              <select-transaction-category class="w-full"
                                      v-model="category"
                                      :searchable="true"
                                      :can-be-without-parent="false"
                                      :allow-new="true"
                                      :categories-tree="categoriesTree"
                                      :class="{'input-error' : highlightError && category === undefined}"
              />
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label pt-0">
              <span class="label-text">{{ $t('modals.csvImport.placeholders.description') }}</span>
            </label>
            <textarea class="textarea input-bordered"
                      :placeholder="$t('modals.csvImport.placeholders.description')"
                      v-model.trim="description"
                      :maxlength="configs.maxDescriptionLength">
            </textarea>
          </div>
          <div v-if="unknownValues.size > 0">

            <div v-for="entry in unknownValues" class="form-control w-full mt-2">
              <label class="label pt-0">
                <span class="label-text">{{ $t('modals.csvImport.placeholders.unrecognized.' + columTypes[entry[0]]) }}</span>
              </label>

              <div class="flex gap-2 flex-col">
                <div v-for="name in entry[1]" class="w-full">
                  <div class="join w-full">
                    <div class="join-item flex justify-center items-center px-4 bg-base-200">
                      {{ name }}

                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 ml-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                      </svg>

                    </div>

                    <select-account
                        v-if="entry[0] === 1"
                        class="w-full join-item"
                        v-model="unknownMap.get(entry[0])[name]"
                        :class="{'input-error' : highlightError && !unknownMap.get(entry[0])[name]}"
                    />

                    <input
                        v-else-if="entry[0] === 2"
                        class="w-full input input-bordered join-item"
                        type="number"
                        v-model.number="unknownMap.get(entry[0])[name]"
                        :class="{'input-error' : highlightError && !unknownMap.get(entry[0])[name]}"
                    />

                    <select-transaction-category
                        v-else-if="entry[0] === 3"
                        class="w-full join-item"
                        v-model="unknownMap.get(entry[0])[name]"
                        :searchable="true"
                        :can-be-without-parent="false"
                        :allow-new="false"
                        :categories-tree="categoriesTree"
                        :class="{'input-error' : highlightError && !unknownMap.get(entry[0])[name]}"
                    />

                    <Datepicker
                        v-else-if="entry[0] === 4"
                        class="input-bordered dp-h-12"
                        v-model="unknownMap.get(entry[0])[name]"
                        :teleport="true"
                        :locale="locale"
                        :class="{'input-error' : highlightError && !unknownMap.get(entry[0])[name]}"
                        teleport-center
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <label class="label cursor-pointer">
            <span class="label-text">{{ $t('modals.csvImport.immediatelyApply') }}</span>
            <input type="checkbox" class="toggle toggle-success" v-model="immediatelyApply"/>
          </label>
        </div>

      </template>

      <div class="modal-action justify-between flex-row-reverse">
        <div v-if="step > 0" class="flex gap-2">
          <button @click="step--" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.back') }}</button>
          <button @click="nextStep" class="btn btn-sm" :class="{'btn-success' : nextStepAvailable(), 'btn-warning' : !nextStepAvailable()}">{{ $t('modals.buttons.confirm') }}</button>
        </div>

        <button @click="close" class="btn btn-sm btn-error">{{ $t('modals.buttons.cancel') }}</button>
      </div>
    </modal-base>
</template>

<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import "moment/locale/ru.js"
import "moment/locale/ro.js"
import moment from "moment";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, locale } = useI18n();
const papa = usePapaParse();

const {$serverConfigs, $transactionsCategoriesApi, $accountsApi, $toastsManager} = useNuxtApp();

const configs = $serverConfigs.configs.transactions;

const accounts = $accountsApi.getAccounts();
const accountsMap = $accountsApi.getAccountsMap();
const categories = $transactionsCategoriesApi.getCategories();
const categoriesTree = $transactionsCategoriesApi.getCategoriesTree();
const categoriesMap = $transactionsCategoriesApi.getCategoriesTreeMap();

const emit = defineEmits(['close', 'addTransactions', 'applyTransactions'])
const step = ref(0);

const parsedData = ref([])
const maxColumns = ref(0);
const ignoreFirst = ref(1);

const immediatelyApply = ref(false);

const columTypes = [
    "ignore",
    "account",
    "amount",
    "category",
    "date",
    "description"
]

const definedColumns = ref({})

const needAccount = ref(false);
const needCategory = ref(false);
const needDate = ref(false);

const account = ref();
const category = ref();
const date = ref(new Date());
const description = ref();

const highlightError = ref(false)

const unknownValues = ref(new Map());
const unknownMap = ref(new Map());

const parseDateWithLocale = (dateString) => {
  moment.locale(locale.value);

  const formats = {
    'ru': ['DD MMMM YYYY', 'DD.MM.YYYY', 'D MMM YYYY', 'YYYY-MM-DD'],
    'en': ['MMMM DD, YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'D MMM YYYY'],
    'ro': ['DD MMMM YYYY', 'DD.MM.YYYY', 'D MMM YYYY', 'YYYY-MM-DD']
  };

  const parsedDate = moment(dateString, formats[locale.value], true);

  if (parsedDate.isValid()) {
    return parsedDate.toDate();
  } else {
    return null;
  }
}

const transformToTransactions = () => {
  const result = [];

  for (let row = ignoreFirst.value; row < parsedData.value.length; row++) {
    let rowData = parsedData.value[row];

    const transaction = {
      _id: Date.now(),
      type: 0,
      categoryId: category.value,
      accountId: account.value,
      created: date.value,
      delta: 0,
      description: description.value || ""
    }

    for (let cell = 0; cell < rowData.length; cell++) {
      const type = definedColumns.value[cell];
      const data = rowData[cell];

      if (type === 0)
        continue;

      switch (type) {
        case 1: // account
          let account = accounts.value.find((a) => a.name.toLowerCase() === data.toLowerCase())

          if (account)
            account = account.accountId
          else
            account = unknownMap.value.get(type)[data];

          transaction.accountId = account;

          break;
        case 2: // amount
            let amount = Number.parseFloat(data);

            if (Number.isNaN(amount))
              amount = unknownMap.value.get(type)[data];

          transaction.delta = amount;

          break;
        case 3: // category
            let category = categories.value.find((t) => t.name.toLowerCase() === data.toLowerCase())

            if (category)
              category = category.categoryId
            else
              category = unknownMap.value.get(type)[data]

          transaction.categoryId = category;
          break;
        case 4: // date
            const date = parseDateWithLocale(data);

            if (date)
                transaction.created = date;
            else
              transaction.created = new Date(unknownMap.value.get(type)[data]);
          break;
        case 5: // description
          transaction.description += " " + data;
      }
    }

    transaction.description = transaction.description.trim();

    if (!transaction.description)
      transaction.description = undefined;

    if (transaction.delta !== 0)
      result.push(transaction)

  }

  return result;
}

const unknownValuesFilled = () => {
  let result = true;

  if (needAccount.value && !account.value)
    return false;

  if (needCategory.value && !category.value)
    return false;

  if (needDate.value && !date.value)
    return false;

  unknownValues.value.forEach((v, k) => {
    v.forEach((name) => {

      if (!unknownMap.value.get(k)[name]) {
        result = false;

        return result;
      }
    })
  })

  return result;
}

const findUnknownValues = () => {
  let result = false;

  for (let row = ignoreFirst.value; row < parsedData.value.length; row++) {
    let rowData = parsedData.value[row];

    for (let cell = 0; cell < rowData.length; cell++) {
      const type = definedColumns.value[cell];
      const data = rowData[cell];

      if (type === 0 || type === 5)
        continue;

      if (!unknownMap.value.has(type))
        unknownMap.value.set(type, {});

      switch (type) {
        case 1: // account
          if (accounts.value.find((a) => a.name.toLowerCase() === data.toLowerCase()) || unknownMap.value.get(type)[data]) continue;
          break;
        case 2: // amount
          if (!Number.isNaN(Number.parseFloat(data)) || unknownMap.value.get(type)[data]) continue;
          break;
        case 3: // category
          if (categories.value.find((t) => t.name.toLowerCase() === data.toLowerCase()) || unknownMap.value.get(type)[data]) continue;
          break;
        case 4: // date
          const date = parseDateWithLocale(data);

          if (date || unknownMap.value.get(type)[data]) continue;
          break;
      }

      result = true;

      if (!unknownValues.value.has(type))
        unknownValues.value.set(type, new Set());

      unknownValues.value.get(type).add(data)
    }
  }

  return result;
}

const definedColumnsValid = () => {
  let i = 0;

  const set = new Set();

  for (; i < maxColumns.value; i++) {
    let type = definedColumns.value[i];

    if (type === -1)
      break;

    if (type === 0 || type === 5) // allow doubling 'ignore' and 'description'
      continue;

    if (set.has(type))
      break

    set.add(type)
  }

  return i;
}

const ignoreText = () => {
  return t('modals.csvImport.placeholders.ignoreFirst', ignoreFirst.value).split(" ")
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  parsedData.value = [];
  maxColumns.value = 0;
  ignoreFirst.value = 0;

  if (file) {
    papa.parse(file, {
      worker: true,

      step: (row) => {
        let data = row.data;

        while (data.length !== 0 && !data[data.length - 1])
          data = data.slice(0, data.length - 1)

        parsedData.value.push(data)
        maxColumns.value = Math.max(maxColumns.value, data.length);
      },
      complete: () => {
        for (let i = 0; i <= maxColumns.value; i++)
          definedColumns.value[i] = 0;

        step.value++;
      }
    })
  }
}

const initDefaultValues = () => {
  const columnsMap = Object.entries(definedColumns.value);

  needAccount.value = columnsMap.find((v) => v[1] === 1) === undefined
  needCategory.value = columnsMap.find((v) => v[1] === 3) === undefined
  needDate.value = columnsMap.find((v) => v[1] === 4) === undefined
}

const nextStepAvailable = () => {
  switch (step.value) {
    case 1:
      return definedColumnsValid() === maxColumns.value && Object.entries(definedColumns.value).find((v) => v[1] === 2); // only amount type is required
    case 2:
      return unknownValuesFilled();
    default:
      return false;
  }
}

const nextStep = () => {
  switch (step.value) {
    case 1:
      if (!nextStepAvailable()) {
        highlightError.value = true;

        break;
      }

      unknownValues.value = new Map();
      unknownMap.value = new Map();

      initDefaultValues()
      findUnknownValues()

      step.value++;
      highlightError.value = false;

      break;
    case 2:
      if (findUnknownValues() || !unknownValuesFilled()) {
        highlightError.value = true;

        break;
      }

      const transactions = transformToTransactions();

      if (immediatelyApply.value) {
        emit('applyTransactions', transactions)

        return;
      }

      $toastsManager.pushToast(t("modals.csvImport.importMessage", transactions.length), 2500, "success")
      emit('addTransactions', transactions)
  }
}

const close = () => {
  emit('close')
}

</script>

<style scoped>

</style>