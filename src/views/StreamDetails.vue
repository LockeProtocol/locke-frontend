<script setup>
import { computed, watchEffect } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import useStreamData from '@/composables/useStreamData'

const { account, connectWallet, chainId } = useWeb3()
const connected = computed(() => !!account.value && chainId.value == 99)
const { data: stream, load: loadStream} = useStreamData()

watchEffect(() => connected.value && loadStream('0xF563BF6f68b8657165259a365c8c26f94e1b8df5'))
</script>

<template>
    <div>
        <div v-if="connected">
            <p>Account: {{ account }}</p>
            <div>
                <p>Reward Token: {{ stream.rewardToken?.address }}</p>
                <p>Decimals: {{ stream.depositToken?.decimals }}</p>
                <p>Symbol: {{ stream.depositToken?.symbol }}</p>
                <p>Name: {{ stream.depositToken?.name }}</p>
                <p>Deposit Token: {{ stream.depositToken?.address }}</p>
                <p>Decimals: {{ stream.rewardToken?.decimals }}</p>
                <p>Symbol: {{ stream.rewardToken?.symbol }}</p>
                <p>Name: {{ stream.rewardToken?.name }}</p>
            </div>
        </div>
        <div v-else>
            <p>Not connected.</p>
            <p><button @click="connectWallet('metamask')">Connect</button></p>
        </div>
    </div>
</template>