import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensEosioAsset } from './ptokens-eosio-asset'
import { pTokensEosioProvider } from './ptokens-eosio-provider'

export class pTokensEosioAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensEosioProvider

  constructor(node: pTokensNode) {
    super(node)
  }

  setProvider(provider: pTokensEosioProvider): this {
    this._provider = provider
    return this
  }

  async build(): Promise<pTokensEosioAsset> {
    await super.populateAssetInfo()
    const config = {
      node: this._node,
      symbol: this._symbol,
      chainId: this._chainId,
      blockchain: this._blockchain,
      network: this._network,
      assetInfo: this._assetInfo,
      provider: this._provider,
    }
    return new pTokensEosioAsset(config)
  }
}
