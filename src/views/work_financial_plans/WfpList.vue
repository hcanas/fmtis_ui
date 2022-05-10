<script setup>
  import { ref, inject, watch } from 'vue';
  import { useRoute } from "vue-router";
  import axios from "axios";
  import Cookies from 'js-cookie';
  
  // grid
  const permissions = ref(JSON.parse(Cookies.get('auth_permissions')).filter(item => item.name.indexOf('wfp') === 0));
  
  const grid_options = ref({
    year: useRoute().query.year ?? new Date().getFullYear(),
    year_options: inject('year_options'),
    office_id: null,
    office_options: [],
    filter_text: '',
    sort: 'cost_desc',
    sort_options: [
      { value: 'cost_asc', label: 'Cost Low-High' },
      { value: 'cost_desc', label: 'Cost High-Low' },
      { value: 'office_asc', label: 'Office A-Z' },
      { value: 'office_desc', label: 'Office Z-A' },
      { value: 'status_asc', label: 'Approved First' },
      { value: 'status_desc', label: 'Pending First' },
    ],
    sorted_data: [],
    filtered_data: [],
    spliced_data: [],
    pagination: {
      page: 1,
      per_page: 6,
      max_page: 0,
    },
  });
  
  permissions.value.forEach(permission => {
    if (permission.name === 'wfp:view' && permission.offices.length > 0) {
      permission.offices.forEach(office => {
        grid_options.value.office_options.push({
          value: office.id,
          label: office.name,
        });
      });
      
      grid_options.value.office_id = grid_options.value.office_options[0].value;
    }
  });

  const loadData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/wfps?year=${grid_options.value.year}&office=${grid_options.value.office_id}`)
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
      case 'cost_asc':
        grid_options.value.sorted_data.sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost));
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
        grid_options.value.sorted_data.sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost));
        break;
    }
  };

  const filterData = () => {
    const filter_text = grid_options.value.filter_text.toLowerCase();
  
    if (filter_text) {
      grid_options.value.filtered_data = grid_options.value.sorted_data.filter(item => {
        return item.cost.toString().indexOf(filter_text) + 1
          || item.fund_source.name.toLowerCase().indexOf(filter_text) + 1
          || item.fund_source.program.toLowerCase().indexOf(filter_text) + 1;
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
  
  const formatDate = date => new Date(date).toDateString().substring(4);

  watch(() => grid_options.value.year, () => {
    grid_options.value.pagination.page = 1;
    loadData();
  });
  watch(() => grid_options.value.pagination.page, () => spliceData());
  watch(() => grid_options.value.filter_text, () => {
    grid_options.value.pagination.page = 1;
    filterData();
    spliceData();
  });
  watch(() => grid_options.value.office_id, () => {
    grid_options.value.pagination.page = 1;
    loadData();
  });
  watch(() => grid_options.value.sort, () => {
    sortData();
    spliceData();
  });

  loadData();

  // Modal
  import Modal from "../../components/overlays/Modal.vue";
  import MessageSuccess from "../../components/messages/MessageSuccess.vue";
  import WfpForm from "./WfpForm.vue"

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

  const createWfp = () => {
    modal_options.value = {
      show: true,
      width: 50,
      component: WfpForm,
    };
  };

  const createdWfp = data => {
    modal_options.value = {
      show: true,
      width: 30,
      component: MessageSuccess,
      data: data,
    };

    if (grid_options.value.office_id === data.office_id) {
      grid_options.value.sorted_data.push(data);
      sortData();
      filterData();
      spliceData();
    }
  };
</script>

<template>
  <div class="w-full h-full flex flex-col space-y-8">
    <div class="flex-shrink-0 flex justify-between items-center">
      <div class="flex flex-col">
        <h2 class="text-3xl text-gray-600 font-medium">WFPs</h2>
        <p class="text-gray-400">Work Financial Plans</p>
      </div>
      <button @click="createWfp()" type="button" class="bg-gray-200 px-3 py-1.5 border rounded hover:text-white hover:bg-green-600 transition">
        <span class="flex items-center space-x-1">
          <i class="fas fa-plus"></i>
          <span class="font-medium">Add WFP</span>
        </span>
      </button>
    </div>
    <div class="flex-grow flex-col space-y-4">
      <div class="flex-shrink-0 flex justify-between items-center">
        <form @submit.prevent>
          <div class="flex items-center space-x-4">
            <input type="search" v-model="grid_options.filter_text" class="px-3 py-1 border rounded" placeholder="Search keyword..." />
            <select v-model="grid_options.sort" class="px-3 py-1 border rounded">
              <option v-for="(option, index) in grid_options.sort_options" :key="index" :value="option.value">{{ option.label }}</option>
            </select>
            <select v-model="grid_options.office_id" class="px-3 py-1 border rounded">
              <option v-for="(option, index) in grid_options.office_options" :key="index" :value="option.value">{{ option.label }}</option>
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
        <div v-for="wfp in grid_options.spliced_data" :key="wfp.id" class="w-196 flex flex-col space-y-8 bg-white p-8 mb-12 rounded shadow-lg">
          <div class="flex items-stretch">
            <div class="flex-grow">
              <p class="text-sm text-gray-400 uppercase font-bold">Cost</p>
              <p class="text-3xl text-green-600 font-bold">{{ formatCurrency(wfp.cost) }}</p>
              <p class="text-sm text-gray-500">{{ formatCurrency(wfp.cost - wfp.allocated) }} remaining</p>
            </div>
            <div class="flex-shrink-0">
              <p class="text-xs text-white uppercase font-bold px-4 py-1 rounded" :class="{ 'bg-green-600': wfp.status === 'approved', 'bg-gray-400': wfp.status !== 'approved' }">{{ wfp.status }}</p>
            </div>
          </div>
          <div class="flex items-stretch">
            <div class="flex-grow">
              <p class="text-sm text-gray-400 uppercase font-bold">Fund Source</p>
              <p class="text-gray-600 font-medium">{{ `${wfp.fund_source.name} - ${wfp.fund_source.program}` }}</p>
            </div>
            <div class="flex-shrink-0">
              <p class="text-sm text-gray-400 uppercase font-bold">Timeframe</p>
              <p class="text-gray-600 font-medium">{{ `${formatDate(wfp.timeframe_from)} - ${formatDate(wfp.timeframe_to)}` }}</p>
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-400 uppercase font-bold">Deliverables</p>
            <p class="text-gray-600 font-medium">{{ wfp.deliverables }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400 uppercase font-bold">Activities</p>
            <p class="text-gray-600 font-medium">{{ wfp.activities }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400 uppercase font-bold">Targets</p>
            <p class="text-gray-600 font-medium">{{ `${wfp.target_q1} (Q1) - ${wfp.target_q2} (Q2) - ${wfp.target_q3} (Q3) - ${wfp.target_q4} (Q4)` }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400 uppercase font-bold">Item</p>
            <p class="text-gray-600 font-medium">{{ wfp.item }}</p>
          </div>
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-400 font-medium uppercase">Last Updated:</span>
              <span class="text-xs text-gray-400 font-medium">{{ new Date(wfp.updated_at).toLocaleString() }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <router-link :to="`/wfp/${wfp.id}`"><i class="fas fa-eye text-sm text-gray-500 hover:text-blue-500"></i></router-link>
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
      @created="createdWfp"
      @close="closeModal()"
    />
  </modal>
</template>

<style scoped>
  .w-196 {
    width: 49rem;
  }
</style>