<script lang="ts" setup>
import { computed } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { DateTime } from 'luxon'
import VueCountdown from '@chenfengyuan/vue-countdown';

function format(n: number): string {
    if (isNaN(n)) return '--'
    if (n == 0) return '0.00'
    let decimals = Math.max(2, Math.floor(Math.log10(n)) * -1 + 1)
    return n.toFixed(decimals)
}

// For countdown timer
function transformSlotProps(props: Object) {
    const formattedProps = {};

      Object.entries(props).forEach(([key, value]) => {
        formattedProps[key] = value < 10 ? `0${value}` : String(value);
      });

      return formattedProps;
}

// Props
const props = defineProps<{
  stream: StreamData
}>()

// Refs
const { sendTransaction } = useWeb3()

// Computed
const tokensLocked = computed(() => props.stream.userState?.netDeposits - props.stream.userState?.tokens)
const rewardsEarned = computed(() => props.stream.userState?.rewards)
const avgPrice = computed(() => tokensLocked.value / rewardsEarned.value)
const isStreamEnded = computed(() => DateTime.now().toSeconds() > props.stream.streamParams.streamStart + props.stream.streamParams.streamDuration)
const secondsRemaining = computed(() => {
    return props.stream.streamParams.startTime 
        + props.stream.streamParams.streamDuration 
        - DateTime.now().toSeconds()
})

// Handlers
const handleClaim = async () => {
    let tx = await sendTransaction(
        props.stream.address,
        streamABI,
        'claimReward',
        []
    )
    await tx.wait()
}
</script>

<template>
    <div id="claim-reward" class="mx-auto p-8 flex flex-col">
        <h2 class="label">CLAIM REWARDS</h2>
        <div class="grid grid-cols-2 m-2 mb-6 gap-2">
            <p class="statLabel">Tokens Locked:</p>
            <p class="statValue text-right">{{format(tokensLocked)}} {{stream.depositToken.symbol}}</p>
            <p class="statLabel">Rewards Earned:</p>
            <p class="statValue text-right">{{format(rewardsEarned)}} {{stream.rewardToken.symbol}}</p>
            <p class="statLabel">Average Price:</p>
            <p class="statValue text-right">{{format(avgPrice)}} {{stream.depositToken.symbol}}</p>
        </div>
        <div class="w-full cursor-pointer actionButton" @click="handleClaim" v-if="isStreamEnded">CLAIM {{format(stream.userState?.rewards)}} {{stream.rewardToken.symbol}}</div>
        <div class="w-full cursor-not-allowed actionButton" v-else>
            <vue-countdown :time="secondsRemaining * 1000" :transform="transformSlotProps" v-slot="{ days, hours, minutes, seconds }">
                {{ days }}:{{ hours }}:{{ minutes }}:{{ seconds }} REMAINING
            </vue-countdown> 
        </div>
    </div>
</template>

<style scoped>
#claim-reward .statValue {
    font-size: 12px;
}
</style>