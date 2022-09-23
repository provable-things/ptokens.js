import { BlockchainType, pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensEosioAsset } from './ptokens-eosio-asset'
import { pTokensEosioProvider } from './ptokens-eosio-provider'

export class pTokensEosioAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensEosioProvider

  constructor(node: pTokensNode) {
    super(node, BlockchainType.EOSIO)
  }

  setProvider(provider: pTokensEosioProvider): this {
    this._provider = provider
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async _build(): Promise<pTokensEosioAsset> {
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
