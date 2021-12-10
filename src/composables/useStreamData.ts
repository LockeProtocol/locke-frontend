import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import erc20 from '@/lib/abi/erc20-abi.json'

export default function useStreamData() {

    const { call } = useWeb3()
    const data = reactive({
        rewardToken: null as any,
        depositToken: null as any
    })
    const loaded = ref(false)

    async function load(address: string) {
        loaded.value = false;
        let results = await Promise.all([
            call(streamABI, [address, 'rewardToken']),
            call(streamABI, [address, 'depositToken']),
        ])
        let tokens = await Promise.all([
            getToken(results[0]),
            getToken(results[1])
        ])
        data.rewardToken = tokens[0],
        data.depositToken = tokens[1]
        loaded.value = true
    }

    async function getToken(token: string) {
        let results = await Promise.all([
            call(erc20, [token, 'decimals']),
            call(erc20, [token, 'symbol']),
            call(erc20, [token, 'name']),
        ])
        return {
            address: token,
            decimals: results[0],
            symbol: results[1],
            name: results[2]
        }
    }

    return {
        data,
        loaded,
        load
    }
}