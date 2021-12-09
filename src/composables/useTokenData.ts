import { ref, reactive } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import erc20 from '@/lib/abi/erc20-abi.json'

export default function useTokenData() {

    const { call } = useWeb3()
    const data = reactive({
        balance: undefined,
        decimals: undefined,
        symbol: null,
        name: null
    })
    const loaded = ref(false)

    async function load(token: string) {
        loaded.value = false;
        if (!token) return;

        let results = await Promise.all([
            call(erc20, [token, 'decimals']),
            call(erc20, [token, 'symbol']),
            call(erc20, [token, 'name']),
        ])

        data.decimals = results[0],
        data.symbol = results[1],
        data.name = results[2]
        
        loaded.value = true
    }

    return {
        data,
        loaded,
        load
    }
}