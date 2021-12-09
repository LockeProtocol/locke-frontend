<script setup>
import { computed, watchEffect } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import useTokenData from '@/composables/useTokenData'
import useStreamData from '@/composables/useStreamData'

const { account, connectWallet } = useWeb3()
const connected = computed(() => !!account.value)
const { data: stream, load: loadStream} = useStreamData()
const { data: rewardToken, load: loadRewardToken } = useTokenData()
const { data: depositToken, load: loadDepositToken } = useTokenData()

watchEffect(() => connected.value && loadStream('0xD5f5575d6a395316795100B3D67935088DFf63c3'))
watchEffect(() => stream.rewardToken && loadRewardToken(stream.rewardToken))
watchEffect(() => stream.depositToken && loadDepositToken(stream.depositToken))

</script>

<template>
    <div>
        <div v-if="connected">
            <p>Account: {{ account }}</p>
            <div>
                <p>Reward Token: {{ stream.rewardToken }}</p>
                <p>Deposit Token: {{ stream.depositToken }}</p>
            </div>
            <div>
                <p>DepositToken Balance: {{ depositToken.balance }}</p>
                <p>Decimals: {{ depositToken.decimals }}</p>
                <p>Symbol: {{ depositToken.symbol }}</p>
                <p>Name: {{ depositToken.name }}</p>
            </div>
            <div>
                <p>RewardToken Balance: {{ rewardToken.balance }}</p>
                <p>Decimals: {{ rewardToken.decimals }}</p>
                <p>Symbol: {{ rewardToken.symbol }}</p>
                <p>Name: {{ rewardToken.name }}</p>
            </div>
        </div>
        <div v-else>
            <p>Not connected.</p>
            <p><button @click="connectWallet('metamask')">Connect</button></p>
        </div>
    </div>
</template>