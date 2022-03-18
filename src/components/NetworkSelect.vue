<script lang="ts" setup>
import { config, networks, currentNetwork } from '@/lib/utils/config'
import { Dropdown, DropdownContent, DropdownItem } from '@/components/Dropdown'
import useWeb3 from '@/services/web3/useWeb3'

const { provider } = useWeb3()

async function networkChanged(newNetwork) {
    const shouldChange = currentNetwork.value != newNetwork
    currentNetwork.value = newNetwork
    if (shouldChange) {
        let p: any = provider.value
        if (p.request) {
            p.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${networks[newNetwork].chainId.toString(16)}`}],
            });
        }
    }
}

</script>
<template>
    <Dropdown @selectionChanged="networkChanged">
        <template #toggler>
            <div id="network-button" class="uppercase">{{config.networkName}}</div>
        </template>
        <DropdownContent>
            <DropdownItem 
                v-for="network in Object.keys(networks)" 
                :key="network" 
                :val="network"
                class="uppercase">
                {{networks[network].networkName}}
            </DropdownItem>
        </DropdownContent>
    </Dropdown>
    
</template>
<style scoped>
#network-button {
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
</style>