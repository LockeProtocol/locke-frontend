import { ref } from 'vue'
import useWeb3 from '@/services/web3/useWeb3'
import erc20 from '@/lib/abi/erc20-abi.json'
import { constants } from 'ethers'

export default function useAllowance(token: string, spender: string) {
    const { call, sendTransaction, account } = useWeb3()
    const balance = ref(0)
    const allowance = ref(0)
    const loaded = ref(false)
    const approving = ref(false)

    async function load() {
        let owner = account.value
        if (!owner) {
            return
        }
        let results = await Promise.all([
            call(erc20, [token, 'balanceOf', [owner]]),
            call(erc20, [token, 'allowance', [owner, spender]]),
        ])

        balance.value = results[0]
        allowance.value = results[1]
        loaded.value = true
    }

    async function approveUnlimited() {
        approving.value = true
        try {
            let tx = await sendTransaction(
                token,
                erc20,
                'approve',
                [spender, constants.MaxUint256]
            )
            let receipt = await tx.wait()
            await load()
        } finally {
            approving.value = false
        } 
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
        approving,
        load,
        approveUnlimited,
        revokeApproval
    }
}