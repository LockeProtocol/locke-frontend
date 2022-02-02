<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import { DateTime } from 'luxon'
import useAllowance from '@/composables/useAllowance'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { format } from '@/lib/utils/format'
import useBlockNumber from '@/composables/useBlockNumber'
import VueCountdown from '@chenfengyuan/vue-countdown';

// Props
const props = defineProps<{
  stream: StreamData
}>()

// For countdown timer
function transformSlotProps(props: Object) {
    const formattedProps = {};

      Object.entries(props).forEach(([key, value]) => {
        formattedProps[key] = value < 10 ? `0${value}` : String(value);
      });

      return formattedProps;
}

// Refs
const depositAmount = ref('')
const depositing = ref(false)
const { blockNumber } = useBlockNumber()
const { sendTransaction } = useWeb3()
const { balance, 
    allowance, 
    loaded, 
    approving, 
    load, 
    approveUnlimited,
    revokeApproval } = useAllowance(props.stream.depositToken.address, props.stream.address)

// Computed
const estimatedReward = computed(() => {
    let unstreamed = props.stream.depositTokenUnstreamed
    let depositValue = parseFloat(depositAmount.value)
    // let elapsedTime = DateTime.now().toSeconds() - props.stream.streamParams.startTime
    // let fractionElapsed = elapsedTime / props.stream.streamParams.streamDuration
    // let remainingReward = (props.stream.tokenAmounts.rewardTokenAmount) * (1 - fractionElapsed)
    let remainingReward = props.stream.rewardTokenRemaining
    return remainingReward * (depositValue / (unstreamed + depositValue))
})

const estimatedPrice = computed(() => {
    let depositValue = parseFloat(depositAmount.value)
    return depositValue / estimatedReward.value
})

const secondsRemaining = computed(() => {
    return props.stream.streamParams.startTime 
        + props.stream.streamParams.streamDuration 
        - DateTime.now().toSeconds()
})

const depositValueRaw = computed(() => {
    return parseUnits(depositAmount.value == '' ? '0' : depositAmount.value.toString(), props.stream.depositToken.decimals)
})

const depositButtonTxt = computed(() => {
    if (!loaded.value) {
        return '...'
    } else if (approving.value) {
        return 'APPROVING...'
    } else if (depositing.value) {
        return 'DEPOSITING...'
    } else if (allowance.value.gt(depositValueRaw.value)) {
        return 'DEPOSIT'
    } else {
        return 'APPROVE'
    }
})

const maxDisplay = computed(() => {
    return formatUnits(balance.value, props.stream.depositToken.decimals)
})

// Handlers

const handleDeposit = async () => {
    if (depositButtonTxt.value == 'APPROVE') {
        approveUnlimited()
    } else if (depositButtonTxt.value == 'DEPOSIT') {
        depositing.value = true
        try {
            let tx = await sendTransaction(
                props.stream.address,
                streamABI,
                'stake',
                [depositValueRaw.value])
            depositAmount.value = ''
            await tx.wait()
        } finally {
            depositing.value = false
        }
    }
}

const handleMax = () => {
    depositAmount.value = formatUnits(balance.value, props.stream.depositToken.decimals)
}

const handleRevoke = () => {
    revokeApproval()
}

watchEffect(() => blockNumber.value && load())

</script>

<template>
    <div id="deposit" class="p-8 flex flex-col">
        <h2>DEPOSIT {{stream.depositToken.symbol}}</h2>
        <input type="number" placeholder="0" class="textBox outline-none p-3 w-full" v-model="depositAmount"/>
        <p class="statValue text-right mt-2 mb-4"><span class="cursor-pointer opacity-0" @click="handleRevoke">Revoke Allowance</span> <span class="cursor-pointer" @click="handleMax">Max: {{maxDisplay}}</span></p>
        <div class="grid grid-cols-2 m-2 mb-6 gap-2">
            <p class="statLabel">Estimated Reward:</p>
            <p class="statValue text-right">{{
                estimatedReward > 0 
                ? `${format(estimatedReward)} ${stream.rewardToken.symbol}` 
                : '--'
            }}</p>
            <p class="statLabel">Estimated Price:</p>
            <p class="statValue text-right">{{
                estimatedPrice > 0 ? 
                `${format(estimatedPrice)} ${stream.depositToken.symbol}` 
                : '--'
            }}</p>
            <!-- <p class="statLabel">Time Remaining:</p>
            <p class="statValue text-right">
                <vue-countdown :time="secondsRemaining * 1000" :transform="transformSlotProps" v-slot="{ days, hours, minutes, seconds }">
                    {{ days }}:{{ hours }}:{{ minutes }}:{{ seconds }}
                </vue-countdown>
            </p> -->
        </div>
        <div class="w-full cursor-pointer actionButton" @click="handleDeposit">{{depositButtonTxt}}</div>
    </div>
</template>

<style scoped>
#deposit .statValue {
    font-size: 14px;
}
</style>