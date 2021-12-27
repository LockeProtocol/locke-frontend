import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import erc20 from '@/lib/abi/erc20-abi.json'

export type StreamData = {
    rewardToken: any,
    depositToken: any,
    streamParams: any,
    feeParams: any,
    tokenAmounts: any
}

export default function useStreamData(address: string) {

    const { call } = useWeb3()
    const data = reactive<StreamData>({
        rewardToken: {},
        depositToken: {},
        streamParams: {},
        feeParams: {},
        tokenAmounts: {}
    })
    const loaded = ref(false)

    async function load() {
        loaded.value = false;
        let results = await Promise.all([
            call(streamABI, [address, 'rewardToken']),
            call(streamABI, [address, 'depositToken']),
            call(streamABI, [address, 'streamParams']),
            call(streamABI, [address, 'feeParams']),
            call(streamABI, [address, 'tokenAmounts'])
        ])

        data.streamParams

        let tokens = await Promise.all([
            getToken(results[0]),
            getToken(results[1])
        ])

        data.rewardToken = tokens[0],
        data.depositToken = tokens[1],
        data.streamParams = {
            startTime: results[2][0],
            streamDuration: results[2][1],
            depositLockDuration: results[2][2],
            rewardLockDuration: results[2][3]
        }
        data.feeParams = {
            feePercent: results[3][0],
            feeEnabled: results[3][1]
        }
        data.tokenAmounts = {
            rewardTokenAmount: results[4][0] / (10 ** data.rewardToken.decimals),
            depositTokenAmount: results[4][1] / (10 ** data.depositToken.decimals),
            rewardTokenFeeAmount: results[4][2],
            depositTokenFeeAmount: results[4][3]
        }
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