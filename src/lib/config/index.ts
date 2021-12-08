import homestead from './homestead.json';
import kovan from './kovan.json';
import rinkeby from './rinkeby.json';
import polygon from './polygon.json';
import arbitrum from './arbitrum.json';
import local from './local-testnet.json';
import { Network } from '@/composables/useNetwork';

export interface Config {
  key: string;
  chainId: Network | 12345 | 99;
  chainName: string;
  name: string;
  shortName: string;
  network: string;
  rpc: string;
  publicRpc?: string;
  ws: string;
  loggingRpc: string;
  explorer: string;
  explorerName: string;
  supportsEIP1559: boolean;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  keys: {
    infura: string;
    alchemy: string;
  };
}

const config: Record<Config['chainId'], Config> = {
  [Network.MAINNET]: homestead,
  [Network.KOVAN]: kovan,
  [Network.RINKEBY]: rinkeby,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  // @ts-ignore
  99: local
};

export default config;
