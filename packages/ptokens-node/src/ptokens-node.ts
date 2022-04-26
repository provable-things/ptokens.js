import { pTokensNodeProvider } from './ptokens-node-provider'

export type TransactionStatus = {
  inputs: any[]
  outputs: any[]
}

export type SupportingChainInfo = {
  chainId: string
  isNative: boolean
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

  async getAssetInfo(tokenSymbol: string): Promise<SupportingChainInfo[]> {
    return this.provider.sendRpcRequest(1, 'app_getAssetInfo', [tokenSymbol])
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
