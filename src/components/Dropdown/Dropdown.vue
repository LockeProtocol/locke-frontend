<script setup>
import { provide, reactive, ref, watch } from 'vue'
const sharedState = reactive({ active: false, selected: '' })
const selected = ref(sharedState.selected)
provide('dropdownState', sharedState)

const emit = defineEmits(['selectionChanged'])

const away = () => {
    sharedState.active = false;
}

const toggle = () => {
    sharedState.active = !sharedState.active
}

watch(() => sharedState.selected, () => {
    emit('selectionChanged', sharedState.selected)
})
</script>

<template>
  <div @click="toggle" v-click-away="away" class="relative">
    <slot name="toggler">
      <button>Toggle</button>
    </slot>
    <slot/>
  </div>
</template>