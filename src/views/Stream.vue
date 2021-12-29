<script setup>
import { computed, watchEffect, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import useStreamData from '@/composables/useStreamData'
import { DateTime } from 'luxon'
import useBlockNumber from '@/composables/useBlockNumber'
import Deposit from '@/components/Deposit.vue'
import Withdraw from '@/components/Withdraw.vue'
import ClaimReward from '@/components/ClaimReward.vue'
import Chart from '@/components/Chart.vue'

const { account, chainId } = useWeb3()
const { blockNumber } = useBlockNumber()
const connected = computed(() => !!account.value && chainId.value == 99)
const { data: stream, load: loadStream, loaded, getTVLHistory } = useStreamData('0x5454bd26C0A5a0aA77f06bbA7E35012b94C5B89a')

// Helpers

function formatDate(unixTimestamp) {
    return DateTime.fromSeconds(unixTimestamp)
        .toLocaleString(DateTime.DATETIME_SHORT)
}

// Refs

const depositTabActive = ref(true)

// Computed

const streamStart = computed(() => formatDate(stream.streamParams.startTime))
const streamEnd = computed(() => formatDate(stream.streamParams.startTime + stream.streamParams.streamDuration))
const totalReward = computed(() => stream.tokenAmounts.rewardTokenAmount.toLocaleString())
const totalDeposited = computed(() => stream.tokenAmounts.depositTokenAmount.toLocaleString())
const streamType = computed(() => stream.isSale ? "Sale" : "Rental")

// Effects

watchEffect(() => connected.value && blockNumber.value && loadStream())

</script>

<template>
    <div class="py-10 mx-5 lg:mx-auto lg:container lg:max-w-screen-lg"  v-if="connected && loaded">
        <div class="grid grid-cols-1 lg:grid-cols-2">
            <div class="flex flex-col">
                <h2>{{stream.depositToken.symbol}} / {{stream.rewardToken.symbol}}</h2>
                <p class="mb-12">Deposit {{stream.depositToken.symbol}} to earn {{stream.rewardToken.symbol}} over time. Rewards are earned continuously and distributed pro rata to all depositors.</p>
                <div class="roundedBox py-4">
                    <div class="grid grid-cols-2" id="statsBox">
                        <div>
                            <div class="statLabel">Deposit Token</div>
                            <div class="cursor-pointer statValue">{{stream.depositToken.symbol}} →</div>
                        </div>
                        <div>
                            <div class="statLabel">Reward Token</div>
                            <div class="cursor-pointer statValue">{{stream.rewardToken.symbol}} →</div>
                        </div>
                        <div>
                            <div class="statLabel">Total Reward</div>
                            <div class="statValue">{{totalReward}} {{stream.rewardToken.symbol}}</div>
                        </div>
                        <div>
                            <div class="statLabel">Stream Type</div>
                            <div class="statValue">{{streamType}}</div>
                        </div>
                        <div>
                            <div class="statLabel">Stream Start</div>
                            <div class="statValue">{{streamStart}}</div>
                        </div>
                        <div>
                            <div class="statLabel">Stream End</div>
                            <div class="statValue">{{streamEnd}}</div>
                        </div>
                    </div>
                </div>
                <div class="roundedBox flex flex-col my-12 overflow-hidden">
                    <div class="p-4">
                        <div class="statLabel">Total Value Deposited</div>
                        <div class="statValue">{{totalDeposited}} {{stream.depositToken.symbol}}</div>
                    </div>
                    <Chart :stream="stream"/>
                </div>
            </div>
            <div class="flex flex-col gap-10 lg:px-12">
                <div class="roundedBox">
                    <div class="grid grid-cols-2">
                        <div 
                            class="text-center py-4 cursor-pointer tab rounded-tl" 
                            :class="{tabInactive: !depositTabActive}"
                            @click="depositTabActive = true">
                            DEPOSIT
                        </div>
                        <div 
                            class="text-center py-4 cursor-pointer tab rounded-tr" 
                            :class="{tabInactive: depositTabActive}"
                            @click="depositTabActive = false">
                            WITHDRAW
                        </div>
                    </div>
                    <Deposit v-show="depositTabActive" :stream="stream"/>
                    <Withdraw v-show="!depositTabActive" :stream="stream"/>
                </div>
                <div class="roundedBox">
                    <ClaimReward :stream="stream"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.roundedBox {
  border-radius: 8px;
  background: #ffffff10;
}

.tab {
  font-family: VCR
}

.tab:hover {
  color: #fff;
}

.tabInactive {
  background: #ffffff10;
}

#statsBox > div {
  padding: 20px;
}

</style>