<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { DateTime } from 'luxon'
import { format } from '@/lib/utils/format'
import VueCountdown from '@chenfengyuan/vue-countdown';
import ErrorBox from '@/components/ErrorBox.vue'

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
const errorText = ref('')

// Computed
// const tokensLocked = computed(() => props.stream.userState?.netDeposits - props.stream.userState?.tokens)
// const rewardsEarned = computed(() => props.stream.userState?.rewards)
// const avgPrice = computed(() => tokensLocked.value / rewardsEarned.value)
const isRewardClaimable = computed(() => secondsRemaining.value <= 0)
const secondsRemaining = computed(() => {
    return Math.max(0,props.stream.streamParams.endRewardLock
        - DateTime.now().toSeconds())
})

// Handlers
const handleClaim = async () => {
    try {
        let tx = await sendTransaction(
            props.stream.address,
            streamABI,
            'claimReward',
            []
        )
        await tx.wait()
    } catch(e: any) {
        console.log(e)
        errorText.value = e.message
    }
}
</script>

<template>
    <div id="claim-reward" class="mx-auto p-8 flex flex-col">
        <h2 class="label">CLAIM REWARDS</h2>
        <div class="w-full cursor-pointer actionButton" @click="handleClaim" v-if="isRewardClaimable">CLAIM {{format(stream.userState?.rewardsClaimable)}} {{stream.rewardToken.symbol}}</div>
        <div class="w-full cursor-not-allowed actionButton" v-else>
            <vue-countdown :time="secondsRemaining * 1000" :transform="transformSlotProps" v-slot="{ days, hours, minutes, seconds }">
                {{ days }}:{{ hours }}:{{ minutes }}:{{ seconds }} REMAINING
            </vue-countdown> 
        </div>
        <ErrorBox :msg="errorText" @dismissed="errorText=''"/>
    </div>
</template>

<style scoped>
#claim-reward .statValue {
    font-size: 12px;
}
</style>