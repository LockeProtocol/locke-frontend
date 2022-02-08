<script lang="ts" setup>
import { computed, watchEffect } from 'vue'
import { DateTime, Duration } from 'luxon'
import _ from 'lodash'
import useStreamList from '@/composables/useStreamList'
import useWeb3 from '@/services/web3/useWeb3'
import { useRouter } from 'vue-router'
import NotConnected from '@/components/NotConnected.vue'
import WrongNetwork from '@/components/WrongNetwork.vue'
import Loading from '@/components/Loading.vue'
import { format, humanDuration } from '@/lib/utils/format'
import config from '@/lib/utils/config'

const { account, chainId, walletState } = useWeb3()
const router = useRouter()
const { data: streamList, loaded, load } = useStreamList(config.factory)
const connected = computed(() => !!account.value && chainId.value == config.chainId)
const streams = computed(() => _.orderBy((streamList.value ?? []), ['streamParams.endStream'], ['desc']))

function getStreamStatus(stream) {
    return DateTime.now().toSeconds() > stream.streamParams.endStream ? 'completed' 
        : DateTime.now().toSeconds() > stream.streamParams.startTime ? 'active' 
        : 'upcoming'
}

function getDepositLockDuration(stream) {
    if (stream.isSale) return '∞'
    let seconds = stream.streamParams.endDepositLock - stream.streamParams.endStream;
    if (seconds == 0) return '--'
    let duration = Duration.fromObject({seconds: seconds})
    return humanDuration(duration).toUpperCase()
}

watchEffect(() => connected.value && load())
</script>

<template>
    <div>
        <NotConnected/>
        <WrongNetwork/>
        <div class="text-center mt-10" v-if="walletState=='connecting' || (connected && !loaded)">
            <Loading/>
        </div>
        <div class="py-10 mx-5 lg:mx-auto lg:container lg:max-w-screen-lg" v-if="connected && loaded">
            <div class="flex flex-row p-4 my-4 justify-end gap-4">
                <div class="dropdown">SORT</div>
                <div class="dropdown">FILTER</div>
            </div>
            <div v-for="stream in streams" :key="stream" class="flex flex-row p-4 row cursor-pointer my-4" @click="router.push({name: 'Stream', params: {address: stream.address}})">
                <div style="flex-basis: 20%">
                    <div class="statLabel">Reward / Deposit Token</div>
                    <div class="statValue">{{stream.rewardToken.symbol}} / {{stream.depositToken.symbol}}</div>
                    <div :class="['status', getStreamStatus(stream)]">{{getStreamStatus(stream).toUpperCase()}}</div>
                </div>
                <div style="flex-basis: 20%">
                    <div class="statLabel">Reward</div>
                    <div class="statValue">{{format(stream.tokenAmounts.rewardTokenAmount)}} {{stream.rewardToken.symbol}}</div>
                </div>
                <div style="flex-basis: 20%">
                    <div class="statLabel">TVL</div>
                    <div class="statValue">{{format(stream.tokenAmounts.depositTokenAmount)}} {{stream.depositToken.symbol}}</div>
                </div>
                <div style="flex-basis: 20%">
                    <div class="statLabel">Lock Duration</div>
                    <div class="statValue">{{getDepositLockDuration(stream)}}</div>
                </div>
                <div style="flex-basis: 20%">
                    <div class="statLabel">Stream Start / End</div>
                    <div class="statValue small">{{DateTime.fromSeconds(stream.streamParams.startTime).toLocaleString(DateTime.DATETIME_SHORT)}} -</div>
                    <div class="statValue small">{{DateTime.fromSeconds(stream.streamParams.endStream).toLocaleString(DateTime.DATETIME_SHORT)}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.status {
    font-family: VCR;
    font-size: 10px;
    border-radius: 4px;
    display: inline-block;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 2px;
    margin-top: 5px;
}

.dropdown {
    text-align: center;
    width: 100px;
    font-family: VCR;
    border: 1px solid #ffffff80;
    border-radius: 4px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 2px;

}

.status.active, .status.upcoming {
    border: 1px solid  rgba(46, 186, 198, 0.5);
    background: rgba(46, 186, 198, 0.08);
}

/* .status.upcoming {
    border: 1px solid  rgba(227, 150, 82, 0.5);
    background: rgba(227, 150, 82, 0.08);
} */

.status.completed {
    border: 1px solid #ffffff80;
    background:#ffffff10;
}

.row {
    border-radius: 8px;
    background: #ffffff10;
    transition: 0.3s;
}

.row:hover {
    background: #007CF980;
}

.statValue.small {
    font-size: 12px;
}
</style>