<script lang="ts" setup>
import { computed, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import config from '@/lib/utils/config'
const { connectWallet, isWalletSelectVisible } = useWeb3()

function selectWallet(wallet) {
  connectWallet(wallet)
  isWalletSelectVisible.value = false;
}
</script>

<template>
  <div v-if="isWalletSelectVisible" @click="isWalletSelectVisible=false" class="fixed top-0 left-0 w-screen h-screen z-10 flex items-center justify-center" style="background: #000000C0;">
    <div class="modal w-96 drop-shadow-xl rounded-lg p-4" @click.stop>
      <div @click="selectWallet('metamask')" class="p-4 m-2 rounded-lg modal-item h-20">
        <div>
          <img width="50" height="50" src="../assets/images/connectors/metamask.svg"/>
        </div>
        <div>Metamask</div>
      </div>
      <div @click="selectWallet('walletconnect')" class="p-4 m-2 rounded-lg modal-item h-20">
        <div>
          <img width="50" height="50" src="../assets/images/connectors/walletconnect.svg"/>
        </div>
        <div>Wallet Connect</div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal {
  background: #101010;
}
.modal-item {
  background: #ffffff10;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  gap: 12px;
}
</style>