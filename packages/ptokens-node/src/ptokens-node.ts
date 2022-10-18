import { pTokensNodeProvider } from './ptokens-node-provider'

export enum Status {
  ERROR = -1,
  BROADCASTED = 0,
  CONFIRMED = 1,
}

export type InnerTransactionStatus = {
  txHash: string
  status: Status
  chainId: string
}

export type TransactionStatus = {
  inputs: InnerTransactionStatus[]
  outputs: InnerTransactionStatus[]
}

export type AssetInfo = {
  chainId: string
  isNative: boolean
  tokenAddress: string
  tokenReference: string
  decimals?: number
  vaultAddress?: string
  identity?: string
}

export type NativeDepositAddress = {
  nonce: number
  nativeDepositAddress: string
  enclavePublicKey: string
}

export class pTokensNode {
  private _provider: pTokensNodeProvider

  constructor(_provider: pTokensNodeProvider) {
    this._provider = _provider
  }

  get provider(): pTokensNodeProvider {
    return this._provider
  }

  async getTransactionStatus(_txHash: string, _originatingChainId: string): Promise<TransactionStatus> {
    return await this.provider.sendRpcRequest(1, 'node_getTransactionStatus', [_txHash, _originatingChainId])
  }

  async getSupportedChainsByAsset(_tokenSymbol: string): Promise<AssetInfo[]> {
    return await this.provider.sendRpcRequest(1, 'node_getSupportedChainsByAsset', [_tokenSymbol])
  }

  async getAssetInfoByChainId(_tokenSymbol: string, _chainId: string): Promise<AssetInfo> {
    const info = (await this.getSupportedChainsByAsset(_tokenSymbol)).filter((p) => p.chainId == _chainId)
    return info.length ? info.at(0) : null
  }

  async getNativeDepositAddress(
    _originatingChainId: string,
    _address: string,
    _destinationChainId: string
  ): Promise<NativeDepositAddress> {
    return await this.provider.sendRpcRequest(1, 'node_getNativeDepositAddress', [
      _originatingChainId,
      _address,
      _destinationChainId,
    ])
  }
}
