<script setup>
  import { ref, watch, inject } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  const grid_options = ref({
    year: useRoute().query.year ?? new Date().getFullYear(),
    year_options: inject('year_options'),
    filter_text: '',
    sort: 'amount_desc',
    sort_options: [
      { value: 'amount_asc', label: 'Amount Low-High' },
      { value: 'amount_desc', label: 'Amount High-Low' },
      { value: 'office_asc', label: 'Office A-Z' },
      { value: 'office_desc', label: 'Office Z-A' },
    ],
    sorted_data: [],
    filtered_data: [],
    spliced_data: [],
    pagination: {
      page: 1,
      per_page: 20,
      max_page: 0,
    },
  });

  const loadData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/fund_sources?year=${grid_options.value.year}`)
    .then(response => {
      grid_options.value.sorted_data = response.data;
    
      sortData();
      filterData();
      spliceData();
    })
    .catch(() => grid_options.value.sorted_data = []);
  };
  
  const sortData = () => {
    switch (grid_options.value.sort) {
      case 'amount_asc':
        grid_options.value.sorted_data.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        break;
        
      case 'office_asc':
        grid_options.value.sorted_data.sort((a, b) => {
          if (a.office.name < b.office.name) {
            return -1;
          } else if (a.office.name > b.office.name) {
            return 1;
          }
          
          return 0;
        });
        break;
        
      case 'office_desc':
        grid_options.value.sorted_data.sort((a, b) => {
          if (a.office.name > b.office.name) {
            return -1;
          } else if (a.office.name < b.office.name) {
            return 1;
          }
          
          return 0;
        });
        break;
    
      default:
        grid_options.value.sorted_data.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        break;
    }
  };
  
  const filterData = () => {
    const filter_text = grid_options.value.filter_text.toLowerCase();
    
    if (filter_text) {
      grid_options.value.filtered_data = grid_options.value.sorted_data.filter(item => {
        return item.amount.toString().indexOf(filter_text) + 1
          || item.office.name.toLowerCase().indexOf(filter_text) + 1
          || item.office.short_name.toLowerCase().indexOf(filter_text) + 1
          || item.name.toLowerCase().indexOf(filter_text) + 1
          || item.program.toLowerCase().indexOf(filter_text) + 1;
      });
    } else {
      grid_options.value.filtered_data = grid_options.value.sorted_data;
    }
    
    grid_options.value.pagination.max_page = Math.floor(grid_options.value.filtered_data.length / grid_options.value.pagination.per_page);
  
    if (grid_options.value.filtered_data.length % grid_options.value.pagination.per_page > 0) {
      grid_options.value.pagination.max_page++;
    }
  };
  
  const spliceData = () => {
    const data = JSON.parse(JSON.stringify(grid_options.value.filtered_data));
    
    grid_options.value.spliced_data = data.splice(
      (grid_options.value.pagination.page - 1) * grid_options.value.pagination.per_page,
      grid_options.value.pagination.per_page
    );
  };
  
  const previousPage = () => {
    if (grid_options.value.pagination.page > 1) {
      grid_options.value.pagination.page--;
    }
  };
  
  const nextPage = () => {
    if (grid_options.value.pagination.page < grid_options.value.pagination.max_page) {
      grid_options.value.pagination.page++;
    }
  };

  const formatCurrency = amount => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
    .format(amount);
  
  watch(() => grid_options.value.year, () => loadData());
  watch(() => grid_options.value.pagination.page, () => spliceData());
  watch(() => grid_options.value.filter_text, () => {
    grid_options.value.pagination.page = 1;
    filterData();
    spliceData();
  });
  watch(() => grid_options.value.sort, () => {
    sortData();
    spliceData();
  });
  
  loadData();

  // Modal
  import Modal from "../../components/overlays/Modal.vue";
  import FundSourceForm from "./FundSourceForm.vue";
  import ConfirmDeleteFundSource from "./ConfirmDeleteFundSource.vue";
  import MessageCreatedFundSource from "./MessageCreatedFundSource.vue";
  import MessageUpdatedFundSource from "./MessageUpdatedFundSource.vue";
  import MessageDeletedFundSource from "./MessageDeletedFundSource.vue";
  
  const modal_options = ref({
    show: false,
    size: '',
    component: '',
    data: null,
  });
  
  const closeModal = () => {
    modal_options.value = {
      show: false,
      width: 0,
      component: '',
      data: null,
    };
  };
  
  const createFundSource = () => {
    modal_options.value = {
      show: true,
      width: 50,
      component: FundSourceForm,
    };
  };
  
  const createdFundSource = data => {
    modal_options.value = {
      show: true,
      width: 30,
      component: MessageCreatedFundSource,
      data: data,
    };
    
    grid_options.value.sorted_data.push(data);
    sortData();
    filterData();
    spliceData();
  };
  
  const updateFundSource = id => {
    modal_options.value = {
      show: true,
      width: 50,
      component: FundSourceForm,
      data: grid_options.value.spliced_data.find(item => item.id === id) ?? null,
    };
  };

  const updatedFundSource = data => {
    modal_options.value = {
      show: true,
      width: 30,
      component: MessageUpdatedFundSource,
      data: data,
    };
    
    grid_options.value.sorted_data.some((item, index) => {
      if (item.id === data.id) {
        grid_options.value.sorted_data[index] = data;
        sortData();
        filterData();
        spliceData();
        return true; // break loop
      }
    });
  };
  
  const deleteFundSource = id => {
    modal_options.value = {
      show: true,
      width: 40,
      component: ConfirmDeleteFundSource,
      data: grid_options.value.spliced_data.find(item => item.id === id) ?? null,
    };
  };
  
  const deletedFundSource = id => {
    modal_options.value = {
      show: true,
      width: 30,
      component: MessageDeletedFundSource,
      data: JSON.parse(JSON.stringify(grid_options.value.sorted_data.find(item => item.id === id))),
    };
    
    grid_options.value.sorted_data.some((item, index) => {
      if (item.id === id) {
        grid_options.value.sorted_data.splice(index, 1);
        filterData();
        spliceData();
        return true; // break loop
      }
    });
  };
</script>

<template>
  <div class="w-full h-full flex flex-col space-y-8">
    <div class="flex-shrink-0 flex justify-between items-center">
      <h1 class="text-3xl text-gray-600 font-medium">Fund Sources</h1>
      <button type="button" @click="createFundSource" class="bg-gray-200 px-3 py-1.5 border rounded hover:text-white hover:bg-green-600">
        <span class="flex items-center space-x-1">
          <i class="fas fa-plus"></i>
          <span class="font-medium">Add Fund Source</span>
        </span>
      </button>
    </div>
    <div class="flex-grow flex-col space-y-4">
      <div class="flex-shrink-0 flex justify-between items-center space-x-4">
        <form @submit.prevent>
          <div class="flex items-center space-x-4">
            <input type="search" v-model="grid_options.filter_text" class="px-3 py-1 border rounded" placeholder="Search keyword..." />
            <select v-model="grid_options.sort" class="px-3 py-1 border rounded">
              <option v-for="(option, index) in grid_options.sort_options" :key="index" :value="option.value">{{ option.label }}</option>
            </select>
            <select v-model="grid_options.year" class="px-3 py-1 border rounded">
              <option v-for="(option, index) in grid_options.year_options" :key="index" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
        </form>
        <div class="flex items-center space-x-4">
          <p v-if="grid_options.pagination.max_page > 1" class="text-gray-600">Displaying {{ `${(grid_options.pagination.page - 1) * grid_options.pagination.per_page + 1}-${(grid_options.pagination.page - 1) * grid_options.pagination.per_page + grid_options.spliced_data.length }` }} of {{ grid_options.filtered_data.length }} items</p>
          <button type="button" v-if="grid_options.pagination.max_page > 1" @click="previousPage()" class="text-gray-400 hover:text-green-600"><i class="fas fa-chevron-left"></i></button>
          <button type="button" v-if="grid_options.pagination.max_page > 1" @click="nextPage()" class="text-gray-400 hover:text-green-600"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
      <div class="flex justify-between flex-wrap">
        <div v-for="fund_source in grid_options.spliced_data" :key="fund_source.id" class="w-96 flex flex-col space-y-4 bg-white p-4 mb-8 rounded shadow-lg">
          <div>
            <p class="text-sm text-gray-400 uppercase font-bold">Amount</p>
            <p class="text-3xl text-green-600 font-bold">{{ formatCurrency(fund_source.amount) }}</p>
            <p class="text-sm text-gray-500">{{ formatCurrency(fund_source.amount - fund_source.allocated) }} remaining</p>
          </div>
          <div>
            <p class="text-sm text-gray-400 uppercase font-bold">Office</p>
            <p class="text-gray-600 font-medium">{{ `${fund_source.office.name} (${fund_source.office.short_name})` }}</p>
            <p class="text-sm text-gray-500">{{ `${fund_source.name} - ${fund_source.program}` }}</p>
          </div>
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-400 font-medium uppercase">Last Updated:</span>
              <span class="text-xs text-gray-400 font-medium">{{ new Date(fund_source.updated_at).toLocaleString() }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="updateFundSource(fund_source.id)"><i class="fas fa-pencil text-sm text-gray-500 hover:text-amber-500"></i></button>
              <button v-if="fund_source.wfp_count === 0" @click="deleteFundSource(fund_source.id)"><i class="fas fa-trash text-sm text-gray-500 hover:text-red-600"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end items-center space-x-4">
        <p v-if="grid_options.pagination.max_page > 1" class="text-gray-600">Displaying {{ `${(grid_options.pagination.page - 1) * grid_options.pagination.per_page + 1}-${(grid_options.pagination.page - 1) * grid_options.pagination.per_page + grid_options.spliced_data.length }` }} of {{ grid_options.filtered_data.length }} items</p>
        <button type="button" v-if="grid_options.pagination.max_page > 1" @click="previousPage()" class="text-gray-400 hover:text-green-600"><i class="fas fa-chevron-left"></i></button>
        <button type="button" v-if="grid_options.pagination.max_page > 1" @click="nextPage()" class="text-gray-400 hover:text-green-600"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
  </div>
  
  <modal :options="modal_options" @close="closeModal()">
    <component
      :is="modal_options.component"
      :data="modal_options.data"
      @created="createdFundSource"
      @updated="updatedFundSource"
      @deleted="deletedFundSource"
      @close="closeModal()"
    />
  </modal>
</template>