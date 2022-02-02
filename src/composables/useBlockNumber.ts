import { watch, ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import _ from 'lodash'

const blockNumber = ref(0)
let listenerAttached = false;

export default function useBlockNumber() {
    const { provider, getProvider } = useWeb3()
    if (!listenerAttached && provider.value) {
        console.log('attaching block listener')
        provider.value.on('block', _.throttle((block) => {
            console.log('New Block', block)
            blockNumber.value = block
        }, 2000))
        listenerAttached = true;
    }
    watch(provider, (newProvider, oldProvider) => {
        console.log('provider changed')
        if (oldProvider) {
            oldProvider.off('block')
        }
        getProvider().on('block', _.throttle((block) => {
            console.log('New Block', block)
            blockNumber.value = block
        }, 2000))
        listenerAttached = true;
    })
    return {
        blockNumber
    }
}