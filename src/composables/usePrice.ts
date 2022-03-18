import { ref } from 'vue'
import axios from 'axios'

export default function usePrice(address: string) {
    const loaded = ref(false)
    const priceUSD = ref(0)
    const url = 'https://api.coingecko.com/api/v3/coins/ethereum/contract/'

    const load = async () => {
        loaded.value = false
        try {
            let result = await axios.get(`${url}${address}`)
            priceUSD.value = result?.data?.market_data?.current_price?.usd ?? 0
            console.log(priceUSD)
        } catch (e) {
            //console.log(e)
        }
        
    }

    return {
        loaded,
        priceUSD,
        load
    }
}