import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import streamABI from '@/lib/abi/stream-abi.json'
import lensABI from '@/lib/abi/lockelens-abi.json'
import erc20 from '@/lib/abi/erc20-abi.json'
import { Contract } from '@ethersproject/contracts'
import _ from 'lodash'
import { BigNumber } from '@ethersproject/bignumber'

export type StreamData = {
    address: any,
    rewardToken: any,
    depositToken: any,
    streamParams: any,
    feeParams: any,
    tokenAmounts: any,
    isSale: any,
    userState: any,
    depositTokenUnstreamed: any,
    rewardTokenRemaining: any
}

export default function useStreamData(address: string) {

    const lensAddress = '0x99f287AFDd1FE84779714E6E9117eCEf1D075EF8'
    const { account, call, getProvider } = useWeb3()
    const data = reactive<StreamData>({
        address: '',
        rewardToken: {},
        depositToken: {},
        streamParams: {},
        feeParams: {},
        tokenAmounts: {},
        isSale: false,
        userState: {},
        depositTokenUnstreamed: 0,
        rewardTokenRemaining: 0
    })
    const loaded = ref(false)

    async function load() {
        let user = account.value
        let results = await Promise.all([
            call(streamABI, [address, 'rewardToken']),
            call(streamABI, [address, 'depositToken']),
            call(streamABI, [address, 'streamParams']),
            call(streamABI, [address, 'feeParams']),
            call(streamABI, [address, 'tokenAmounts']),
            call(streamABI, [address, 'isIndefinite']),
            call(streamABI, [address, 'tokenStreamForAccount(address)', [user]]),
            call(streamABI, [address, 'getEarned', [user]]),
            getNetDeposits(user),
            call(lensABI, [lensAddress, 'rewardsRemainingToAllocate(address)', [address]]),
            call(lensABI, [lensAddress, 'currUnstreamed(address)', [address]]),
            call(lensABI, [lensAddress, 'currDepositTokensNotYetStreamed(address,address)', [address, user]]),
            getRewardsClaimed(user)
        ])

        let tokens = await Promise.all([
            getToken(results[0]),
            getToken(results[1])
        ])

        data.address = address
        data.rewardToken = tokens[0],
        data.depositToken = tokens[1],
        data.streamParams = {
            startTime: results[2][0],
            endStream: results[2][1],
            endDepositLock: results[2][2],
            endRewardLock: results[2][3]
        }
        data.feeParams = {
            feePercent: results[3][0],
            feeEnabled: results[3][1]
        }
        data.tokenAmounts = {
            rewardTokenAmount: results[4][0] / (10 ** data.rewardToken.decimals),
            depositTokenAmount: results[4][1] / (10 ** data.depositToken.decimals),
            rewardTokenFeeAmount: results[4][2],
            depositTokenFlashloanFeeAmount: results[4][3]
        }
        data.isSale = !!results[5]
        data.userState = {
            rewardsClaimable: results[7] / (10 ** data.rewardToken.decimals),
            rewardsClaimed: results[12] / (10 ** data.rewardToken.decimals),
            rewards: results[7].add(results[12]) / (10 ** data.rewardToken.decimals),
            tokens: results[11] / (10 ** data.depositToken.decimals),
            netDeposits: results[8] / (10 ** data.depositToken.decimals)
        }
        data.depositTokenUnstreamed = results[10] / (10 ** data.depositToken.decimals)
        data.rewardTokenRemaining = results[9] / (10 ** data.rewardToken.decimals)
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

    async function getNetDeposits(user: string) {
        let contract = new Contract(address, streamABI, getProvider())
        let withdrawFilter = contract.filters.Withdrawn(user)
        let stakeFilter = contract.filters.Staked(user)
        let result = await Promise.all([
            contract.queryFilter(withdrawFilter),
            contract.queryFilter(stakeFilter)
        ])
        let withdraws = result[0].map((w) => w.args?.amount.mul(BigNumber.from(-1)))
        let stakes = result[1].map((s) => s.args?.amount)
        let events = withdraws.concat(stakes)
        return _.reduce(events, (sum, n) => sum.add(n), BigNumber.from(0))
    }

    async function getRewardsClaimed(user: string) {
        let contract = new Contract(address, streamABI, getProvider())
        let claimFilter = contract.filters.RewardsClaimed(user)
        let claimEvents = await contract.queryFilter(claimFilter)
        let claims = claimEvents.map((c) => c.args?.amount)
        let totalClaims = _.reduce(claims, (sum, n) => sum.add(n), BigNumber.from(0))
        return totalClaims
    }

    return {
        data,
        loaded,
        load,
    }
}