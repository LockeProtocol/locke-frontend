<script setup>
import { computed } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'

const {account, connectWallet, chainId } = useWeb3()

// Computed Propertied
const connected = computed(() => !!account.value && chainId.value == 10243)
const connectBtnText = computed(() => {
    const address = account.value.toString()
    if (connected.value && address && address.length === 42) {
        const str1 = String(address).slice(2, 6).toUpperCase();
        const str2 = String(address).slice(address.length - 4, address.length).toUpperCase();
        return `0x${str1}...${str2}`;
    } else {
        return "CONNECT WALLET"
    }
})

// Methods
function handleConnect() {
    if (!connected.value) {
        connectWallet('metamask')
    }
}

</script>

<template>
  <div role="button" id="wallet-button" @click="handleConnect">
    <div v-if="connected" id="dot"></div>
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
  background: rgb(22, 206, 185)
}
</style>