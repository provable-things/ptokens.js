import { pTokensNodeProvider } from './ptokens-node-provider'

export enum Status {
  ERROR = -1,
  BROADCASTED = 0,
  CONFIRMED = 1,
}

export type InnerTransactionStatus = {
  tx_hash: string
  status: Status
  chain_id: string
}

export type TransactionStatus = {
  inputs: InnerTransactionStatus[]
  outputs: InnerTransactionStatus[]
}

export type SupportingChainInfo = {
  chainId: string
  isNative: boolean
  isSystemToken: boolean
  tokenAddress: string
  vaultAddress?: string
  hostIdentity?: string
  nativeIdentity?: string
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

  async getAssetInfo(tokenSymbol: string): Promise<SupportingChainInfo[]> {
    return await this.provider.sendRpcRequest(1, 'node_getAssetInfo', [tokenSymbol])
  }

  async getAssetInfoByChainId(tokenSymbol: string, chainId: string): Promise<SupportingChainInfo> {
    const info = (await this.getAssetInfo(tokenSymbol)).filter((p) => p.chainId == chainId)
    return info.length ? info[0] : null
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
