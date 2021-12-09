import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'

export default function useStreamData() {

    const { call } = useWeb3()
    const data = reactive({
        rewardToken: null,
        depositToken: null
    })
    const loaded = ref(false)

    async function load(address: string) {
        loaded.value = false;
        let results = await Promise.all([
            call(streamABI, [address, 'rewardToken']),
            call(streamABI, [address, 'depositToken']),
        ])

        data.rewardToken = results[0],
        data.depositToken = results[1]
        loaded.value = true
    }
    return {
        data,
        loaded,
        load
    }
}