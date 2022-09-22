import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensUtxoAsset } from './ptokens-utxo-asset'
import { pTokensUtxoProvider } from './ptokens-utxo-provider'
export class pTokensUtxoAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensUtxoProvider

  constructor(node: pTokensNode) {
    super(node)
  }

  setProvider(provider: pTokensUtxoProvider): this {
    this.provider = provider
    return this
  }

  async build(): Promise<pTokensUtxoAsset> {
    await super.populateAssetInfo()
    const config = {
      node: this._node,
      symbol: this._symbol,
      chainId: this._chainId,
      blockchain: this._blockchain,
      network: this._network,
      provider: this.provider,
      assetInfo: this._assetInfo,
    }
    return new pTokensUtxoAsset(config)
  }
}
