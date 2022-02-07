<script lang="ts" setup>
import { computed } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import { format } from '@/lib/utils/format'

// Props
const props = defineProps<{
  stream: StreamData
}>()

const tokensLockedNow = computed(() => props.stream.userState?.netDeposits - props.stream.userState?.tokens)
const tokensLockedEnd = computed(() => props.stream.userState?.netDeposits)
const rewardsEarnedNow = computed(() => props.stream.userState?.rewards)
const rewardsEarnedEnd = computed(() => {
    let totalDepositRemaining = props.stream.depositTokenUnstreamed
    let userDepositRemaining = props.stream.userState?.tokens
    let rewardRemaining = props.stream.rewardTokenRemaining
    if (totalDepositRemaining == 0) return rewardsEarnedNow.value
    return rewardsEarnedNow.value + userDepositRemaining * rewardRemaining / totalDepositRemaining
})
const avgPriceNow = computed(() => {
    return tokensLockedNow.value / rewardsEarnedNow.value
})
const avgPriceEnd = computed(() => {
    return tokensLockedEnd.value / rewardsEarnedEnd.value
})


</script>

<template>
    <div class="p-8">
        <h2>YOUR POSITION</h2>
        <div class="grid grid-cols-3 gap-2">
            <div></div>
            <div class="statLabel">Now</div>
            <div class="statLabel">Est. Total</div>
            <div class="statLabel">Tokens Locked:</div>
            <div class="statValue">{{format(tokensLockedNow)}} {{stream.depositToken.symbol}}</div>
            <div class="statValue">{{format(tokensLockedEnd)}} {{stream.depositToken.symbol}}</div>
            <div class="statLabel">Rewards Earned:</div>
            <div class="statValue">{{format(rewardsEarnedNow)}} {{stream.rewardToken.symbol}}</div>
            <div class="statValue">{{format(rewardsEarnedEnd)}} {{stream.rewardToken.symbol}}</div>
            <div class="statLabel">Avg. Price:</div>
            <div class="statValue">{{format(avgPriceNow)}} {{stream.depositToken.symbol}}</div>
            <div class="statValue">{{format(avgPriceEnd)}} {{stream.depositToken.symbol}}</div>
        </div>
    </div>
</template>

<style scoped>
div .statValue {
    font-size: 14px;
}
</style>
