import { watch, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'

const blockNumber = ref(0)
let listenerAttached = false;

export default function useBlockNumber() {
    const { provider, getProvider } = useWeb3()
    if (!listenerAttached) {
        getProvider().on('block', (block) => {
            console.log('New Block', block)
            blockNumber.value = block
        })
        listenerAttached = true;
    }
    watch(provider, (newProvider, oldProvider) => {
        console.log('provider changed')
        if (oldProvider) {
            oldProvider.off('block')
        }
        getProvider().on('block', (block) => {
            console.log('New Block', block)
            blockNumber.value = block
        })
    })
    return {
        blockNumber
    }
}