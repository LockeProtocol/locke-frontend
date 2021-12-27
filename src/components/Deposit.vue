<script lang="ts" setup>

import type { StreamData } from '@/composables/useStreamData'

const props = defineProps<{
  stream: StreamData
}>()

</script>

<template>
    <div>
        {{stream.rewardToken.symbol}}
    </div>
</template>