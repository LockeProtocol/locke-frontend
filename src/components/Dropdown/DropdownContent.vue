<script setup>
import { inject, computed } from 'vue'
const sharedState = inject('dropdownState')
const active = computed(() => sharedState.active)

</script>
<template>
  <transition name="dropdown-content">
    <div
      v-if="active"
      class="origin-top-right absolute right-0 mt-2 w-48 py-2 z-10 dropdown-content"
    >
      <slot/>
    </div>
  </transition>
</template>

<style scoped>
.dropdown-content-enter-active,
.dropdown-content-leave-active {
  transition: all 0.2s;
}
.dropdown-content-enter-from,
.dropdown-content-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.dropdown-content {
    background: #18181e;
    border: 1px solid #ffffff80;
    font-family: VCR;
    border-radius: 4px;
}
</style>