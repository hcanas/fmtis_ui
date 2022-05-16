<script setup>
  import { ref, watch, inject } from 'vue';
  import axios from 'axios';
  import Cookies from 'js-cookie';
  
  const props = defineProps({
    data: Object,
  });
  
  const emit = defineEmits(['created', 'updated', 'close']);
  
  const form_data = ref(props.data
    ? JSON.parse(JSON.stringify(props.data))
    : {
      fund_source: {
        year: new Date().getFullYear(),
        office_id: null,
      },
      function_type: 'Strategic',
      deliverables: '',
      activities: '',
      timeframe_from: null,
      timeframe_to: null,
      target_q1: null,
      target_q2: null,
      target_q3: null,
      target_q4: null,
      item: '',
      cost: 0.00,
      fund_source_id: null,
    });
  
  const form_error = ref(null);
  const form_errors = ref({});
  
  const form_options = ref({
    year_options: inject('year_options'),
    office_options: [],
    fund_source_options: [],
    function_type_options: [
      { value: 'Core', label: 'Core' },
      { value: 'Strategic', label: 'Strategic' },
      { value: 'Support', label: 'Support' },
    ],
    saving_data: false,
  });

  const loadFundSources = () => {
    form_options.value.fund_source_options = [];
    
    axios.get(`${import.meta.env.VITE_API_URL}/office_fund_sources?year=${form_data.value.fund_source.year}&office_id=${form_data.value.fund_source.office_id}`)
    .then(response => {
      response.data.forEach(fund_source => {
        form_options.value.fund_source_options.push({
          value: fund_source.id,
          label: `${fund_source.name} - ${fund_source.program} - ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(fund_source.amount - fund_source.allocated)}`,
        });
      });
      
      if (form_data.value.fund_source_id === null) {
        form_data.value.fund_source_id = form_options.value.fund_source_options[0].value;
      }
    })
    .catch(() => form_options.fund_source_options = []);
  }
  
  const permissions = JSON.parse(Cookies.get('auth_permissions'));
  
  permissions.forEach(permission => {
    if (permission.name === 'wfp:create' && permission.offices.length > 0) {
      permission.offices.forEach(office => {
        form_options.value.office_options.push({
          value: office.id,
          label: office.name,
        });
      });
  
      if (form_data.value.office_id === null) {
        form_data.value.office_id = form_options.value.office_options[0].value;
      } else {
        loadFundSources();
      }
    }
  });
  
  watch(() => form_data.value.fund_source.office_id + ' ' + form_data.value.fund_source.year, () => {
    form_data.value.fund_source_id = null;
    loadFundSources();
  });
  
  const saveData = () => {
    form_options.value.saving_data = true;
    form_error.value = null;
    form_errors.value = {};

    if (form_data.value.id) {
      axios.put(`${import.meta.env.VITE_API_URL}/wfps/${form_data.value.id}`, form_data.value)
        .then(response => {
          form_options.value.saving_data = false
          emit('updated', response.data);
        })
        .catch(error => {
          form_options.value.saving_data = false;

          if (error.response.status === 400) {
            if (typeof error.response.data === 'object') {
              form_errors.value = error.response.data;
            } else if (typeof error.response.data === 'string') {
              form_error.value = error.response.data;
            }
          }
        });
    } else {
      axios.post(`${import.meta.env.VITE_API_URL}/wfps`, form_data.value)
      .then(response => {
        form_options.value.saving_data = false
        emit('created', response.data);
      })
      .catch(error => {
        form_options.value.saving_data = false;

        if (error.response.status === 400) {
          if (typeof error.response.data === 'object') {
            form_errors.value = error.response.data;
          } else if (typeof error.response.data === 'string') {
            form_error.value = error.response.data;
          }
        }
      });
    }
  };
</script>

<template>
  <div class="flex flex-col">
    <h3 class="flex-shrink-0 text-xl font-medium pb-2 border-b">{{ props.data?.id ? 'Update Work Financial Plan' : 'Create Work Financial Plan' }}</h3>
    <form @submit.prevent>
      <div class="flex-shrink-0 flex flex-col space-y-4 py-4">
        <div v-if="form_error" class="text-sm text-red-600 bg-red-100 p-4 border rounded">
          {{ form_error }}
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Year</label>
          <select v-model="form_data.fund_source.year" class="px-2 py-1 border rounded">
            <option v-for="year in form_options.year_options" :key="year.value" :value="year.value">{{ year.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('year')" class="text-sm text-red-600 py-1">{{ form_errors.year[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Office</label>
          <select v-model="form_data.fund_source.office_id" class="px-2 py-1 border rounded">
            <option v-for="office in form_options.office_options" :key="office.value" :value="office.value">{{ office.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('office_id')" class="text-sm text-red-600 py-1">{{ form_errors.office_id[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Fund Source</label>
          <select v-model="form_data.fund_source_id" class="px-2 py-1 border rounded">
            <option v-for="fund_source in form_options.fund_source_options" :key="fund_source.value" :value="fund_source.value">{{ fund_source.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('fund_source_id')" class="text-sm text-red-600 py-1">{{ form_errors.fund_source_id[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Function Type</label>
          <select v-model="form_data.function_type" class="px-2 py-1 border rounded">
            <option v-for="function_type in form_options.function_type_options" :key="function_type.value" :value="function_type.value">{{ function_type.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('name')" class="text-sm text-red-600 py-1">{{ form_errors.name[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Deliverables</label>
          <textarea v-model="form_data.deliverables" class="px-3 py-1 border rounded"></textarea>
          <span v-if="form_errors.hasOwnProperty('deliverables')" class="text-sm text-red-600 py-1">{{ form_errors.deliverables[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Activities</label>
          <textarea v-model="form_data.activities" class="px-3 py-1 border rounded"></textarea>
          <span v-if="form_errors.hasOwnProperty('activities')" class="text-sm text-red-600 py-1">{{ form_errors.activities[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Timeframe</label>
          <div class="flex items-start space-x-4">
            <div class="w-1/2 flex flex-col">
              <input type="date" v-model="form_data.timeframe_from" class="px-3 py-1 border rounded" />
              <span v-if="form_errors.hasOwnProperty('timeframe_from')" class="text-sm text-red-600 py-1">{{ form_errors.timeframe_from[0] }}</span>
            </div>
            <span class="py-1">to</span>
            <div class="w-1/2 flex flex-col">
              <input type="date" v-model="form_data.timeframe_to" class="px-3 py-1 border rounded" />
              <span v-if="form_errors.hasOwnProperty('timeframe_to')" class="text-sm text-red-600 py-1">{{ form_errors.timeframe_to[0] }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Targets</label>
          <div class="flex justify-between items-start space-x-4">
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.target_q1" class="px-3 py-1 border rounded" placeholder="Q1" />
              <span v-if="form_errors.hasOwnProperty('target_q1')" class="text-sm text-red-600 py-1">{{ form_errors.target_q1[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.target_q2" class="px-3 py-1 border rounded" placeholder="Q2" />
              <span v-if="form_errors.hasOwnProperty('target_q2')" class="text-sm text-red-600 py-1">{{ form_errors.target_q2[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.target_q3" class="px-3 py-1 border rounded" placeholder="Q3" />
              <span v-if="form_errors.hasOwnProperty('target_q3')" class="text-sm text-red-600 py-1">{{ form_errors.target_q3[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.target_q4" class="px-3 py-1 border rounded" placeholder="Q4" />
              <span v-if="form_errors.hasOwnProperty('target_q4')" class="text-sm text-red-600 py-1">{{ form_errors.target_q4[0] }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Item</label>
          <textarea v-model="form_data.item" class="px-3 py-1 border rounded"></textarea>
          <span v-if="form_errors.hasOwnProperty('item')" class="text-sm text-red-600 py-1">{{ form_errors.item[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Cost</label>
          <input type="number" v-model="form_data.cost" class="px-3 py-1 border rounded" />
          <span v-if="form_errors.hasOwnProperty('cost')" class="text-sm text-red-600 py-1">{{ form_errors.cost[0] }}</span>
        </div>
        <div class="flex justify-between items-center">
          <button type="button" @click="emit('close')" class="w-64 text-gray-600 bg-gray-100 hover:text-white hover:bg-gray-500 font-medium py-1.5 border rounded transition">
            <div class="flex justify-center items-center space-x-2">
              <i class="fas fa-times"></i>
              <span>{{ form_data.id ? 'Discard Changes' : 'Cancel' }}</span>
            </div>
          </button>
          <button type="button" @click="saveData()" :disabled="form_options.saving_data" class="w-64 text-gray-600 bg-gray-100 hover:text-white hover:bg-green-600 font-medium py-1.5 border rounded transition">
            <div v-if="!form_options.saving_data" class="flex justify-center items-center space-x-2">
              <i class="fas fa-save"></i>
              <span>Save Work Financial Plan</span>
            </div>
            <div v-else class="flex justify-center items-center space-x-2">
              <i class="fas fa-spinner animate-spin"></i>
              <span>Saving Work Financial Plan</span>
            </div>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
  textarea {
    resize: none;
    height: 10rem;
  }
</style>