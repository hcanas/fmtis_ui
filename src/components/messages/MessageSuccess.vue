<script setup>
  const props = defineProps({
    data: String,
  });
  const emit = defineEmits(['close']);
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="flex-shrink-0 flex justify-center items-center space-x-2 text-2xl">
      <i class="fas fa-circle-check text-green-600"></i>
      <span class="uppercase font-bold text-green-600">Success</span>
    </div>
    <p class="text-center text-green-600">{{ props.data }}</p>
    <div class="flex justify-center">
      <button type="button" @click="emit('close')" class="text-gray-600 bg-gray-100 hover:text-white hover:bg-gray-500 font-medium px-4 py-1.5 border rounded">
        <div class="flex justify-center items-center space-x-2">
          <i class="fas fa-times"></i>
          <span>Close</span>
        </div>
      </button>
    </div>
  </div>
</template>