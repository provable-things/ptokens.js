import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensAlgorandAsset } from './ptokens-algorand-asset'
import { pTokensAlgorandProvider } from './ptokens-algorand-provider'

export class pTokensAlgorandAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensAlgorandProvider

  constructor() {
    super()
  }

  setProvider(provider: pTokensAlgorandProvider): this {
    this.provider = provider
    return this
  }

  build(): pTokensAlgorandAsset {
    if (!this.chainId) throw new Error('Missing chain ID')
    if (!this.symbol) throw new Error('Missing symbol')
    const config = {
      symbol: this.symbol,
      chainId: this.chainId,
      blockchain: this.blockchain,
      network: this.network,
      provider: this.provider,
    }
    return new pTokensAlgorandAsset(config)
  }
}
