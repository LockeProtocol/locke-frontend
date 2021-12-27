<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import { DateTime } from 'luxon'
import useAllowance from '@/composables/useAllowance'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { parseUnits, formatUnits } from '@ethersproject/units'

// Props
const props = defineProps<{
  stream: StreamData
}>()

function format(n: number): string {
    let decimals = Math.max(2, Math.floor(Math.log10(n)) * -1 + 1)
    return n.toFixed(decimals)
}

// Refs
const depositAmount = ref('')
const { account, sendTransaction } = useWeb3()
const { balance, allowance, loaded, load, approveUnlimited, revokeApproval } = useAllowance(props.stream.depositToken.address, account.value, '0xfdb15336C15b995d2709381494CFEf9A149FE146')

// Computed
const estimatedReward = computed(() => {
    let tvl = props.stream.tokenAmounts.depositTokenAmount
    let depositValue = parseFloat(depositAmount.value)
    let elapsedTime = DateTime.now().toSeconds() - props.stream.streamParams.startTime
    let fractionElapsed = elapsedTime / props.stream.streamParams.streamDuration
    let remainingReward = (props.stream.tokenAmounts.rewardTokenAmount) * (1 - fractionElapsed)
    return remainingReward * (depositValue / (tvl + depositValue))
})

const estimatedPrice = computed(() => {
    let depositValue = parseFloat(depositAmount.value)
    return depositValue / estimatedReward.value
})

const daysRemaining = computed(() => {
    let secondsRemaining = props.stream.streamParams.startTime 
        + props.stream.streamParams.streamDuration 
        - DateTime.now().toSeconds()
    return secondsRemaining / (60 * 60 * 24)
})

const depositValueRaw = computed(() => {
    return parseUnits(depositAmount.value == '' ? '0' : depositAmount.value.toString(), props.stream.depositToken.decimals)
})

const depositButtonTxt = computed(() => {
    if (!loaded.value) {
        return '...'
    } else if (allowance.value.gt(depositValueRaw.value)) {
        return 'DEPOSIT'
    } else {
        return 'APPROVE'
    }
})

const handleDeposit = () => {
    if (depositButtonTxt.value == 'APPROVE') {
        approveUnlimited()
    } else {
        //revokeApproval()
        sendTransaction(
            '0xfdb15336C15b995d2709381494CFEf9A149FE146',
            streamABI,
            'stake',
            [depositValueRaw.value])
    }
}

const setMax = () => {
    depositAmount.value = formatUnits(balance.value, props.stream.depositToken.decimals)
}

watchEffect(() => load())

</script>

<template>
    <div id="deposit" class="p-8 flex flex-col">
        <h2>DEPOSIT {{stream.depositToken.symbol}}</h2>
        <input type="number" placeholder="0" class="textBox outline-none p-3 w-full" v-model="depositAmount"/>
        <p class="statValue text-right mt-2 mb-4"><span class="cursor-pointer" @click="setMax">Max: {{ balance / (10 ** stream.depositToken.decimals) }}</span></p>
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
            <p class="statLabel">Time Remaining:</p>
            <p class="statValue text-right">{{format(daysRemaining)}} days</p>
        </div>
        <div class="w-full cursor-pointer actionButton" @click="handleDeposit">{{depositButtonTxt}}</div>
    </div>
</template>

<style scoped>
#deposit .statValue {
    font-size: 12px;
}
</style>