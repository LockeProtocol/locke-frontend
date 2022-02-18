<script lang="ts" setup>
import { computed } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import { format } from '@/lib/utils/format'
import { DateTime } from 'luxon'
import InfoBox from '@/components/InfoBox.vue'

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
const rewardPerTokenNow = computed(() => {
    return 1 / avgPriceNow.value
})
const rewardPerTokenEnd = computed(() => {
    return 1 / avgPriceEnd.value
})
const streamEnded = computed(() => {
    return DateTime.now().toSeconds() > props.stream.streamParams.endStream
})
const estimatedAPRNow = computed(() => {
    let rewardPrice = props.stream.rewardToken.priceUSD
    let depositPrice = props.stream.depositToken.priceUSD
    if (rewardPrice == 0 || depositPrice == 0) return NaN

    let duration = props.stream.streamParams.endDepositLock - props.stream.streamParams.endStream
    let secondsPerYear = 60*60*24*365
    let rewardUSD = rewardsEarnedNow.value * rewardPrice
    let depositUSD = tokensLockedNow.value * depositPrice
    return (rewardUSD / depositUSD) * (secondsPerYear / duration)
})
const estimatedAPREnd = computed(() => {
    let rewardPrice = props.stream.rewardToken.priceUSD
    let depositPrice = props.stream.depositToken.priceUSD
    if (rewardPrice == 0 || depositPrice == 0) return NaN

    let duration = props.stream.streamParams.endDepositLock - props.stream.streamParams.endStream
    let secondsPerYear = 60*60*24*365
    let rewardUSD = rewardsEarnedEnd.value * rewardPrice
    let depositUSD = tokensLockedEnd.value * depositPrice
    return (rewardUSD / depositUSD) * (secondsPerYear / duration)
})


</script>

<template>
    <div class="p-8">
        <h2>YOUR POSITION</h2>
        <div class="grid grid-cols-3 gap-y-2 text-right">
            <div></div>
            <div class="statLabel" :class="{invisible: streamEnded}">Now</div>
            <div class="statLabel" :class="{invisible: streamEnded}">Est. Total  <info-box message="Estimated values at the end of the auction that assume the average price remains constant."/></div>
            <div class="statLabel text-left">Tokens Locked: <info-box message="The number of tokens you’ve deposited that can no longer be withdrawn"/></div>
            <div class="statValue" :class="{invisible: streamEnded}">{{format(tokensLockedNow)}} {{stream.depositToken.symbol}}</div>
            <div class="statValue">{{format(tokensLockedEnd)}} {{stream.depositToken.symbol}}</div>
            <div class="statLabel text-left">Rewards Earned: <info-box message="The number of reward tokens you’ve earned in exchange for your locked deposit tokens"/></div>
            <div class="statValue" :class="{invisible: streamEnded}">{{format(rewardsEarnedNow)}} {{stream.rewardToken.symbol}}</div>
            <div class="statValue">{{format(rewardsEarnedEnd)}} {{stream.rewardToken.symbol}}</div>
            <template v-if="stream.isSale">
                <div class="statLabel text-left">Avg. Price: <info-box message="Average price is calculated as: rewards earned / tokens locked
"/></div>
                <div class="statValue" :class="{invisible: streamEnded}">{{format(avgPriceNow)}} {{stream.depositToken.symbol}}</div>
                <div class="statValue">{{format(avgPriceEnd)}} {{stream.depositToken.symbol}}</div>
            </template>
            <template v-else>
                <div class="statLabel text-left">Reward per {{stream.depositToken.symbol}}:</div>
                <div class="statValue" :class="{invisible: streamEnded}">{{format(rewardPerTokenNow)}} {{stream.rewardToken.symbol}}</div>
                <div class="statValue ">{{format(rewardPerTokenEnd)}} {{stream.rewardToken.symbol}}</div>
                <div class="statLabel text-left">Est. APR:</div>
                <div class="statValue" :class="{invisible: streamEnded}">{{format(estimatedAPRNow * 100)}}{{estimatedAPRNow ? '%' : ''}}</div>
                <div class="statValue ">{{format(estimatedAPREnd * 100)}}{{estimatedAPREnd ? '%' : ''}}</div>
            </template>
        </div>
    </div>
</template>

<style scoped>
div .statValue {
    font-size: 14px;
}
</style>
