<script lang="ts" setup>
import { inject, computed } from 'vue'
const sharedState = inject('dropdownState') as any

const props = defineProps<{
  val: string,
  toggleAble?: boolean
}>()

const selected = computed(() => props.val == sharedState.selected)
const handleSelected = () => {
    if (props.toggleAble && sharedState.selected == props.val) sharedState.selected = ''
    else sharedState.selected = props.val
}

</script>
<template>
  <a href="#" @click="handleSelected" class="block my-1 px-4 py-1" :class="{'selected': (selected && toggleAble)}">
    <slot/>
  </a>
</template>
<style scoped>
.selected::after {
    content: 'x';
    float: right;
}
a:hover {
    background: #ffffff10;
}
a {
    font-size: 14px;
}
</style>