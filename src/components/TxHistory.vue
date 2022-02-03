<script lang="ts" setup>
import { watch, computed } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useChartData from '@/composables/useChartData'
import useBlockNumber from '@/composables/useBlockNumber'
import { formatAddress, roundBN } from '@/lib/utils/format'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { DateTime } from 'luxon'
import _ from 'lodash'

// Props
const props = defineProps<{
  stream: StreamData
}>()


const { loadEvents, streamEvents } = useChartData()
const { blockNumber } = useBlockNumber()
const events = computed(() => _(streamEvents.value)
    .orderBy('timestamp', 'desc')
    .take(10)
    .value()
)

loadEvents(props.stream)
watch(blockNumber, () => { loadEvents(props.stream) })

</script>

<template>
    <div class="mt-8">
        <div v-for="event in events" :key="event.txhash" class="flex flex-row p-4 row my-3 items-center">
            <div style="flex-basis: 20%">
                <div class="statLabel">Date</div>
                <div class="stat-value-small">{{DateTime.fromSeconds(event.timestamp).toFormat("LLL-dd HH:mm:ss").toUpperCase()}}</div>
                
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">User</div>
                <div class="stat-value-small">{{formatAddress(event.account)}} →</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Action</div>
                <div class="stat-value-small" :class="event.action">{{event.action.toUpperCase()}}</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Amount</div>
                <div class="stat-value-small" :class="event.action">{{roundBN(formatUnits(event.amount, stream.depositToken.decimals))}}</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Transaction</div>
                <div class="stat-value-small">{{event.txhash.substr(0,14).toUpperCase()}}… →</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.row {
    border-radius: 4px;
    background: #ffffff10;
}

.stake {
    color: #43E0E4a0;
}

.withdraw {
    color: #E84142a0;
}
</style>