import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { Contract } from '@ethersproject/contracts'
import _ from 'lodash'
import { BigNumber } from '@ethersproject/bignumber'

export default function useChartData() {

    const tvlHistory = ref<Object[]>()
    const tvlHistoryLoaded = ref(false)
    const { getProvider } = useWeb3()

    async function loadTVLHistory(stream) {
        tvlHistoryLoaded.value = false
        let contract = new Contract(stream.address, streamABI, getProvider())
        let withdrawFilter = contract.filters.Withdrawn()
        let stakeFilter = contract.filters.Staked()
        let result = await Promise.all([
            contract.queryFilter(withdrawFilter),
            contract.queryFilter(stakeFilter)
        ])
        let withdraws = result[0].map((w) => ({
            amount: w.args?.amount.mul(BigNumber.from(-1)),
            block: w.blockNumber
        }))
        let stakes = result[1].map((s) => ({
            amount: s.args?.amount,
            block: s.blockNumber
        }))
        let events = _.orderBy(withdraws.concat(stakes), 'block')

        console.log(events)
        let history = _.reduce(events, (ctvl, event) => {
            console.log(ctvl)
            ctvl.push({
                block: event.block,
                tvl: ctvl.length > 0 ? ctvl[ctvl.length-1].tvl.add(event.amount) : event.amount
            })
            return ctvl
        }, [] )
        console.log(history)
        tvlHistory.value = history.map((h) => ({
            date: h.block,
            tvl: h.tvl / (10 ** stream.depositToken.decimals)
        }))
        tvlHistoryLoaded.value = true
    }

    return {
        loadTVLHistory,
        tvlHistory,
        tvlHistoryLoaded,
    }
}