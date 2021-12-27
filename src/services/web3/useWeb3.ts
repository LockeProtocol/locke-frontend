import { computed, inject, ref, watch } from 'vue';
import { Web3Plugin, Web3ProviderSymbol } from './web3.plugin';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers'

/** STATE */
const isWalletSelectVisible = ref(false);

export default function useWeb3() {
  const {
    account,
    chainId,
    connector,
    provider,
    walletState,
    signer,
    disconnectWallet,
    connectWallet
  } = inject(Web3ProviderSymbol) as Web3Plugin;

  // COMPUTED REFS + COMPUTED REFS
  const isWalletReady = computed(() => walletState.value === 'connected');

  // METHODS
  const getProvider = () => new Web3Provider(provider.value as any);
  const getSigner = () => getProvider().getSigner();
  const toggleWalletSelectModal = (value: boolean) => {
    if (value !== undefined && typeof value === 'boolean') {
      isWalletSelectVisible.value = value;
      return;
    }
    isWalletSelectVisible.value = !isWalletSelectVisible.value;
  };
  
  const call = async (abi: any[], call: any[], options?) => {
    const contract = new Contract(call[0], abi, getProvider());
    try {
      const params = call[2] || [];
      return await contract[call[1]](...params, options || {});
    } catch (e) {
      return Promise.reject(e);
    }
  }

  const sendTransaction = async (
    contractAddress: string,
    abi: any[],
    action: string,
    params: any[],
    overrides: Record<string, any> = {},
  ): Promise<TransactionResponse> => {

    console.log('Sending transaction');
    console.log('Contract', contractAddress);
    console.log('Action', `"${action}"`);
    console.log('Params', params);

    const GAS_LIMIT_BUFFER = 0.1
    const signer = getSigner();
    const contract = new Contract(contractAddress, abi, getProvider());
    const contractWithSigner = contract.connect(signer);
    const paramsOverrides = { ...overrides };
  
    try {
      // Gas estimation
      const gasLimitNumber = await contractWithSigner.estimateGas[action](
        ...params,
        paramsOverrides
      );
  
      const gasLimit = gasLimitNumber.toNumber();
      paramsOverrides.gasLimit = Math.floor(gasLimit * (1 + GAS_LIMIT_BUFFER));
  
      return await contractWithSigner[action](...params, paramsOverrides);
    } catch (e) {
      console.log(e)
      return Promise.reject(e);
    }
  }


  // WATCHERS
  watch(account, () => {
    // if the account ref has changed, we know that
    // the user has successfully connected a wallet
    toggleWalletSelectModal(false);
  });

  return {
    // refs
    account,
    chainId,
    connector,
    provider,
    walletState,
    isWalletReady,
    isWalletSelectVisible,
    signer,

    // methods
    connectWallet,
    getProvider,
    getSigner,
    disconnectWallet,
    toggleWalletSelectModal,
    call,
    sendTransaction
  };
}
