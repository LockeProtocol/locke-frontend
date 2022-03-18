import { ref, computed } from 'vue'

export const currentNetwork = ref('42')
export const networks = {
    '42' : {
        chainId: 42,
        networkName: 'Kovan Testnet',
        factory: '0x7512d9365F9e55b6499070B899247C3b9BaDb426',
        lens: '0xD4AcE128264b70fe1804e372bBa3878664B1489B',
        walletConnectRPC: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        blockExplorerPrefix: 'https://kovan.etherscan.io'
    },
    '10243': {
        chainId: 10243,
        networkName: 'Locke Testnet',
        factory: '0x104C0f26f91Fa6758F4a64E8C64dd409a9ea4151',
        lens: '0xe2C5daaC7104dc097c1AE0dFE6A09Ff14efFd49A',
        walletConnectRPC: 'http://ec2-3-136-155-82.us-east-2.compute.amazonaws.com:8545',
        blockExplorerPrefix: 'https://etherscan.io'
    }
}
export const config = computed(() => networks[currentNetwork.value])