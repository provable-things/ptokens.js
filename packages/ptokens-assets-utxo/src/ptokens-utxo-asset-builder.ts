import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensUtxoAsset } from './ptokens-utxo-asset'
import { pTokensUtxoProvider } from './ptokens-utxo-provider'
export class pTokensUtxoAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensUtxoProvider

  constructor() {
    super()
  }

  setProvider(provider: pTokensUtxoProvider): this {
    this.provider = provider
    return this
  }

  build(): pTokensUtxoAsset {
    if (!this.chainId) throw new Error('Missing chain ID')
    const config = {
      symbol: this.symbol,
      chainId: this.chainId,
      blockchain: this.blockchain,
      network: this.network,
      provider: this.provider,
    }
    return new pTokensUtxoAsset(config)
  }
}
