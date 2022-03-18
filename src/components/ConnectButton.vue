<script setup>
import { computed, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import config from '@/lib/utils/config'

const {account, disconnectWallet, chainId, isWalletSelectVisible } = useWeb3()
const modalVisible = ref(false)

// Computed Propertied
const connected = computed(() => !!account.value && chainId.value == config.chainId)
const connectBtnText = computed(() => {
    const address = account.value.toString()
    if (address && address.length === 42) {
        const str1 = String(address).slice(2, 6).toUpperCase();
        const str2 = String(address).slice(address.length - 4, address.length).toUpperCase();
        return `0x${str1}…${str2}`;
    } else {
        return "CONNECT WALLET"
    }
})

// Methods
function handleConnect() {
    if (!account.value) {
        isWalletSelectVisible.value = true
    } else {
      console.log('disconnecting')
      disconnectWallet()
    }
}

</script>

<template>
  <div role="button" id="wallet-button" @click="handleConnect">
    <div v-if="connected" id="dot"></div>
    <div v-if="account && !connected" id="reddot"></div>
    {{ connectBtnText }}
  </div>
</template>

<style scoped>
#wallet-button {
  font-family: VCR;
  font-style: normal;
  font-size: 14px;
  background: rgb(18, 18, 24);
  display: flex;
  align-items: center;
  cursor: pointer;
  height: fit-content;
  border-radius: 8px;
  padding:12px 20px 12px 20px;
  color: #fff
}
#dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
  background: #43E0E4;
}
#reddot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  margin-right: 8px;
  background: #E84142;
}

</style>