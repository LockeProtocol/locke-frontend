import { reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import erc20 from '@/lib/abi/erc20-abi.json'

export default function useTokenData(token: string) {

    const { account, call } = useWeb3()
    const state = reactive({
        loaded: false,
        decimals: undefined,
        symbol: null,
        balance: undefined,
        name: null,
    })

    async function fetchData() {
        state.loaded = false;

        let results = await Promise.all([
            call(erc20, [token, 'balanceOf', [account.value]]),
            call(erc20, [token, 'decimals']),
            call(erc20, [token, 'symbol']),
            call(erc20, [token, 'name']),
        ])
        state.balance = results[0]
        state.decimals = results[1]
        state.symbol = results[2] 
        state.name = results[3]
        state.loaded = true
    }

    fetchData()
    return state;
}