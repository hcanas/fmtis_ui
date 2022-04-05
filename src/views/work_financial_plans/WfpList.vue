<template>
  <div class="w-full h-full flex flex-col space-y-8">
    <div class="flex-shrink-0 flex justify-between items-center">
      <div class="flex flex-col">
        <h2 class="text-3xl text-gray-600 font-medium">WFPs</h2>
        <p class="text-gray-400">Work Financial Plans</p>
      </div>
      <div class="flex items-center space-x-4">
        <form>
          <input type="search" class="px-3 py-1.5 border rounded" />
        </form>
        <button type="button" class="bg-gray-200 px-3 py-1.5 border rounded hover:text-white hover:bg-green-600">
          <span class="flex items-center space-x-1">
            <i class="fas fa-plus"></i>
            <span class="font-medium">Add WFP</span>
          </span>
        </button>
      </div>
    </div>
    <div class="flex-grow">
    
    </div>
  </div>
</template>

<script>
  export default {
    name: "WfpList",
  }
</script>

<style scoped>

</style>