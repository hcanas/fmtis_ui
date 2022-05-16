<script setup>
  import axios from 'axios';
  
  const props = defineProps({
    data: Object,
  });
  
  const emit = defineEmits(['approvedWfp', 'close']);
  
  const approveWfp = () => {
    axios.post(`${import.meta.env.VITE_API_URL}/wfp/${props.data.id}/approval`)
      .then(response => {
        console.log(response.data)
        emit('approvedWfp')
      })
      .catch(() => {});
  };
</script>

<template>
  <div class="flex flex-col space-y-8">
    <div class="flex flex-col space-y-2">
      <div class="flex-shrink-0 flex justify-center items-center space-x-2 text-2xl">
        <i class="fas fa-thumbs-up text-green-600"></i>
        <span class="uppercase font-bold text-green-600">Approve Wfp</span>
      </div>
      <p class="text-center text-green-600">You are about to approve this work and financial plan.</p>
    </div>
    <div class="flex justify-between">
      <button type="button" @click="emit('close')" class="w-64 text-gray-600 bg-gray-100 hover:text-white hover:bg-gray-500 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-times"></i>
          <span>Cancel</span>
        </div>
      </button>
      <button type="button" @click="approveWfp" class="w-64 text-gray-600 bg-gray-100 hover:text-white hover:bg-green-600 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-thumbs-up"></i>
          <span>Approve</span>
        </div>
      </button>
    </div>
  </div>
</template>