import { MetamaskConnector } from './connectors/metamask/metamask.connector';
import { Connector } from './connectors/connector';
import { computed, reactive, ref, Ref, toRefs } from 'vue';
import { WalletConnectConnector } from './connectors/trustwallet/walletconnect.connector';
import { getAddress } from '@ethersproject/address';
import { lsGet, lsSet } from '@/lib/utils';
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Web3Provider
} from '@ethersproject/providers';
import { GnosisSafeConnector } from './connectors/gnosis/gnosis.connector';
// import i18n from '@/plugins/i18n';

export type Wallet =
  | 'metamask'
  | 'walletconnect'
  | 'gnosis'
export const SupportedWallets = [
  'metamask',
  'walletconnect',
  'gnosis',
] as Wallet[];
export const WalletNameMap: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'WalletConnect',
  gnosis: 'Gnosis Safe',
};
type ConnectorImplementation = new (...args: any[]) => Connector;
export const Web3ProviderSymbol = Symbol('WEB3_PROVIDER');

export type Web3Plugin = {
  connectWallet: (wallet: Wallet) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: Ref<Web3Provider | JsonRpcProvider>;
  account: Ref<string>;
  chainId: Ref<number>;
  connector: Ref<Connector>;
  walletState: Ref<WalletState>;
  signer: Ref<JsonRpcSigner>;
};

const WalletConnectorDictionary: Record<Wallet, ConnectorImplementation> = {
  metamask: MetamaskConnector,
  walletconnect: WalletConnectConnector,
  gnosis: GnosisSafeConnector,
};

type WalletState = 'connecting' | 'connected' | 'disconnected';
type PluginState = {
  connector: any;
  walletState: WalletState;
};

const i18n = {
  global: {
    t: function(s: string): string {
      return s
    }
  }
}

export default {
  install: async app => {
    const alreadyConnectedAccount = ref(lsGet('connectedWallet', null));
    const alreadyConnectedProvider = ref(lsGet('connectedProvider', null));
    // this data provided is properly typed to all consumers
    // via the 'Web3Provider' type
    const pluginState = reactive<PluginState>({
      connector: null as any,
      walletState: 'disconnected'
    });

    const account = computed(() => {
      if (pluginState.connector && pluginState.connector.account) {
        // always want to be using checksum addresses
        return getAddress(pluginState.connector.account);
      }
      return '';
    });

    const chainId = computed(() => {
      return pluginState.connector?.chainId;
    });

    const provider = computed(
      () =>
        pluginState.connector?.provider
    );
    const signer = computed(() => pluginState.connector?.provider?.getSigner());

    // user supplied web3 provider. i.e. (web3, ethers)
    const connectWallet = async (wallet: Wallet) => {
      pluginState.walletState = 'connecting';

      try {
        if (!wallet || typeof wallet !== 'string') {
          throw new Error(
            'Please provide a wallet to facilitate a web3 connection.'
          );
        }

        // the wallet parameter will be provided by the front-end by means of
        // modal selection or otherwise
        const connector = new WalletConnectorDictionary[wallet](
          alreadyConnectedAccount.value
        );
        if (!connector) {
          throw new Error(
            `Wallet [${wallet}] is not supported yet. Please contact the dev team to add this connector.`
          );
        }
        const { account } = await connector.connect();

        // listens to wallet/chain changed and disconnect events
        connector.registerListeners();

        // it is handy to provide the connector instance
        pluginState.connector = connector;

        // for when user reloads the app on an already connected wallet
        // need to store address to pre-load that connection
        if (account.value) {
          lsSet('connectedWallet', account.value);
          lsSet('connectedProvider', wallet);
          pluginState.walletState = 'connected';
        }
      } catch (err) {
        console.error(err);
        pluginState.walletState = 'disconnected';
      }
    };

    const disconnectWallet = async () => {
      if (!pluginState.connector) {
        throw new Error(
          'Cannot disconnect a wallet. No wallet currently connected.'
        );
      }
      const connector = pluginState.connector as Connector;
      connector.handleDisconnect();
      pluginState.connector = null;
      pluginState.walletState = 'disconnected';
      alreadyConnectedAccount.value = null;
      alreadyConnectedProvider.value = null;
    };

    // previously connected wallet initiation
    if (alreadyConnectedAccount.value && alreadyConnectedProvider.value) {
      connectWallet(alreadyConnectedProvider.value);
    }

    const payload: Web3Plugin = {
      connectWallet,
      disconnectWallet,
      ...toRefs(pluginState),
      account,
      chainId,
      provider,
      signer
    };

    app.provide(Web3ProviderSymbol, payload);
  }
};
