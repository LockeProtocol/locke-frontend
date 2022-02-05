import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import { Contract } from '@ethersproject/contracts'
import _ from 'lodash'
import { BigNumber } from '@ethersproject/bignumber'

export default function useChartData() {

    const tvlHistory = ref<any[]>()
    const priceHistory = ref<any[]>()
    const streamEvents = ref<any[]>()
    const historyLoaded = ref(false)
    const eventsLoaded = ref(false)
    const { getProvider } = useWeb3()

    async function loadEvents(stream) {
        eventsLoaded.value = false
        let res = await getStreamEvents(stream)
        streamEvents.value = res
        eventsLoaded.value = true
    }

    async function loadHistory(stream) {
        historyLoaded.value = false
        let events = await getStreamEvents(stream)
        streamEvents.value = events

        events = _.filter(events, e => e.action == 'withdraw' || e.action == 'stake')
        events.push({
            amount: 0,
            timestamp: Math.min(new Date().getTime() / 1000,
                stream.streamParams.endStream - 1)
        })

        let streamStart = stream.streamParams.startTime
        let streamEnd = stream.streamParams.endStream
        let streamDuration = streamEnd - streamStart
        let totalRewards = stream.tokenAmounts.rewardTokenAmount

        let history = _.reduce(events, (agg, event) => {

            // Values as of last event
            let prevTimestamp = agg[agg.length - 1]?.timestamp ?? event.timestamp
            let prevTVL = agg[agg.length - 1]?.tvl ?? 0
            let prevStreamed = agg[agg.length - 1]?.streamed ?? 0

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
    }

    async function getStreamEvents(stream) {
        let contract = new Contract(stream.address, streamABI, getProvider())
        let withdrawFilter = contract.filters.Withdrawn()
        let stakeFilter = contract.filters.Staked()
        let claimFilter = contract.filters.RewardsClaimed()
        let result = await Promise.all([
            contract.queryFilter(withdrawFilter),
            contract.queryFilter(stakeFilter),
            contract.queryFilter(claimFilter)
        ])
        let withdraws = await Promise.all(result[0].map(async (w) => ({
            action: 'withdraw',
            account: w.args?.who,
            txhash: w.transactionHash,
            amount: w.args?.amount.mul(BigNumber.from(-1)),
            timestamp: (await w.getBlock()).timestamp,
        })))
        let stakes = await Promise.all(result[1].map(async (s) => ({
            action: 'stake',
            account: s.args?.who,
            txhash: s.transactionHash,
            amount: s.args?.amount,
            timestamp: (await s.getBlock()).timestamp
        })))
        let claims = await Promise.all(result[2].map(async (c) => ({
            action: 'claim',
            account: c.args?.who,
            txhash: c.transactionHash,
            amount: c.args?.amount,
            timestamp: (await c.getBlock()).timestamp
        })))
        let events = _.orderBy(withdraws.concat(stakes).concat(claims), 'timestamp')
        return events
    }

    return {
        loadHistory,
        loadEvents,
        streamEvents,
        tvlHistory,
        priceHistory,
        historyLoaded,
        eventsLoaded
    }
}