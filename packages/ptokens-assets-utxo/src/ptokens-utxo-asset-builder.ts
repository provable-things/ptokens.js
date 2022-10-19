import { BlockchainType } from 'ptokens-constants'
import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensUtxoAsset } from './ptokens-utxo-asset'
import { pTokensUtxoProvider } from './ptokens-utxo-provider'
export class pTokensUtxoAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensUtxoProvider

  constructor(_node: pTokensNode) {
    super(_node, BlockchainType.UTXO)
  }

  /**
   * Set a pTokensUtxoProvider for creating and sending transactions.
   * @param _provider - A pTokensUtxoProvider object.
   * @returns The same builder. This allows methods chaining.
   */
  setProvider(_provider: pTokensUtxoProvider): this {
    this._provider = _provider
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensUtxoAsset> {
    const config = {
      node: this._node,
      symbol: this._symbol,
      provider: this._provider,
      assetInfo: this._assetInfo,
      type: BlockchainType.UTXO,
    }
    return new pTokensUtxoAsset(config)
  }
}
