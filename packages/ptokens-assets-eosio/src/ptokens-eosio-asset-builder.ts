import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensEosioAsset } from './ptokens-eosio-asset'
import { pTokensEosioProvider } from './ptokens-eosio-provider'

export class pTokensEosioAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensEosioProvider

  constructor() {
    super()
  }

  setProvider(provider: pTokensEosioProvider): this {
    this.provider = provider
    return this
  }

  build(): pTokensEosioAsset {
    if (!this.chainId) throw new Error('Missing chain ID')
    if (!this.symbol) throw new Error('Missing symbol')
    const config = {
      symbol: this.symbol,
      chainId: this.chainId,
      blockchain: this.blockchain,
      network: this.network,
      provider: this.provider,
    }
    return new pTokensEosioAsset(config)
  }
}
