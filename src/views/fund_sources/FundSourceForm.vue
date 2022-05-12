<script setup>
  import { ref, inject } from 'vue';
  import axios from 'axios';
  
  const props = defineProps({
    data: Object,
  });
  
  const emit = defineEmits(['created', 'updated']);
  
  const form_data = ref(props.data
    ? JSON.parse(JSON.stringify(props.data))
    : {
      year: new Date().getFullYear(),
      name: 'General Appropriations Act',
      program: '',
      amount: 0.00,
      office_id: null,
    });
  
  const form_error = ref(null);
  const form_errors = ref({});
  
  const form_options = ref({
    year_options: inject('year_options'),
    name_options: [
      { value: 'General Appropriations Act', label: 'General Appropriations Act' },
      { value: 'Sub-Allotment Advice', label: 'Sub-Allotment Advice' },
      { value: 'Capital Outlay', label: 'Capital Outlay' },
    ],
    office_options: [],
    saving_data: false,
  });
  
  axios.get(`${import.meta.env.VITE_PORTAL_API}/offices?unit=section`)
  .then(response => {
    response.data.forEach(office => {
      form_options.value.office_options.push({
        value: office.id,
        label: office.name,
      });
    });
    
    if (form_data.value.office_id === null) {
      form_data.value.office_id = form_options.value.office_options[0].value;
    }
  })
  .catch(() => form_options.value.office_options = []);
  
  const saveData = () => {
    form_options.value.saving_data = true;
    form_error.value = null;
    form_errors.value = {};
    
    if (form_data.value.id) {
      axios.put(`${import.meta.env.VITE_API_URL}/fund_sources/${form_data.value.id}`, form_data.value)
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
      axios.post(`${import.meta.env.VITE_API_URL}/fund_sources`, form_data.value)
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
    <h3 class="flex-shrink-0 text-xl font-medium pb-2 border-b">{{ props.data?.id ? 'Update Fund Source' : 'Create Fund Source' }}</h3>
    <form @submit.prevent>
      <div class="flex-shrink-0 flex flex-col space-y-4 py-4">
        <div v-if="form_error" class="text-sm text-red-600 bg-red-100 p-4 border rounded">
          {{ form_error }}
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Year</label>
          <select v-model="form_data.year" class="px-2 py-1 border rounded">
            <option v-for="year in form_options.year_options" :key="year.value" :value="year.value">{{ year.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('year')" class="text-sm text-red-600 py-1">{{ form_errors.year[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Office</label>
          <select v-model="form_data.office_id" class="px-2 py-1 border rounded">
            <option v-for="office in form_options.office_options" :key="office.value" :value="office.value">{{ office.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('office_id')" class="text-sm text-red-600 py-1">{{ form_errors.office_id[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Name</label>
          <select v-model="form_data.name" class="px-2 py-1 border rounded">
            <option v-for="name in form_options.name_options" :key="name.value" :value="name.value">{{ name.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('name')" class="text-sm text-red-600 py-1">{{ form_errors.name[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Program</label>
          <input type="text" v-model="form_data.program" class="px-3 py-1 border rounded" />
          <span v-if="form_errors.hasOwnProperty('program')" class="text-sm text-red-600 py-1">{{ form_errors.program[0] }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Amount</label>
          <input type="number" v-model="form_data.amount" class="px-3 py-1 border rounded" />
          <span v-if="form_errors.hasOwnProperty('amount')" class="text-sm text-red-600 py-1">{{ form_errors.amount[0] }}</span>
        </div>
        <div class="flex justify-center">
          <button type="button" @click="saveData()" :disabled="form_options.saving_data" class="w-64 text-gray-600 bg-gray-200 hover:text-white hover:bg-green-600 font-medium py-1.5 border rounded transition">
            <div v-if="!form_options.saving_data" class="flex justify-center items-center space-x-2">
              <i class="fas fa-save"></i>
              <span>Save Fund Source</span>
            </div>
            <div v-else class="flex justify-center items-center space-x-2">
              <i class="fas fa-spinner animate-spin"></i>
              <span>Saving Fund Source</span>
            </div>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>