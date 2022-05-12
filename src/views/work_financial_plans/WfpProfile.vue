<script setup>
  import { ref, watch, provide, inject } from 'vue';
  import { useRoute } from "vue-router";
  import axios from "axios";
  import Cookies from 'js-cookie';
  
  provide('wfp_id', useRoute().params.id);
  
  // modal
  import Modal from "../../components/overlays/Modal.vue";
  import MessageSuccess from "../../components/messages/MessageSuccess.vue";
  
  const modal_options = ref({
    show: false,
    size: '',
    component: '',
    data: null,
  });
  
  const closeModal = () => {
    modal_options.value = {
      show: false,
      size: '',
      component: '',
      data: null,
    };
  };
  
  // wfp
  import WfpForm from "./WfpForm.vue";
  
  const wfp = ref(null);
  
  axios.get(`${import.meta.env.VITE_API_URL}/wfps/${useRoute().params.id}`)
  .then(response => wfp.value = response.data);
  
  const updateWfp = () => {
    modal_options.value = {
      show: true,
      width: 50,
      component: WfpForm,
      data: wfp.value,
    };
  };
  
  const updatedWfp = data => {
    wfp.value = data;
    
    modal_options.value = {
      show: true,
      width: 30,
      component: MessageSuccess,
      data: 'WFP has been updated.',
    };
  };
  
  // grid
  const grid_options = ref({
    year: useRoute().query.year ?? new Date().getFullYear(),
    filter_text: '',
    sort: 'estimated_budget_desc',
    sort_options: [
      { value: 'estimated_budget_asc', label: 'Cost Low-High' },
      { value: 'estimated_budget_desc', label: 'Cost High-Low' },
    ],
    sorted_data: [],
    filtered_data: [],
    spliced_data: [],
    pagination: {
      page: 1,
      per_page: 4,
      max_page: 0,
    },
  });
  
  const loadData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/wfp/${useRoute().params.id}/ppmps`)
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
      case 'estimated_budget_asc':
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
  watch(() => grid_options.value.sort, () => {
    sortData();
    spliceData();
  });
  
  loadData();
  
  // ppmp
  import PpmpForm from "./project_procurement_management_plans/PpmpForm.vue";
  import ConfirmDeletePpmp from "./project_procurement_management_plans/ConfirmDeletePpmp.vue";
  
  const computeAllocatedCost = () => {
    wfp.value.allocated = 0;

    grid_options.value.sorted_data.forEach(ppmp => {
      wfp.value.allocated += (ppmp.quantity * ppmp.abc);
    });
  };
  
  const createPpmp = () => {
    modal_options.value = {
      show: true,
      width: 40,
      component: PpmpForm,
    };
  };
  
  const createdPpmp = ppmp => {
    grid_options.value.sorted_data.push(ppmp);
    computeAllocatedCost();
    sortData();
    filterData();
    spliceData();
    closeModal();
  };
  
  const updatePpmp = id => {
    modal_options.value = {
      show: true,
      width: 40,
      component: PpmpForm,
      data: JSON.parse(JSON.stringify(grid_options.value.spliced_data.find(item => item.id === id))),
    };
  };
  
  const updatedPpmp = new_ppmp => {
    grid_options.value.sorted_data.some((ppmp, index) => {
      if (ppmp.id === new_ppmp.id) {
        grid_options.value.sorted_data[index] = new_ppmp;
        return true;
      }
    });
    
    computeAllocatedCost();
    sortData();
    filterData();
    spliceData();
    closeModal();
  };
  
  const deletePpmp = id => {
    modal_options.value = {
      show: true,
      width: 40,
      component: ConfirmDeletePpmp,
      data: JSON.parse(JSON.stringify(grid_options.value.spliced_data.find(item => item.id === id))),
    };
  };
  
  const deletedPpmp = id => {
    grid_options.value.sorted_data.some((ppmp, index) => {
      if (ppmp.id === id) {
        grid_options.value.sorted_data.splice(index, 1);
        return true;
      }
    });
    
    computeAllocatedCost();
    spliceData();
    closeModal();
  };
</script>

<template>
  <div v-if="wfp" class="w-full h-full flex flex-col space-y-8">
    <div class="flex flex-col">
      <h2 class="text-2xl text-gray-600 font-medium">WFP Details</h2>
    </div>
    <div class="flex flex-col space-y-8 bg-white p-8 rounded shadow-lg">
      <div class="flex items-start">
        <div class="flex-grow">
          <p class="text-sm text-gray-400 uppercase font-bold">Cost</p>
          <p class="text-3xl text-green-600 font-bold">{{ formatCurrency(wfp.cost) }}</p>
          <p class="text-sm text-gray-500">{{ formatCurrency(wfp.cost - wfp.allocated) }} {{ `(${(100 - (wfp.allocated / wfp.cost) * 100).toLocaleString()}%)` }} remaining</p>
        </div>
        <p class="text-xs text-white uppercase font-bold px-4 py-1 rounded" :class="{ 'bg-green-600': wfp.status === 'approved', 'bg-gray-400': wfp.status !== 'approved' }">{{ wfp.status }}</p>
      </div>
      <div class="flex items-stretch">
        <div class="flex-shrink-0 w-1/2">
          <p class="text-sm text-gray-400 uppercase font-bold">Function Type</p>
          <p class="text-gray-600 font-medium">{{ wfp.function_type }}</p>
        </div>
        <div class="flex-grow w-1/2">
          <p class="text-sm text-gray-400 uppercase font-bold">Year</p>
          <p class="text-gray-600 font-medium">{{ wfp.fund_source.year }}</p>
        </div>
      </div>
      <div class="flex items-stretch">
        <div class="flex-grow w-1/2">
          <p class="text-sm text-gray-400 uppercase font-bold">Fund Source</p>
          <p class="text-gray-600 font-medium">{{ `${wfp.fund_source.name} - ${wfp.fund_source.program}` }}</p>
        </div>
        <div class="flex-shrink-0 w-1/2">
          <p class="text-sm text-gray-400 uppercase font-bold">Timeframe</p>
          <p class="text-gray-600 font-medium">{{ `${formatDate(wfp.timeframe_from)} - ${formatDate(wfp.timeframe_to)}` }}</p>
        </div>
      </div>
      <div class="flex items-stretch">
        <div class="flex-grow w-1/2">
          <p class="text-sm text-gray-400 uppercase font-bold">Office</p>
          <p class="text-gray-600 font-medium">{{ `${wfp.fund_source.office.name} (${wfp.fund_source.office.short_name})` }}</p>
        </div>
        <div class="flex-shrink-0 w-1/2">
          <p class="text-sm text-gray-400 uppercase font-bold">Targets</p>
          <p class="text-gray-600 font-medium">{{ `${wfp.target_q1} (Q1) - ${wfp.target_q2} (Q2) - ${wfp.target_q3} (Q3) - ${wfp.target_q4} (Q4)` }}</p>
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
        <p class="text-sm text-gray-400 uppercase font-bold">Item</p>
        <p class="text-gray-600 font-medium">{{ wfp.item }}</p>
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-400 font-medium uppercase">Last Updated:</span>
          <span class="text-xs text-gray-400 font-medium">{{ new Date(wfp.updated_at).toLocaleString() }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="updateWfp"><i class="fas fa-pencil text-sm text-gray-500 hover:text-amber-500"></i></button>
          <button v-if="wfp.allocated === null" @click="deleteFundSource(wfp.id)"><i class="fas fa-trash text-sm text-gray-500 hover:text-red-600"></i></button>
          <button v-if="wfp.status === 'pending'" @click="deleteFundSource(wfp.id)"><i class="fas fa-thumbs-up text-sm text-gray-500 hover:text-green-600"></i></button>
        </div>
      </div>
    </div>
    <div class="flex flex-col space-y-8">
      <div class="flex-shrink-0 flex justify-between items-center">
        <div class="flex flex-col">
          <h2 class="text-2xl text-gray-600 font-medium">PPMPs</h2>
          <p class="text-gray-400">Project Procurement Plans</p>
        </div>
        <div class="flex items-center space-x-4">
          <form>
            <input type="search" class="px-3 py-1.5 border rounded" />
          </form>
          <button @click="createPpmp" type="button" class="bg-gray-200 px-3 py-1.5 border rounded hover:text-white hover:bg-green-600">
          <span class="flex items-center space-x-1">
            <i class="fas fa-plus"></i>
            <span class="font-medium">Add PPMP</span>
          </span>
          </button>
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
            </div>
          </form>
          <div class="flex items-center space-x-4">
            <p v-if="grid_options.pagination.max_page > 1" class="text-gray-600">Displaying {{ `${(grid_options.pagination.page - 1) * grid_options.pagination.per_page + 1}-${(grid_options.pagination.page - 1) * grid_options.pagination.per_page + grid_options.spliced_data.length }` }} of {{ grid_options.filtered_data.length }} items</p>
            <button type="button" v-if="grid_options.pagination.max_page > 1" @click="previousPage()" class="text-gray-400 hover:text-green-600"><i class="fas fa-chevron-left"></i></button>
            <button type="button" v-if="grid_options.pagination.max_page > 1" @click="nextPage()" class="text-gray-400 hover:text-green-600"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="flex justify-between flex-wrap">
          <div v-for="ppmp in grid_options.spliced_data" :key="ppmp.id" class="w-196 flex flex-col space-y-8 bg-white p-8 mb-12 rounded shadow-lg">
            <div class="flex items-stretch">
              <div class="flex-grow">
                <p class="text-sm text-gray-400 uppercase font-bold">Estimated Budget</p>
                <p class="text-3xl text-green-600 font-bold">{{ formatCurrency(ppmp.quantity * ppmp.abc) }}</p>
              </div>
            </div>
            <div class="flex items-stretch">
              <div class="flex-grow w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Title</p>
                <p class="text-gray-600 font-medium">{{ ppmp.item.title }}</p>
              </div>
              <div class="flex-shrink-0 w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Category</p>
                <p class="text-gray-600 font-medium">{{ ppmp.item.item_category.name }}</p>
              </div>
            </div>
            <div class="flex items-stretch">
              <div class="flex-grow w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Commodity Type</p>
                <p class="text-gray-600 font-medium">{{ ppmp.item.commodity_type }}</p>
              </div>
              <div class="flex-shrink-0 w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Version</p>
                <p class="text-gray-600 font-medium">{{ ppmp.item.year }}</p>
              </div>
            </div>
            <div class="flex flex-col">
              <p class="text-sm text-gray-400 uppercase font-bold">Details</p>
              <p class="text-gray-600 font-medium">{{ ppmp.item.details }}</p>
            </div>
            <div class="flex items-stretch">
              <div class="flex-grow w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Quantity</p>
                <p class="text-gray-600 font-medium">{{ formatNumber(ppmp.quantity) }}</p>
              </div>
              <div class="flex-shrink-0 w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">ABC</p>
                <p class="text-gray-600 font-medium">{{ formatCurrency(ppmp.abc) }}</p>
              </div>
            </div>
            <div class="flex items-stretch">
              <div class="flex-grow w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Unit</p>
                <p class="text-gray-600 font-medium">{{ ppmp.unit }}</p>
              </div>
              <div class="flex-shrink-0 w-1/2">
                <p class="text-sm text-gray-400 uppercase font-bold">Procurement Mode</p>
                <p class="text-gray-600 font-medium">{{ ppmp.procurement_mode }}</p>
              </div>
            </div>
            <div class="flex flex-col">
              <p class="text-sm text-gray-400 uppercase font-bold">Milestones</p>
              <div class="flex items-baseline space-x-4">
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Jan</span>
                  <span>{{ formatNumber(ppmp.milestone_1 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Feb</span>
                  <span>{{ formatNumber(ppmp.milestone_2 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">March</span>
                  <span>{{ formatNumber(ppmp.milestone_3 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">April</span>
                  <span>{{ formatNumber(ppmp.milestone_4 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">May</span>
                  <span>{{ formatNumber(ppmp.milestone_5 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">June</span>
                  <span>{{ formatNumber(ppmp.milestone_6 ?? 0) }}</span>
                </div>
              </div>
              <div class="flex items-baseline space-x-4 mt-4">
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">July</span>
                  <span>{{ formatNumber(ppmp.milestone_7 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Aug</span>
                  <span>{{ formatNumber(ppmp.milestone_8 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Sept</span>
                  <span>{{ formatNumber(ppmp.milestone_9 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Oct</span>
                  <span>{{ formatNumber(ppmp.milestone_10 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Nov</span>
                  <span>{{ formatNumber(ppmp.milestone_11 ?? 0) }}</span>
                </div>
                <div class="w-1/6 flex flex-col items-center p-2 border rounded">
                  <span class="text-xs uppercase font-medium">Dec</span>
                  <span>{{ formatNumber(ppmp.milestone_12 ?? 0) }}</span>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400 font-medium uppercase">Last Updated:</span>
                <span class="text-xs text-gray-400 font-medium">{{ new Date(ppmp.updated_at).toLocaleString() }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <button @click="updatePpmp(ppmp.id)"><i class="fas fa-pencil text-sm text-gray-500 hover:text-amber-500"></i></button>
                <button @click="deletePpmp(ppmp.id)"><i class="fas fa-trash text-sm text-gray-500 hover:text-red-600"></i></button>
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
  </div>
  
  <modal :options="modal_options" @close="closeModal()">
    <component
      :is="modal_options.component"
      :data="modal_options.data"
      @updated="updatedWfp"
      @created-ppmp="createdPpmp"
      @updated-ppmp="updatedPpmp"
      @deleted-ppmp="deletedPpmp"
      @close="closeModal()"
    />
  </modal>
</template>

<style scoped>
  .w-196 {
    width: 49rem;
  }
</style>