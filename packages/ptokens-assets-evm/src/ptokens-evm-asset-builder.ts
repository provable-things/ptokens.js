import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensEvmAsset } from './ptokens-evm-asset'
import { pTokensEvmProvider } from './ptokens-evm-provider'

export class pTokensEvmAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensEvmProvider

  constructor() {
    super()
  }

  setProvider(provider: pTokensEvmProvider): this {
    this.provider = provider
    return this
  }

  build(): pTokensEvmAsset {
    if (!this.chainId) throw new Error('Missing chain ID')
    const config = {
      symbol: this.symbol,
      chainId: this.chainId,
      blockchain: this.blockchain,
      network: this.network,
      provider: this.provider,
    }
    return new pTokensEvmAsset(config)
  }
}
