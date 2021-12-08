import { Connector } from '../connector';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { MetamaskError } from '@/types';

const NETWORK_ID = 1;
const RPC_URL = "";

export class WalletConnectConnector extends Connector {
  id = 'walletconnect';
  async connect() {
    const provider = new WalletConnectProvider({
      rpc: {
        [NETWORK_ID]: RPC_URL
      }
    });
    this.provider = provider;

    try {
      const accounts = await provider.enable();

      const chainId = await provider.request({ method: 'eth_chainId' });
      this.handleChainChanged(chainId);
      this.handleAccountsChanged(accounts);
    } catch (err) {
      if ((err as MetamaskError).code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to WalletConnect.');
      } else {
        console.error(err);
      }
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId
    };
  }
}
