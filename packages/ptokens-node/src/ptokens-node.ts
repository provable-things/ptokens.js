import { pTokensNodeProvider } from './ptokens-node-provider'
export class pTokensNode {
  provider: pTokensNodeProvider

  constructor(provider: pTokensNodeProvider) {
    this.provider = provider
  }
  getProvider(): pTokensNodeProvider {
    return this.provider
  }

  getTransactionStatus(txHash: string, originatingChainId: string): Promise<unknown> {
    return this.provider.sendRpcRequest(1, 'app_getTransactionStatus', [txHash, originatingChainId])
  }

  async getAssetInfo(tokenSymbol: string): Promise<unknown> {
    return this.provider.sendRpcRequest(1, 'app_getAssetInfo', [tokenSymbol])
  }
}
