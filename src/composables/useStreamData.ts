import { reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'

export default function useStreamData(address: string) {

    const { call } = useWeb3()
    const state = reactive({
        loaded: false,
        rewardToken: '',
        depositToken: '',
    })

    async function fetchData() {
        state.loaded = false;
        let results = await Promise.all([
            call(streamABI, [address, 'rewardToken']),
            call(streamABI, [address, 'depositToken']),
        ])

        state.rewardToken = results[0]
        state.depositToken = results[1]
        state.loaded = true
    }
    fetchData();
    return state;
}