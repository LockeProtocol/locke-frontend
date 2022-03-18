import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamFactoryABI from '@/lib/abi/streamfactory-abi.json'
import { Contract } from '@ethersproject/contracts'
import _ from 'lodash'
import { BigNumber } from '@ethersproject/bignumber'
import useStreamData from '@/composables/useStreamData'
import { config } from '@/lib/utils/config'

export default function useStreamList() {

    const data = ref<any[]>()
    const loaded = ref(false)
    const { account, call, getProvider } = useWeb3()

    async function load() {

        loaded.value = false
        let contract = new Contract(config.value.factory, streamFactoryABI, getProvider())
        let streamCreatedFilter = contract.filters.StreamCreated()
        let streamCreated = await contract.queryFilter(streamCreatedFilter)
        let streams = streamCreated.map((s) => s.args?.stream_addr)
        data.value = await Promise.all(streams.map(async (s) => {
            const { data: stream, load } = useStreamData(s, {account, call, getProvider})
            await load()
            return stream
        }))
        loaded.value = true
    }

    return {
        data,
        loaded,
        load
    }


}