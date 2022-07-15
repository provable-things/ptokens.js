import { pTokensNodeProvider } from './ptokens-node-provider'

export enum Status {
  ERROR,
  BROADCASTED,
  CONFIRMED,
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
    return this.provider.sendRpcRequest(1, 'app_getTransactionStatus', [txHash, originatingChainId])
  }

  async getAssetInfo(tokenSymbol: string): Promise<SupportingChainInfo[]>
  async getAssetInfo(tokenSymbol: string, chainId: string): Promise<SupportingChainInfo>
  async getAssetInfo(tokenSymbol: string, chainId?: string): Promise<SupportingChainInfo | SupportingChainInfo[]> {
    const info: SupportingChainInfo[] = await this.provider.sendRpcRequest(1, 'app_getAssetInfo', [tokenSymbol])
    return chainId ? info.filter((p) => p.chainId == chainId).at(0) : info
  }

  async getNativeDepositAddress(
    originatingChainId: string,
    address: string,
    destinationChainId: string
  ): Promise<NativeDepositAddress> {
    return this.provider.sendRpcRequest(1, 'app_getNativeDepositAddress', [
      originatingChainId,
      address,
      destinationChainId,
    ])
  }
}
