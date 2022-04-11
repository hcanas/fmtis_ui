<script setup>
  import { ref, computed, provide } from 'vue';
  import Cookies from 'js-cookie';
  
  const user = computed(() => JSON.parse(Cookies.get('auth_user')));
  
  const year_options = ref([
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
    { value: 2024, label: 2024 },
    { value: 2025, label: 2025 },
  ]);
  
  provide('year_options', year_options);
</script>

<template>
  <div class="w-full h-full flex">
    <!-- Sidebar -->
    <div id="sidebar" class="w-24 h-full flex-shrink-0 flex flex-col justify-between items-center py-8 shadow-xl">
      <img src="./assets/logo.png" class="w-10 flex-shrink-0 rounded">
      
      <div id="navigation" class="flex flex-col items-center space-y-8">
        <router-link to="/" title="Dashboard">
          <i class="fas fa-gauge"></i>
        </router-link>
        <router-link to="/fund_sources" title="Fund Sources">
          <i class="fas fa-piggy-bank"></i>
        </router-link>
        <router-link to="/wfps" title="WFPs">
          <i class="fas fa-clipboard-list"></i>
        </router-link>
        <router-link to="/apps" title="APPs">
          <i class="fas fa-calendar-days"></i>
        </router-link>
        <router-link to="/prs" title="PRs">
          <i class="fas fa-cart-shopping"></i>
        </router-link>
        <router-link to="/pos" title="POs">
          <i class="fas fa-truck"></i>
        </router-link>
      </div>
      
      <div></div>
    </div>
    
    <!-- Main Content -->
    <div class="h-full flex-grow flex flex-col bg-gray-100 overflow-y-auto">
      <div class="flex-shrink-0 flex justify-end items-center space-x-4 p-8">
        <p class="text-sm text-gray-600 rounded">Welcome, <span class="font-medium">{{ user.given_name }}</span></p>
        <img class="rounded-full w-8">
      </div>
      <div class="flex-grow px-24 py-12">
        <router-view v-slot="{ Component }">
          <transition>
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style>
  #sidebar a {
    @apply text-gray-400
  }
  
  #sidebar a.router-link-active,
  #sidebar a:hover {
    @apply text-green-600
  }
  
  #sidebar i {
    @apply text-xl
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
  
  .v-enter-active {
    transition: opacity 0.5s ease-in-out;
  }
</style>