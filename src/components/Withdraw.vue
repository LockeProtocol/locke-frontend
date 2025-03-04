<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { format } from '@/lib/utils/format'
import ErrorBox from '@/components/ErrorBox.vue'
import InfoBox from '@/components/InfoBox.vue'

// Props
const props = defineProps<{
  stream: StreamData
}>()

// Refs
const withdrawAmount = ref('')
const withdrawing = ref(false)
const exiting = ref(false)
const errorText = ref('')
const { sendTransaction } = useWeb3()

// Computed
const withdrawValueRaw = computed(() => {
    return parseUnits(withdrawAmount.value == '' ? '0' : withdrawAmount.value.toString(), props.stream.depositToken.decimals)
})
const withdrawButtonText = computed(() => {
    if (withdrawing.value) {
        return 'WITHDRAWING...'
    } else {
        return 'WITHDRAW'
    }
})
const exitButtonText = computed(() => {
    if (exiting.value) {
        return 'EXITING...'
    } else {
        return 'EXIT'
    }
})
const estimatedPrice = computed(() => {
    if (withdrawAmount.value == '') return NaN
    let withdrawAmt = parseFloat(withdrawAmount.value)
    let unstreamed = props.stream.depositTokenUnstreamed
    let remainingReward = props.stream.rewardTokenRemaining
    if (unstreamed < withdrawAmt) return NaN
    return (unstreamed - withdrawAmt) / remainingReward
})
const estimatedRewardPerToken = computed(() => {
    return 1 / estimatedPrice.value
})

// Handlers
const handleWithdraw = async () => {
    try {
        withdrawing.value = true
        let tx = await sendTransaction(
            props.stream.address,
            streamABI,
            'withdraw',
            [withdrawValueRaw.value]
        )
        withdrawAmount.value = ''
        await tx.wait()
    } catch(e: any) {
        console.log(e)
        errorText.value = e.message
    } finally {
        withdrawing.value = false
    }
}

const handleExit = async () => {
    try {
        exiting.value = true
        let tx = await sendTransaction(
            props.stream.address,
            streamABI,
            'exit',
            []
        )
        await tx.wait()
    } catch(e: any) {
        console.log(e)
        errorText.value = e.message
    } finally {
        exiting.value = false
    }
}

const dismissError = () => {
    errorText.value = ''
}


</script>

<template>
    <div id="withdraw" class="p-8 flex flex-col">
        <h2>WITHDRAW {{stream.depositToken.symbol}}</h2>
        <input type="number" placeholder="0" class="textBox outline-none p-3 w-full mb-4" v-model="withdrawAmount"/>
        <div class="grid grid-cols-2 m-2 mb-6 gap-2">
            <p class="statLabel">Net Deposits: <info-box message="Your total deposits less your total withdrawals"/></p>
            <p class="statValue text-right">{{format(stream.userState?.netDeposits)}} {{stream.depositToken.symbol}}</p>
            <p class="statLabel">Tokens Locked: <info-box message="The number of tokens you’ve deposited that can no longer be withdrawn"/></p>
            <p class="statValue text-right">{{format(stream.userState?.netDeposits - stream.userState?.tokens)}} {{stream.depositToken.symbol}}</p>
            <p class="statLabel">Tokens Withdrawable: <info-box message="The number of tokens you’ve deposited that are still eligible to be withdrawn. This value decreases in real time; use EXIT to withdraw the maximum amount."/></p>
            <p class="statValue text-right">{{format(stream.userState?.tokens)}} {{stream.depositToken.symbol}}</p>
            <template v-if="stream.isSale">
                <p class="statLabel">Estimated Price: <info-box message="The estimated auction price AFTER your tokens have been withdrawn"/></p>
                <p class="statValue text-right">{{withdrawAmount != '' ? `${format(estimatedPrice)} ${stream.depositToken.symbol}` : '--'}}</p>
            </template>
            <template v-else>
                <p class="statLabel">Est. Reward Per {{stream.depositToken.symbol}}:</p>
                <p class="statValue text-right">{{withdrawAmount != '' ? `${format(estimatedRewardPerToken)} ${stream.rewardToken.symbol}` : '--'}}</p>
            </template>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="w-full cursor-pointer actionButton" @click="handleWithdraw">{{withdrawButtonText}}</div>
            <div class="w-full cursor-pointer actionButton" @click="handleExit">{{exitButtonText}}</div>
        </div>
        <ErrorBox :msg="errorText" @dismissed="errorText=''"/>
    </div>
</template>

<style scoped>
#withdraw .statValue {
    font-size: 14px;
}
</style>