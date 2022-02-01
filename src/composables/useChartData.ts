import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { Contract } from '@ethersproject/contracts'
import _ from 'lodash'
import { BigNumber } from '@ethersproject/bignumber'

export default function useChartData() {

    const tvlHistory = ref<any[]>()
    const priceHistory = ref<any[]>()
    const historyLoaded = ref(false)
    const { getProvider } = useWeb3()

    async function loadHistory(stream) {
        historyLoaded.value = false
        let events = await getStreamEvents(stream)

        let streamStart = stream.streamParams.startTime
        let streamDuration = stream.streamParams.streamDuration
        let streamEnd = streamStart + streamDuration
        let totalRewards = stream.tokenAmounts.rewardTokenAmount

        let history = _.reduce(events, (agg, event) => {
            
            // Values as of last event
            let prevTimestamp = agg[agg.length-1]?.timestamp ?? event.timestamp
            let prevTVL = agg[agg.length-1]?.tvl ?? 0
            let prevStreamed = agg[agg.length-1]?.streamed ?? 0

            // Calculate streaming speed since last event
            let elapsedTime = Math.max(0, event.timestamp - Math.max(streamStart, prevTimestamp))
            let remainingTime = streamEnd - Math.max(streamStart, prevTimestamp)
            let fractionStreamed = elapsedTime / remainingTime
            
            // This event
            let amount = event.amount / (10 ** stream.depositToken.decimals)

            agg.push({
                timestamp: event.timestamp,
                tvl: prevTVL + amount,
                streamed: prevStreamed + ((prevTVL - prevStreamed) * fractionStreamed),
                rewardsOwed: totalRewards * (Math.max(0, event.timestamp - streamStart) / streamDuration)
            })

            return agg
        }, [])
        tvlHistory.value = history.map((h) => ({
            date: new Date(h.timestamp * 1000),
            value: h.tvl
        }))
        priceHistory.value = history.map((h) => ({
            date: new Date(h.timestamp * 1000),
            value: (h.tvl - h.streamed) / (totalRewards - h.rewardsOwed)
        }))
        historyLoaded.value = true

        // TODO: This is a hack until we can get streamed 
        // amounts from the smart contract
        /*stream.depositTokenUnstreamed = */console.log('depositTokenUnstreamed',(
            history[history.length - 1]?.tvl ?? 0) - 
            (history[history.length - 1]?.streamed ?? 0))
        /*stream.rewardTokenRemaining = */console.log('rewardTokenRemaining',totalRewards - (history[history.length - 1]?.rewardsOwed ?? 0))
    }

    async function getStreamEvents(stream) {
        let contract = new Contract(stream.address, streamABI, getProvider())
        let withdrawFilter = contract.filters.Withdrawn()
        let stakeFilter = contract.filters.Staked()
        let result = await Promise.all([
            contract.queryFilter(withdrawFilter),
            contract.queryFilter(stakeFilter)
        ])
        let withdraws = await Promise.all(result[0].map(async (w) => ({
            amount: w.args?.amount.mul(BigNumber.from(-1)),
            timestamp: (await w.getBlock()).timestamp
        })))
        let stakes = await Promise.all(result[1].map(async (s) => ({
            amount: s.args?.amount,
            timestamp: (await s.getBlock()).timestamp
        })))
        let events = _.orderBy(withdraws.concat(stakes), 'timestamp')
        events.push({
            amount: 0,
            timestamp: new Date().getTime() / 1000
        })
        return events
    }

    return {
        loadHistory,
        tvlHistory,
        priceHistory,
        historyLoaded,
    }
}