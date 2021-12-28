import { watch, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'

const blockNumber = ref(0)

export default function useBlockNumber() {
    const { provider, getProvider } = useWeb3()
    watch(provider, (newProvider, oldProvider) => {
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