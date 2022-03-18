<script setup>
import ConnectButton from '@/components/ConnectButton.vue'
import logo from '@/assets/images/locke-logo.svg'
import WalletSelect from '@/components/WalletSelect.vue'
import NetworkSelect from '@/components/NetworkSelect.vue'
</script>

<template>
    <div class="flex items-center justify-between" id="header">
        <div id="logo" class="ml-12"><img :src="logo"></div>
        <div class="flex flex-row gap-2 mr-12">
          <NetworkSelect/>
          <ConnectButton/>
        </div>
    </div>
    <WalletSelect/>
</template>

<style scoped>
#header {
  height: 72px;
  border-bottom: 1px solid rgb(28,28,34);
}

#logo {
  font-family: VCR;
  color: #fff;
}
</style>