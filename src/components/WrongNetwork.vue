<script setup>
import useWeb3 from '@/services/web3/useWeb3'
import config from '@/lib/utils/config'

const { connectWallet, walletState, account, chainId } = useWeb3()
</script>

<template>
    <div class="w-96 roundedBox mx-auto p-8 mt-10" v-if="!!account && chainId != config.chainId">
        <h2>WRONG NETWORK</h2>
        <p>Please connect to {{config.networkName}}</p>
    </div>
</template>