<script setup>
import { computed } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import useTokenData from '@/composables/useTokenData'
import useStreamData from '@/composables/useStreamData'

const { account, connectWallet } = useWeb3()
const connected = computed(() => !!account.value)
const stream = computed(() => connected.value ? useStreamData('0xD5f5575d6a395316795100B3D67935088DFf63c3') : null)
const depositToken = computed(() => stream.value?.loaded ? useTokenData(stream.value.depositToken) : null)
const rewardToken = computed(() => stream.value?.loaded ? useTokenData(stream.value.rewardToken) : null)

</script>

<template>
    <div>
        <div v-if="connected">
            <p>Account: {{ account }}</p>
            <div v-if="stream?.loaded">
                <p>Reward Token: {{ stream.rewardToken }}</p>
                <p>Deposit Token: {{ stream.depositToken }}</p>
            </div>
            <div v-if="depositToken?.loaded">
                <p>DepositToken Balance: {{ depositToken.balance }}</p>
                <p>Decimals: {{ depositToken.decimals }}</p>
                <p>Symbol: {{ depositToken.symbol }}</p>
                <p>Name: {{ depositToken.name }}</p>
            </div>
            <div v-if="rewardToken?.loaded">
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