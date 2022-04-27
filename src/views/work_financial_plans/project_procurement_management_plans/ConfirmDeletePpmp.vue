<script setup>
  import axios from 'axios';
  
  const props = defineProps({
    data: Object,
  });
  
  const emit = defineEmits(['deletedPpmp', 'close']);
  
  const deletePpmp = () => {
    axios.delete(`${import.meta.env.VITE_API_URL}/wfp/${props.data.wfp_id}/ppmps/${props.data.id}`)
    .then(() => emit('deletedPpmp', props.data.id))
    .catch(() => {});
  };
</script>

<template>
  <div class="flex flex-col space-y-8">
    <div class="flex-shrink-0 flex justify-center items-center space-x-2 text-2xl">
      <i class="fas fa-triangle-exclamation text-red-600"></i>
      <span class="uppercase font-bold text-red-600">Delete PPMP</span>
    </div>
    <div class="flex flex-col">
      <p class="text-center text-red-600">You are about to delete this project procurement management plan.</p>
      <p class="flex items-baseline space-x-2 mt-4">
        <span class="flex-shrink-0 w-40 text-xs font-medium uppercase">Estimated Budget:</span>
        <span class="font-medium">{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(props.data.quantity * props.data.abc) }}</span>
      </p>
      <p class="flex items-baseline space-x-2">
        <span class="flex-shrink-0 w-40 text-xs font-medium uppercase">Title:</span>
        <span class="font-medium">{{ props.data.item.title }}</span>
      </p>
      <p class="flex items-baseline space-x-2">
        <span class="flex-shrink-0 w-40 text-xs font-medium uppercase">Details:</span>
        <span class="font-medium">{{ props.data.item.details }}</span>
      </p>
      <p class="flex items-baseline space-x-2">
        <span class="flex-shrink-0 w-40 text-xs font-medium uppercase">Quantity:</span>
        <span class="font-medium">{{ props.data.quantity.toLocaleString() }}</span>
      </p>
      <p class="flex items-baseline space-x-2">
        <span class="flex-shrink-0 w-40 text-xs font-medium uppercase">ABC:</span>
        <span class="font-medium">{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(props.data.abc) }}</span>
      </p>
    </div>
    <div class="flex justify-between">
      <button type="button" @click="emit('close')" class="text-gray-600 bg-gray-200 hover:text-white hover:bg-gray-600 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-times"></i>
          <span>Cancel</span>
        </div>
      </button>
      <button type="button" @click="deletePpmp" class="text-gray-600 bg-gray-200 hover:text-white hover:bg-red-600 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-trash-can"></i>
          <span>Delete</span>
        </div>
      </button>
    </div>
  </div>
</template>