import { watch, ref, computed } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import _ from 'lodash'

const blockNumber = ref(0)
let listenerAttached = false;
let web3Provider = null as any;

export default function useBlockNumber() {

    const updateBlock = _.throttle((block) => {
        if (listenerAttached) {
            console.log('New Block', block)
            blockNumber.value = block
        }
    }, 2000)

    const { provider, getProvider } = useWeb3()

    if (!listenerAttached && provider.value) {
        listenerAttached = true;
        web3Provider = getProvider()
        web3Provider.on('block', updateBlock)
    }
    watch(provider, (newProvider, oldProvider) => {
        if (web3Provider) {
            web3Provider.removeAllListeners('block')
            web3Provider = null
            listenerAttached = false;
        }
        if (newProvider && !listenerAttached) {
            listenerAttached = true;
            web3Provider = getProvider()
            web3Provider.on('block', updateBlock)
        }
    })
    return {
        blockNumber
    }
}