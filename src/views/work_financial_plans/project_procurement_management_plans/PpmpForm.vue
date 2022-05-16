<script setup>
  import { ref, watch, inject } from 'vue';
  import axios from 'axios';
  import Cookies from 'js-cookie';
  
  const wfp_id = inject('wfp_id');
  
  const props = defineProps({
    data: Object,
  });
  
  const emit = defineEmits(['createdPpmp', 'updatedPpmp']);
  
  const form_data = ref(props.data
    ? JSON.parse(JSON.stringify(props.data))
    : {
      item_id: null,
      quantity: 0,
      unit: 'Kilogram',
      abc: 0.00,
      procurement_mode: 'Shopping',
      milestone_1: null,
      milestone_2: null,
      milestone_3: null,
      milestone_4: null,
      milestone_5: null,
      milestone_6: null,
      milestone_7: null,
      milestone_8: null,
      milestone_9: null,
      milestone_10: null,
      milestone_11: null,
      milestone_12: null,
    });
  
  const form_error = ref(null);
  const form_errors = ref({});
  
  const form_options = ref({
    procurement_mode_options: [
      { value: 'Shopping', label: 'Shopping' },
      { value: 'Public Bidding', label: 'Public Bidding' },
    ],
    unit_options: [
      { value: 'Kilogram', label: 'Kilogram' },
      { value: 'Centimeter', label: 'Centimeter' },
      { value: 'Meter', label: 'Meter' },
    ],
    item_filter: '',
    item_options: [],
    selected_item: props.data?.item ?? null,
    saving_data: false,
  });
  
  const loadItemSelection = q => {
    axios.get(`${import.meta.env.VITE_API_URL}/items?q=${encodeURI(q)}&limit=5`)
      .then(response => form_options.value.item_options = response.data)
      .catch(() => form_options.value.item_options = []);
  };
  
  const selectItem = id => {
    form_data.value.item_id = id;
    form_options.value.selected_item = JSON.parse(JSON.stringify(form_options.value.item_options.find(item => item.id === id)));
  };
  
  const changeSelectedItem = () => {
    form_data.value.item_id = null;
    form_options.value.selected_item = null;
  };
  
  let timeout_handler;
  
  watch(() => form_options.value.item_filter, val => {
    if (val.length > 0) {
      if (timeout_handler) {
        clearTimeout(timeout_handler);
      }
  
      timeout_handler = setTimeout(() => {
        loadItemSelection(val);
      }, 1000);
    } else {
      form_options.value.item_options = [];
    }
  });
  
  const saveData = () => {
    form_error.value = null;
    form_errors.value = {};
    form_options.value.saving_data = true;
    
    if (form_data.value.id) {
      axios.put(`${import.meta.env.VITE_API_URL}/wfp/${wfp_id}/ppmps/${form_data.value.id}`, form_data.value)
      .then(response => emit('updatedPpmp', response.data))
      .catch(error => {
        form_options.value.saving_data = false;
        
        if (typeof error.response.data === 'object') {
          form_errors.value = error.response.data;
        } else if (typeof error.response.data === 'string') {
          form_error.value = error.response.data;
        }
      });
    } else {
      axios.post(`${import.meta.env.VITE_API_URL}/wfp/${wfp_id}/ppmps`, form_data.value)
      .then(response => emit('createdPpmp', response.data))
      .catch(error => {
        form_options.value.saving_data = false;
        
        if (typeof error.response.data === 'object') {
          form_errors.value = error.response.data;
        } else if (typeof error.response.data === 'string') {
          form_error.value = error.response.data;
        }
      });
    }
  };
</script>

<template>
  <div class="flex flex-col">
    <h3 class="flex-shrink-0 text-xl font-medium pb-2 border-b">{{ props.data?.id ? 'Update Project Procurement Management Plan' : 'Create Project Procurement Management Plan' }}</h3>
    <form @submit.prevent>
      <div class="flex-shrink-0 flex flex-col space-y-4 py-4">
        <div v-if="form_error" class="text-sm text-red-600 bg-red-100 p-4 border rounded">
          {{ form_error }}
        </div>
        <div class="flex flex-col relative">
          <label class="text-sm text-gray-600 font-medium uppercase">Item</label>
          <input v-if="form_data.item_id === null" type="search" v-model="form_options.item_filter" class="px-3 py-1 border rounded" />
          <div v-if="form_data.item_id === null && form_options.item_options.length > 0" class="absolute inset-0 top-12 bg-gray-100 h-60 z-50 overflow-y-auto">
            <div v-for="item in form_options.item_options" @click="selectItem(item.id)" :key="item.id" class="flex flex-col hover:bg-white mx-4 my-2 px-4 py-2 rounded cursor-pointer">
              <p class="font-medium">{{ item.title }}</p>
              <p class="italic">{{ item.item_category.name }}</p>
              <p class="text-xs uppercase font-medium">{{ item.commodity_type }}</p>
              <p>{{ item.details }}</p>
              <p class="text-sm">{{ `version ${item.version}` }}</p>
            </div>
          </div>
          <div v-if="form_options.selected_item">
            <div class="flex flex-col bg-gray-100 px-4 py-2 rounded">
              <p class="font-medium">{{ form_options.selected_item.title }}</p>
              <p class="italic">{{ form_options.selected_item.item_category.name }}</p>
              <p class="text-xs uppercase font-medium">{{ form_options.selected_item.commodity_type }}</p>
              <p>{{ form_options.selected_item.details }}</p>
              <p class="text-xs italic">{{ `version ${form_options.selected_item.version}` }}</p>
              <div class="flex justify-end">
                <button type="button" @click="changeSelectedItem" class="text-xs text-blue-600 uppercase font-medium hover:text-blue-400">Change</button>
              </div>
            </div>
          </div>
          <span v-if="form_errors.hasOwnProperty('item_id')" class="text-sm text-red-600 py-1">{{ form_errors.item_id[0] }}</span>
        </div>
        
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Quantity</label>
          <input type="number" v-model="form_data.quantity" class="px-3 py-1 border rounded" />
          <span v-if="form_errors.hasOwnProperty('quantity')" class="text-sm text-red-600 py-1">{{ form_errors.quantity[0] }}</span>
        </div>
  
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Unit</label>
          <select v-model="form_data.unit" class="px-2 py-1 border rounded">
            <option v-for="unit in form_options.unit_options" :key="unit.value" :value="unit.value">{{ unit.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('unit')" class="text-sm text-red-600 py-1">{{ form_errors.unit[0] }}</span>
        </div>
        
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">ABC</label>
          <input type="number" v-model="form_data.abc" class="px-3 py-1 border rounded" />
          <span v-if="form_errors.hasOwnProperty('abc')" class="text-sm text-red-600 py-1">{{ form_errors.abc[0] }}</span>
        </div>
        
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Estimated Budget</label>
          <span class="px-3 py-1">{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(form_data.quantity * form_data.abc) }}</span>
          <span v-if="form_errors.hasOwnProperty('abc')" class="text-sm text-red-600 py-1">{{ form_errors.abc[0] }}</span>
        </div>
        
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Procurement Mode</label>
          <select v-model="form_data.procurement_mode" class="px-2 py-1 border rounded">
            <option v-for="procurement_mode in form_options.procurement_mode_options" :key="procurement_mode.value" :value="procurement_mode.value">{{ procurement_mode.label }}</option>
          </select>
          <span v-if="form_errors.hasOwnProperty('procurement_mode')" class="text-sm text-red-600 py-1">{{ form_errors.procurement_mode[0] }}</span>
        </div>
        
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-medium uppercase">Milestones</label>
          <div class="flex justify-between items-start space-x-4">
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_1" class="px-3 py-1 border rounded" placeholder="JAN" />
              <span v-if="form_errors.hasOwnProperty('milestone_1')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_1[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_2" class="px-3 py-1 border rounded" placeholder="FEB" />
              <span v-if="form_errors.hasOwnProperty('milestone_2')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_2[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_3" class="px-3 py-1 border rounded" placeholder="MAR" />
              <span v-if="form_errors.hasOwnProperty('milestone_3')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_3[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_4" class="px-3 py-1 border rounded" placeholder="APR" />
              <span v-if="form_errors.hasOwnProperty('milestone_4')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_4[0] }}</span>
            </div>
          </div>
          <div class="flex justify-between items-start space-x-4 mt-2">
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_5" class="px-3 py-1 border rounded" placeholder="MAY" />
              <span v-if="form_errors.hasOwnProperty('milestone_5')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_5[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_6" class="px-3 py-1 border rounded" placeholder="JUNE" />
              <span v-if="form_errors.hasOwnProperty('milestone_6')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_6[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_7" class="px-3 py-1 border rounded" placeholder="JULY" />
              <span v-if="form_errors.hasOwnProperty('milestone_7')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_7[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_8" class="px-3 py-1 border rounded" placeholder="AUG" />
              <span v-if="form_errors.hasOwnProperty('milestone_8')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_8[0] }}</span>
            </div>
          </div>
          <div class="flex justify-between items-start space-x-4 mt-2">
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_9" class="px-3 py-1 border rounded" placeholder="SEPT" />
              <span v-if="form_errors.hasOwnProperty('milestone_9')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_9[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_10" class="px-3 py-1 border rounded" placeholder="OCT" />
              <span v-if="form_errors.hasOwnProperty('milestone_10')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_10[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_11" class="px-3 py-1 border rounded" placeholder="NOV" />
              <span v-if="form_errors.hasOwnProperty('milestone_11')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_11[0] }}</span>
            </div>
            <div class="w-32 flex flex-col">
              <input type="text" v-model="form_data.milestone_12" class="px-3 py-1 border rounded" placeholder="DEC" />
              <span v-if="form_errors.hasOwnProperty('milestone_12')" class="text-sm text-red-600 py-1">{{ form_errors.milestone_12[0] }}</span>
            </div>
          </div>
        </div>
  
        <div class="flex justify-between items-center">
          <button type="button" @click="emit('close')" class="w-64 text-gray-600 bg-gray-100 hover:text-white hover:bg-gray-500 font-medium py-1.5 border rounded transition">
            <div class="flex justify-center items-center space-x-2">
              <i class="fas fa-times"></i>
              <span>{{ form_data.id ? 'Discard Changes' : 'Cancel' }}</span>
            </div>
          </button>
          <button type="button" @click="saveData()" class="w-64 text-gray-600 bg-gray-100 hover:text-white hover:bg-green-600 font-medium py-1.5 border rounded transition">
            <div v-if="!form_options.saving_data" class="flex justify-center items-center space-x-2">
              <i class="fas fa-save"></i>
              <span>Save PPMP</span>
            </div>
            <div v-else class="flex justify-center items-center space-x-2">
              <i class="fas fa-spinner animate-spin"></i>
              <span>Saving PPMP</span>
            </div>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>