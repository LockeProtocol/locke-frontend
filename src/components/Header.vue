<script setup>
import ConnectButton from '@/components/ConnectButton.vue'
</script>

<template>
    <div class="flex items-center justify-between" id="header">
        <div id="logo" class="ml-12">LOCKE</div>
        <ConnectButton class="mr-12"/>
    </div>
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