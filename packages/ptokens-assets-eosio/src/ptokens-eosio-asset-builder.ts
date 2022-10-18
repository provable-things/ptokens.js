import { BlockchainType } from 'ptokens-constants'
import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensEosioAsset } from './ptokens-eosio-asset'
import { pTokensEosioProvider } from './ptokens-eosio-provider'

export class pTokensEosioAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensEosioProvider

  constructor(_node: pTokensNode) {
    super(_node, BlockchainType.EOSIO)
  }

  /**
   * Set a pTokensEosioProvider for creating and sending transactions.
   * @param _provider A pTokensEosioProvider object.
   * @returns The same builder. This allows methods chaining.
   */
  setProvider(_provider: pTokensEosioProvider): this {
    this._provider = _provider
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensEosioAsset> {
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
