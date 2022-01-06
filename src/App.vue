<script setup>
import Header from '@/components/Header.vue'
</script>
<template>
  <div>
    <Header/>
    <router-view :key="$route.fullPath"/>
  </div>
</template>
