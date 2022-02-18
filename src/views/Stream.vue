<script setup>
import { computed, watchEffect, watch, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import useStreamData from '@/composables/useStreamData'
import { DateTime } from 'luxon'
import useBlockNumber from '@/composables/useBlockNumber'
import { useRoute } from 'vue-router'
import config from '@/lib/utils/config'
import Deposit from '@/components/Deposit.vue'
import Withdraw from '@/components/Withdraw.vue'
import ClaimReward from '@/components/ClaimReward.vue'
import ReclaimDeposit from '@/components/ReclaimDeposit.vue'
import Chart from '@/components/Chart.vue'
import PositionDetails from '@/components/PositionDetails.vue'
import StreamDetails from '@/components/StreamDetails.vue'
import TxHistory from '@/components/TxHistory.vue'
import NotConnected from '@/components/NotConnected.vue'
import WrongNetwork from '@/components/WrongNetwork.vue'
import Loading from '@/components/Loading.vue'

const { account, chainId, walletState } = useWeb3()
const { blockNumber } = useBlockNumber()
const connected = computed(() => !!account.value && chainId.value == config.chainId)
const route = useRoute()
const { data: stream, load: loadStream, loaded } = useStreamData(route.params.address)
const streamActive = computed(() => stream.streamParams.endStream > DateTime.now().toSeconds())

// Refs

const depositTabActive = ref(true)

// Effects

watchEffect(() => connected.value && loadStream())
watch(blockNumber, loadStream)

</script>

<template>
    <div>
        <NotConnected/>
        <WrongNetwork/>
        <div class="text-center mt-10" v-if="walletState=='connecting' || (connected && !loaded)">
            <Loading/>
        </div>
        <div class="py-10 mx-5 lg:mx-auto lg:container lg:max-w-screen-lg"  v-if="connected && loaded">
            <div class="grid grid-cols-1 lg:grid-cols-2">
                <div class="flex flex-col gap-10">
                    <h2>{{stream.depositToken.symbol}} / {{stream.rewardToken.symbol}}</h2>
                    <p>Deposit {{stream.depositToken.symbol}} to earn {{stream.rewardToken.symbol}} over time. 
                        Rewards are earned continuously and distributed pro-rata to all depositors. Deposits
                        are locked over time. Locked deposits can not be withdrawn.</p>
                    <StreamDetails :stream="stream"/>
                    <Chart :stream="stream"/>
                </div>
                <div class="flex flex-col gap-10 lg:px-12">
                    <div class="roundedBox" v-if="streamActive">
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
                    <div class="roundedBox" v-else-if="!stream.isSale">
                        <ReclaimDeposit :stream="stream"/>
                    </div>
                    <div class="roundedBox">
                        <ClaimReward :stream="stream"/>
                    </div>
                    <div class="roundedBox">
                        <PositionDetails :stream="stream"/>
                    </div>
                </div>
                <div class="lg:col-span-2">
                    <TxHistory :stream="stream"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.tab {
  font-family: VCR
}

.tab:hover {
  color: #fff;
}

.tabInactive {
  background: #ffffff10;
}

</style>