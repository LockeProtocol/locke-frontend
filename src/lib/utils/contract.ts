import set from 'lodash/set';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';

const MULTICALL_ADDRESS: string = "0x0000000000000000000000000000000000000000"

export async function call(provider, abi: any[], call: any[], options?) {
  const contract = new Contract(call[0], abi, provider);
  try {
    const params = call[2] || [];
    return await contract[call[1]](...params, options || {});
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function multicall<T>(
  network: string,
  provider,
  abi: any[],
  calls: any[],
  options: any = {},
  requireSuccess = false
): Promise<(T | null)[]> {
  const multi = new Contract(
    MULTICALL_ADDRESS,
    [
      'function tryAggregate(bool requireSuccess, tuple(address, bytes)[] memory calls) public view returns (tuple(bool, bytes)[] memory returnData)'
    ],
    provider
  );
  const itf = new Interface(abi);
  try {
    const res: [boolean, string][] = await multi.tryAggregate(
      // if false, allows individual calls to fail without causing entire multicall to fail
      requireSuccess,
      calls.map(call => [
        call[0].toLowerCase(),
        itf.encodeFunctionData(call[1], call[2])
      ]),
      options
    );

    return res.map(([success, returnData], i) => {
      if (!success) return null;
      const decodedResult = itf.decodeFunctionResult(calls[i][1], returnData);
      // Automatically unwrap any simple return values
      return decodedResult.length > 1 ? decodedResult : decodedResult[0];
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

export class Multicaller {
  public network: string;
  public provider: JsonRpcProvider;
  public abi: any[];
  public options: any = {};
  public calls: any[] = [];
  public paths: any[] = [];

  constructor(
    network: string,
    provider: JsonRpcProvider,
    abi: any[],
    options?
  ) {
    this.network = network;
    this.provider = provider;
    this.abi = abi;
    this.options = options || {};
  }

  call(path, address, fn, params?): Multicaller {
    this.calls.push([address, fn, params]);
    this.paths.push(path);
    return this;
  }

  async execute(from?: any): Promise<any> {
    const obj = from || {};
    const result = await multicall(
      this.network,
      this.provider,
      this.abi,
      this.calls,
      this.options
    );
    result.forEach((r, i) => set(obj, this.paths[i], r));
    this.calls = [];
    this.paths = [];
    return obj;
  }
}
