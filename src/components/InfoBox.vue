<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  message: string
}>()

const active = ref(false)

const away = () => {
    active.value = false;
}
const show = () => {
    active.value = true
}
const toggle = () => {
    active.value = !active.value
}
</script>

<template>
    <div @click="toggle" @mouseenter="show" @mouseleave="away" v-click-away="away" class="relative inline-block align-top">
        <span class="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
        </span>
        <transition name="info-content">
            <div
            v-if="active"
            class="origin-top-right absolute left-0 mt-2 w-48 p-2 z-10 info-content"
            >
            {{message}}
            </div>
        </transition>
    </div>
</template>

<style scoped>
.info-content-enter-active,
.info-content-leave-active {
  opacity: 1;
  transition: all 0.2s;
}
.info-content-enter-from,
.info-content-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.info-content {
    background: #18181e;
    border: 1px solid #ffffff80;
    font-family: Inter;
    border-radius: 4px;
    text-align: left;
}
</style>