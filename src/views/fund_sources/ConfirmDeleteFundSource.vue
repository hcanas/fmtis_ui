<script setup>
  import axios from 'axios';
  
  const props = defineProps({
    data: Object,
  });
  const emit = defineEmits(['deleted', 'close']);
  
  
  const deleteFundSource = () => {
    axios.delete(`${import.meta.env.VITE_API_URL}/fund_sources/${props.data.id}`)
    .then(() => emit('deleted', props.data.id))
    .catch(() => {});
  };
</script>

<template>
  <div class="flex flex-col space-y-8">
    <div class="flex-shrink-0 flex justify-center items-center space-x-2 text-2xl">
      <i class="fas fa-triangle-exclamation text-red-600"></i>
      <span class="uppercase font-bold text-red-600">Delete Fund Source</span>
    </div>
    <div class="flex flex-col">
      <p class="text-center text-red-600">You are about to delete this fund source.</p>
      <p class="flex items-center space-x-2 mt-4">
        <span class="w-16 text-xs font-medium uppercase">Amount:</span>
        <span class="font-medium">{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(props.data.amount) }}</span>
      </p>
      <p class="flex items-center space-x-2">
        <span class="w-16 text-xs font-medium uppercase">Year:</span>
        <span class="font-medium">{{ props.data.year }}</span>
      </p>
      <p class="flex items-center space-x-2">
        <span class="w-16 text-xs font-medium uppercase">Office:</span>
        <span class="font-medium">{{ `${props.data.office.name} (${props.data.office.short_name})`}}</span>
      </p>
      <p class="flex items-center space-x-2">
        <span class="w-16 text-xs font-medium uppercase">Name:</span>
        <span class="font-medium">{{ props.data.name }}</span>
      </p>
      <p class="flex items-center space-x-2">
        <span class="w-16 text-xs font-medium uppercase">Program:</span>
        <span class="font-medium">{{ props.data.program }}</span>
      </p>
    </div>
    <div class="flex justify-between">
      <button type="button" @click="emit('close')" class="text-gray-600 bg-gray-200 hover:text-white hover:bg-gray-600 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-times"></i>
          <span>Cancel</span>
        </div>
      </button>
      <button type="button" @click="deleteFundSource" class="text-gray-600 bg-gray-200 hover:text-white hover:bg-red-600 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-trash-can"></i>
          <span>Delete</span>
        </div>
      </button>
    </div>
  </div>
</template>