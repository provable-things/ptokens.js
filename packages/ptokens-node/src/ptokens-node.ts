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
  provider: pTokensNodeProvider

  constructor(provider: pTokensNodeProvider) {
    this.provider = provider
  }
  getProvider(): pTokensNodeProvider {
    return this.provider
  }

  async getTransactionStatus(txHash: string, originatingChainId: string): Promise<TransactionStatus> {
    return await this.provider.sendRpcRequest(1, 'node_getTransactionStatus', [txHash, originatingChainId])
  }

  async getSupportedChainsByAsset(tokenSymbol: string): Promise<AssetInfo[]> {
    return await this.provider.sendRpcRequest(1, 'node_getSupportedChainsByAsset', [tokenSymbol])
  }

  async getAssetInfoByChainId(tokenSymbol: string, chainId: string): Promise<AssetInfo> {
    const info = (await this.getSupportedChainsByAsset(tokenSymbol)).filter((p) => p.chainId == chainId)
    return info.length ? info.at(0) : null
  }

  async getNativeDepositAddress(
    originatingChainId: string,
    address: string,
    destinationChainId: string
  ): Promise<NativeDepositAddress> {
    return await this.provider.sendRpcRequest(1, 'node_getNativeDepositAddress', [
      originatingChainId,
      address,
      destinationChainId,
    ])
  }
}
