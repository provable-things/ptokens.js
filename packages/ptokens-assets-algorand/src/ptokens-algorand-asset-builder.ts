import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensAlgorandAsset } from './ptokens-algorand-asset'
import { pTokensAlgorandProvider } from './ptokens-algorand-provider'

export class pTokensAlgorandAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensAlgorandProvider

  constructor(node: pTokensNode) {
    super(node)
  }

  setProvider(provider: pTokensAlgorandProvider): this {
    this.provider = provider
    return this
  }

  async build(): Promise<pTokensAlgorandAsset> {
    await super.populateAssetInfo()
    const config = {
      node: this._node,
      symbol: this._symbol,
      chainId: this._chainId,
      blockchain: this._blockchain,
      network: this._network,
      assetInfo: this._assetInfo,
      provider: this.provider,
    }
    return new pTokensAlgorandAsset(config)
  }
}
