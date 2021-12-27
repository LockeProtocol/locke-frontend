import { ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import erc20 from '@/lib/abi/erc20-abi.json'
import { sleep } from '@/lib/utils'
import { constants } from 'ethers'

export default function useAllowance(token: string, owner: string, spender: string) {
    const { call, sendTransaction } = useWeb3()
    const balance = ref(0)
    const allowance = ref(0)
    const loaded = ref(false)

    async function load() {
        loaded.value = false

        await sleep(1000)

        let results = await Promise.all([
            call(erc20, [token, 'balanceOf', [owner]]),
            call(erc20, [token, 'allowance', [owner, spender]]),
        ])

        console.log(results)
        balance.value = results[0]
        allowance.value = results[1]
        loaded.value = true
    }

    async function approveUnlimited() {
        let tx = await sendTransaction(
            token,
            erc20,
            'approve',
            [spender, constants.MaxUint256]
        )
        let receipt = await tx.wait()
        await load()
    }

    async function revokeApproval() {
        let tx = await sendTransaction(
            token,
            erc20,
            'approve',
            [spender, 0]
        )
        let receipt = await tx.wait()
        await load()
    }

    return {
        balance,
        allowance,
        loaded,
        load,
        approveUnlimited,
        revokeApproval
    }
}