<script setup>
import ConnectButton from '@/components/ConnectButton.vue'
import logo from '@/assets/images/locke-logo.svg'
import WalletSelect from '@/components/WalletSelect.vue'
</script>

<template>
    <div class="flex items-center justify-between" id="header">
        <div id="logo" class="ml-12"><img :src="logo"></div>
        <ConnectButton class="mr-12"/>
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