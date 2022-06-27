import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensUtxoAsset } from './ptokens-utxo-asset'

export class pTokensUtxoAssetBuilder extends pTokensAssetBuilder {
  constructor() {
    super()
  }

  build(): pTokensUtxoAsset {
    if (!this.chainId) throw new Error('Missing chain ID')
    const config = { symbol: this.symbol, chainId: this.chainId, blockchain: this.blockchain, network: this.network }
    return new pTokensUtxoAsset(config)
  }
}
