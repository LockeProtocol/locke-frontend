<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { parseUnits, formatUnits } from '@ethersproject/units'

function format(n: number): string {
    if (n == 0) return '0.00'
    let decimals = Math.max(2, Math.floor(Math.log10(n)) * -1 + 1)
    return n.toFixed(decimals)
}

// Props
const props = defineProps<{
  stream: StreamData
}>()

// Refs
const withdrawAmount = ref('')
const { sendTransaction } = useWeb3()

// Computed
const withdrawValueRaw = computed(() => {
    return parseUnits(withdrawAmount.value == '' ? '0' : withdrawAmount.value.toString(), props.stream.depositToken.decimals)
})

// Handlers
const handleWithdraw = async () => {
    let tx = await sendTransaction(
        props.stream.address,
        streamABI,
        'withdraw',
        [withdrawValueRaw.value]
    )
    withdrawAmount.value = ''
    await tx.wait()
}

const handleExit = async () => {
    let tx = await sendTransaction(
        props.stream.address,
        streamABI,
        'exit',
        []
    )
    await tx.wait()
}


</script>

<template>
    <div id="withdraw" class="p-8 flex flex-col">
        <h2>WITHDRAW {{stream.depositToken.symbol}}</h2>
        <input type="number" placeholder="0" class="textBox outline-none p-3 w-full mb-4" v-model="withdrawAmount"/>
        <div class="grid grid-cols-2 m-2 mb-6 gap-2">
            <p class="statLabel">Net Deposits:</p>
            <p class="statValue text-right">{{format(stream.userState?.netDeposits)}} {{stream.depositToken.symbol}}</p>
            <p class="statLabel">Tokens Streamed:</p>
            <p class="statValue text-right">{{format(stream.userState?.netDeposits - stream.userState?.tokens)}} {{stream.depositToken.symbol}}</p>
            <p class="statLabel">Tokens Withdrawable:</p>
            <p class="statValue text-right">{{format(stream.userState?.tokens)}} {{stream.depositToken.symbol}}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="w-full cursor-pointer actionButton" @click="handleWithdraw">WITHDRAW</div>
            <div class="w-full cursor-pointer actionButton" @click="handleExit">EXIT</div>
        </div>
    </div>
</template>

<style scoped>
#withdraw .statValue {
    font-size: 14px;
}
</style>