<script lang="ts" setup>

const props = defineProps<{
  msg: string
}>()
const emit = defineEmits(['dismissed'])

</script>

<template>
    <div class="mt-4 text-center" v-if="msg != ''">
        <div>
            <div class="error">
                <div class="error-close" @click="emit('dismissed')">X</div>
                <span class="error-text">{{msg}}</span>                    
            </div>
        </div>
    </div>
</template>

<style scoped>
.error {
    font-family: VCR;
    padding: 8px;
    border-radius: 4px;
    background: #ffffff10;
}

.error-text {
    font-size: 12px;
    color: #E84142;
}

.error-close {
    float: right;
    font-size: 12px;
    background: #ffffff20;
    border-radius: 4px;
    padding-left: 6px;
    padding-right: 6px;
    cursor: pointer;
}
</style>