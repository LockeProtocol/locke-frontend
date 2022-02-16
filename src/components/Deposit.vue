<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import { DateTime } from 'luxon'
import useAllowance from '@/composables/useAllowance'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { format, roundBN } from '@/lib/utils/format'
import useBlockNumber from '@/composables/useBlockNumber'
import ErrorBox from '@/components/ErrorBox.vue'

// Props
const props = defineProps<{
  stream: StreamData
}>()

// Refs
const errorText = ref('')
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
    let remainingReward = props.stream.rewardTokenRemaining
    return remainingReward * (depositValue / (unstreamed + depositValue))
})

const estimatedPrice = computed(() => {
    let depositValue = parseFloat(depositAmount.value)
    return depositValue / estimatedReward.value
})

const estimatedRewardPerToken = computed(() => {
    return 1 / estimatedPrice.value
})

const estimatedAPR = computed(() => {
    let duration = props.stream.streamParams.endDepositLock - props.stream.streamParams.endStream
    let rewardUSD = estimatedReward.value * props.stream.rewardToken.priceUSD
    let secondsPerYear = 60*60*24*356
    return (rewardUSD / depositUSD.value) * (secondsPerYear / duration)
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
    return roundBN(formatUnits(balance.value, props.stream.depositToken.decimals))
})

const depositUSD = computed(() => {
    return parseFloat(depositAmount.value) * props.stream.depositToken.priceUSD
})

const depositUSDDisplay = computed(() => {
    if (props.stream.depositToken.priceUSD > 0 && parseFloat(depositAmount.value) > 0) {
        return `$${format(depositUSD.value)}`
    }
    else {
        return ''
    }
})

// Handlers

const handleDeposit = async () => {
    if (depositButtonTxt.value == 'APPROVE') {
        try {
            await approveUnlimited()
        } catch(e: any) {
            console.log(e)
            errorText.value = e.message
        }
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
        } catch(e: any) {
            console.log(e)
            errorText.value = e.message
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
        <div class="flex flex-column justify-between mt-2 mb-4 px-2">
            <div class="statValue faded">{{depositUSDDisplay}}</div>
            <div class="statValue text-right cursor-pointer" @click="handleMax">Max: {{maxDisplay}}</div>
        </div>
        <div class="grid grid-cols-2 m-2 mb-6 gap-2">
            <p class="statLabel">Estimated Reward:</p>
            <p class="statValue text-right">{{
                estimatedReward > 0 
                ? `${format(estimatedReward)} ${stream.rewardToken.symbol}` 
                : '--'
            }}</p>
            <template v-if="stream.isSale">
                <p class="statLabel">Estimated Price:</p>
                <p class="statValue text-right">{{
                    estimatedPrice > 0 ? 
                    `${format(estimatedPrice)} ${stream.depositToken.symbol}` 
                    : '--'
                }}</p>
            </template>
            <template v-else>
                <p class="statLabel">Est. Reward per {{stream.depositToken.symbol}}:</p>
                <p class="statValue text-right">{{
                    estimatedRewardPerToken > 0 ? 
                    `${format(estimatedRewardPerToken)} ${stream.rewardToken.symbol}` 
                    : '--'
                }}</p>
                <p class="statLabel">Est. APR:</p>
                <p class="statValue text-right">{{
                    estimatedAPR > 0 ? 
                    `${format(estimatedAPR*100)}%` 
                    : '--'
                }}</p>
            </template>
        </div>
        <div class="w-full cursor-pointer actionButton" @click="handleDeposit">{{depositButtonTxt}}</div>
        <ErrorBox :msg="errorText" @dismissed="errorText=''"/>
    </div>
</template>

<style scoped>
#deposit .statValue {
    font-size: 14px;
}
#deposit .faded {
    opacity: 0.5
}
</style>