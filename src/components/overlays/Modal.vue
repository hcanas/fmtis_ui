<script setup>
  const props = defineProps({
    options: Object,
  });
  
  const emit = defineEmits(['close']);
</script>

<template>
  <div :class="{ 'translate-y-0': props.options.show, '-translate-y-full': !props.options.show }" class="absolute inset-0 w-full max-h-full flex justify-center items-center transition transform">
    <div class="absolute inset-0 bg-gray-900 opacity-80" />
    <div class="absolute max-h-full bg-white p-8 rounded overflow-y-auto" :style="`width: ${props.options.width}em`">
      <button type="button" @click="emit('close')" class="absolute top-0 right-0 px-3 py-1 text-gray-400 hover:text-gray-600" title="Close"><i class="fas fa-times text-lg"></i></button>
      <slot />
    </div>
  </div>
</template>