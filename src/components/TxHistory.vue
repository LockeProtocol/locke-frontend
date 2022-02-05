<script lang="ts" setup>
import { watch, computed, ref } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import useChartData from '@/composables/useChartData'
import useBlockNumber from '@/composables/useBlockNumber'
import useWeb3 from '@/services/web3/useWeb3'
import { formatAddress, roundBN } from '@/lib/utils/format'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { DateTime } from 'luxon'
import _ from 'lodash'

// Props
const props = defineProps<{
  stream: StreamData
}>()

// Refs
const { loadEvents, streamEvents } = useChartData()
const { blockNumber } = useBlockNumber()
const { account } = useWeb3()
const page = ref(0)
const filter = ref(false)

// Computed
const filteredEvents = computed(() => _(streamEvents.value)
    .filter((e) => !filter.value || e.account == account.value)
    .value()
)
const resultsPerPage = 10
const events = computed(() => _(filteredEvents.value)
    .orderBy('timestamp', 'desc')
    .drop(page.value * resultsPerPage)
    .take(resultsPerPage)
    .value()
)
const showNext = computed(() => {
    return (page.value * resultsPerPage + resultsPerPage) < (filteredEvents.value?.length ?? 0)
})
const showPrev = computed(() => {
    return page.value > 0
})

// Watchers
loadEvents(props.stream)
watch(blockNumber, () => { loadEvents(props.stream) })
</script>

<template>
    <div class="mt-8">
        <div class="text-right">
            <span @click="filter=!filter" class="statLabel cursor-pointer">
                {{filter ? 'Show All' : 'Show Mine'}}
            </span>
        </div>
        <div v-for="event in events" :key="event.txhash" class="grid grid-cols-2 gap-2 md:flex md:flex-row p-4 row my-3 md:items-center">
            <div style="flex-basis: 20%">
                <div class="statLabel">Date</div>
                <div class="stat-value-small">
                    {{DateTime.fromSeconds(event.timestamp).toFormat("LLL-dd HH:mm:ss").toUpperCase()}}
                </div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Transaction</div>
                <div class="stat-value-small">
                    {{event.txhash.substr(0,14).toUpperCase()}}… →
                </div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Action</div>
                <div class="stat-value-small" :class="event.action">
                    {{event.action.toUpperCase()}}
                </div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Amount</div>
                <div class="stat-value-small" :class="event.action">
                    {{roundBN(formatUnits(event.amount, stream.depositToken.decimals))}}
                </div>
            </div>
            <div  class="hidden md:block" style="flex-basis: 20%">
                <div class="statLabel">User</div>
                <div class="stat-value-small">
                    {{formatAddress(event.account)}} →
                </div>
            </div>
        </div>
        <div class="text-right">
            <span class="cursor-pointer statValue p-2" @click="page--" v-show="showPrev">←</span>
            <span class="cursor-pointer statValue p-2" @click="page++" v-show="showNext">→</span>
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