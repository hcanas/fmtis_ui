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
    sort: 'total_amount_desc',
    sort_options: [
      { value: 'total_amount_asc', label: 'Total Amount Low-High' },
      { value: 'total_amount_desc', label: 'Total Amount High-Low' },
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
    axios.get(`${import.meta.env.VITE_API_URL}/apps?year=${grid_options.value.year}&office_id=${grid_options.value.office_id}`)
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
      case 'total_amount_asc':
        grid_options.value.sorted_data.sort((a, b) => parseFloat(a.quantity * a.abc) - parseFloat(b.quantity * b.abc));
        break;
      default:
        grid_options.value.sorted_data.sort((a, b) => parseFloat(b.quantity * b.abc) - parseFloat(a.quantity * a.abc));
        break;
    }
  };

  const filterData = () => {
    const filter_text = grid_options.value.filter_text.toLowerCase();
  
    if (filter_text) {
      grid_options.value.filtered_data = grid_options.value.sorted_data.filter(ppmp => {
        return (ppmp.quantity * ppmp.abc).toString().indexOf(filter_text) + 1
          || ppmp.item.title.toLowerCase().indexOf(filter_text) + 1
          || ppmp.item.item_category.name.indexOf(filter_text) + 1
          || ppmp.item.commodity_type.indexOf(filter_text) + 1
          || ppmp.item.year.toString().indexOf(filter_text) + 1
          || ppmp.item.details.indexOf(filter_text) + 1
          || ppmp.quantity.toString().indexOf(filter_text) + 1
          || ppmp.abc.toString().indexOf(filter_text) + 1
          || ppmp.unit.indexOf(filter_text) + 1
          || ppmp.procurement_mode.indexOf(filter_text) + 1
          || ppmp.milestone_1?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_2?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_3?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_4?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_5?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_6?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_7?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_8?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_9?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_10?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_11?.toString().indexOf(filter_text) + 1
          || ppmp.milestone_12?.toString().indexOf(filter_text) + 1;
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

  const formatCurrency = amount => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  const formatNumber = value => new Intl.NumberFormat('en-PH').format(value);

  const formatDate = date => new Date(date).toDateString().substring(4);

  watch(() => grid_options.value.year, () => loadData());
  watch(() => grid_options.value.pagination.page, () => spliceData());
  watch(() => grid_options.value.filter_text, () => {
    grid_options.value.pagination.page = 1;
    filterData();
    spliceData();
  });
  watch(() => grid_options.value.office_id, () => {
    loadData();
    sortData();
    filterData();
    spliceData();
  });
  watch(() => grid_options.value.sort, () => {
    sortData();
    filterData();
    spliceData();
  });

  loadData();
</script>

<template>
  <div class="w-full h-full flex flex-col space-y-8">
    <div class="flex-shrink-0 flex justify-between items-center">
      <div class="flex flex-col">
        <h2 class="text-3xl text-gray-600 font-medium">APPs</h2>
        <p class="text-gray-400">Annual Procurement Plans</p>
      </div>
    </div>
    <div class="flex-grow flex-col space-y-4">
      <div class="flex-shrink-0 flex justify-between items-center space-x-4">
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
        <div v-for="app in grid_options.spliced_data" :key="app.id" class="w-196 flex flex-col space-y-8 bg-white p-8 mb-12 rounded shadow-lg">
          <div class="flex items-stretch">
            <div class="flex-grow">
              <p class="text-sm text-gray-400 uppercase font-bold">Total Amount</p>
              <p class="text-3xl text-green-600 font-bold">{{ formatCurrency(app.quantity * app.abc) }}</p>
            </div>
          </div>
          <div class="flex items-stretch">
            <div class="flex-grow w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Title</p>
              <p class="text-gray-600 font-medium">{{ app.item.title }}</p>
            </div>
            <div class="flex-shrink-0 w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Category</p>
              <p class="text-gray-600 font-medium">{{ app.item.item_category.name }}</p>
            </div>
          </div>
          <div class="flex items-stretch">
            <div class="flex-grow w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Commodity Type</p>
              <p class="text-gray-600 font-medium">{{ app.item.commodity_type }}</p>
            </div>
            <div class="flex-shrink-0 w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Version</p>
              <p class="text-gray-600 font-medium">{{ app.item.version }}</p>
            </div>
          </div>
          <div class="flex flex-col">
            <p class="text-sm text-gray-400 uppercase font-bold">Details</p>
            <p class="text-gray-600 font-medium">{{ app.item.details }}</p>
          </div>
          <div class="flex items-stretch">
            <div class="flex-grow w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Total Quantity</p>
              <p class="text-gray-600 font-medium">{{ formatNumber(app.quantity) }}</p>
            </div>
            <div class="flex-shrink-0 w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Price</p>
              <p class="text-gray-600 font-medium">{{ formatCurrency(app.abc) }}</p>
            </div>
          </div>
          <div class="flex items-stretch">
            <div class="flex-grow w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Unit</p>
              <p class="text-gray-600 font-medium">{{ app.unit }}</p>
            </div>
            <div class="flex-shrink-0 w-1/2">
              <p class="text-sm text-gray-400 uppercase font-bold">Procurement Mode</p>
              <p class="text-gray-600 font-medium">{{ app.procurement_mode }}</p>
            </div>
          </div>
          <div class="flex flex-col">
            <p class="text-sm text-gray-400 uppercase font-bold">Monthly Quantity Requirement</p>
            <div class="flex items-baseline space-x-4">
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Jan</span>
                <span>{{ formatNumber(app.milestone_1 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Feb</span>
                <span>{{ formatNumber(app.milestone_2 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">March</span>
                <span>{{ formatNumber(app.milestone_3 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q1 Quantity</span>
                <span>{{ formatNumber((app.milestone_1/1 ?? 0) + (app.milestone_2/1 ?? 0) + (app.milestone_3/1 ?? 0) ?? 0) }}</span>
              </div>
              <div class="w-2/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q1 Amount</span>
                <span>{{ formatCurrency(((app.milestone_1/1 ?? 0) + (app.milestone_2/1 ?? 0) + (app.milestone_3/1 ?? 0)) * app.abc) }}</span>
              </div>
            </div>
            <div class="flex items-baseline space-x-4 mt-2">
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">April</span>
                <span>{{ formatNumber(app.milestone_4 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">May</span>
                <span>{{ formatNumber(app.milestone_5 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">June</span>
                <span>{{ formatNumber(app.milestone_6 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q2 Quantity</span>
                <span>{{ formatNumber((app.milestone_4/1 ?? 0) + (app.milestone_5/1 ?? 0) + (app.milestone_6/1 ?? 0) ?? 0) }}</span>
              </div>
              <div class="w-2/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q2 Amount</span>
                <span>{{ formatCurrency(((app.milestone_4/1 ?? 0) + (app.milestone_5/1 ?? 0) + (app.milestone_6/1 ?? 0)) * app.abc) }}</span>
              </div>
            </div>
            <div class="flex items-baseline space-x-4 mt-2">
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">July</span>
                <span>{{ formatNumber(app.milestone_7 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Aug</span>
                <span>{{ formatNumber(app.milestone_8 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Sept</span>
                <span>{{ formatNumber(app.milestone_9 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q3 Quantity</span>
                <span>{{ formatNumber((app.milestone_7/1 ?? 0) + (app.milestone_8/1 ?? 0) + (app.milestone_9/1 ?? 0) ?? 0) }}</span>
              </div>
              <div class="w-2/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q3 Amount</span>
                <span>{{ formatCurrency(((app.milestone_7/1 ?? 0) + (app.milestone_8/1 ?? 0) + (app.milestone_9/1 ?? 0)) * app.abc) }}</span>
              </div>
            </div>
            <div class="flex items-baseline space-x-4 mt-2">
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Oct</span>
                <span>{{ formatNumber(app.milestone_10 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Nov</span>
                <span>{{ formatNumber(app.milestone_11 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                <span class="text-xs uppercase font-medium">Dec</span>
                <span>{{ formatNumber(app.milestone_12 ?? 0) }}</span>
              </div>
              <div class="w-1/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q4 Quantity</span>
                <span>{{ formatNumber((app.milestone_10/1 ?? 0) + (app.milestone_11/1 ?? 0) + (app.milestone_12/1 ?? 0) ?? 0) }}</span>
              </div>
              <div class="w-2/6 flex flex-col items-center bg-gray-600 text-white p-2 border rounded">
                <span class="text-xs uppercase font-medium">Q4 Amount</span>
                <span>{{ formatCurrency(((app.milestone_10/1 ?? 0) + (app.milestone_11/1 ?? 0) + (app.milestone_12/1 ?? 0)) * app.abc) }}</span>
              </div>
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
</template>

<style scoped>
  .w-196 {
    width: 49rem;
  }
</style>