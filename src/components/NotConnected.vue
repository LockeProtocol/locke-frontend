<script setup>
import useWeb3 from '@/services/web3/useWeb3'

const { isWalletSelectVisible, walletState, account } = useWeb3()
</script>

<template>
    <div class="w-96 roundedBox mx-auto mt-10 p-8" v-if="walletState=='disconnected' || (walletState=='connected' && !account)">
        <h2>NOT CONNECTED</h2>
        <p>Please connect your wallet to continue.</p>
        <p>{{walletState}}</p>
        <div class="actionButton mt-10 cursor-pointer" @click="isWalletSelectVisible=true">CONNECT</div>
    </div>
</template>