<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { DateTime } from 'luxon'
import { format } from '@/lib/utils/format'
import VueCountdown from '@chenfengyuan/vue-countdown';
import ErrorBox from '@/components/ErrorBox.vue'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { roundBN } from '@/lib/utils/format'
import useAllowance from '@/composables/useAllowance'
import useBlockNumber from '@/composables/useBlockNumber'

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
const withdrawAmount = ref('')
const withdrawing = ref(false)
const errorText = ref('')
const { sendTransaction } = useWeb3()
const { blockNumber } = useBlockNumber()
const { balance, 
    loaded, 
    load, 
 } = useAllowance(props.stream.address, props.stream.address)

// Computed
const isDepositReclaimable = computed(() => secondsRemaining.value <= 0)
const secondsRemaining = computed(() => {
    return Math.max(0,props.stream.streamParams.endDepositLock
        - DateTime.now().toSeconds())
})
const withdrawValueRaw = computed(() => {
    return parseUnits(withdrawAmount.value == '' ? '0' : withdrawAmount.value.toString(), props.stream.depositToken.decimals)
})
const maxDisplay = computed(() => {
    return roundBN(formatUnits(balance.value, props.stream.depositToken.decimals))
})

// Handlers
const handleReclaim = async () => {
    try {
        withdrawing.value = true
        let tx = await sendTransaction(
            props.stream.address,
            streamABI,
            'claimDepositTokens',
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

const handleMax = () => {
    withdrawAmount.value = formatUnits(balance.value, props.stream.depositToken.decimals)
}

watchEffect(() => blockNumber.value && load())
</script>

<template>
    <div id="reclaim-deposit" class="mx-auto p-8 flex flex-col">
        <h2 class="label">RECLAIM {{stream.depositToken.symbol}}</h2>
        <input type="number" placeholder="0" class="textBox outline-none p-3 w-full" v-model="withdrawAmount"/>
        <p class="statValue text-right mt-2 mb-4"><span class="cursor-pointer" @click="handleMax">Max: {{maxDisplay}}</span></p>
        <div class="w-full cursor-pointer actionButton" @click="handleReclaim" v-if="isDepositReclaimable">RECLAIM</div>
        <div class="w-full cursor-not-allowed actionButton buttonDisabled" v-else>
            <vue-countdown :time="secondsRemaining * 1000" :transform="transformSlotProps" v-slot="{ days, hours, minutes, seconds }">
                {{ days }}:{{ hours }}:{{ minutes }}:{{ seconds }} REMAINING
            </vue-countdown> 
        </div>
        <ErrorBox :msg="errorText" @dismissed="errorText=''"/>
    </div>
</template>

<style scoped>
#reclaim-deposit .statValue {
    font-size: 14px;
}

.buttonDisabled {
    background: #ffffff10;
}
</style>