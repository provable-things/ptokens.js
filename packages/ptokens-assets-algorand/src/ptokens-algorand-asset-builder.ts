import { BlockchainType } from 'ptokens-constants'
import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensAlgorandAsset } from './ptokens-algorand-asset'
import { pTokensAlgorandProvider } from './ptokens-algorand-provider'

export class pTokensAlgorandAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensAlgorandProvider

  /**
   * Create and initialize a pTokensAlgorandAssetBuilder object for building pTokensAlgorandAsset objects.
   * @param _node - A pNetworkNode necessary for pNetworkSwap.
   */
  constructor(_node: pTokensNode) {
    super(_node, BlockchainType.ALGORAND)
  }

  /**
   * Set a pTokensAlgorandProvider for creating and sending transactions.
   * @param _provider - A pTokensAlgorandProvider object.
   * @returns The same builder. This allows methods chaining.
   */
  setProvider(_provider: pTokensAlgorandProvider) {
    this._provider = _provider
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensAlgorandAsset> {
    const config = {
      node: this._node,
      symbol: this._symbol,
      assetInfo: this._assetInfo,
      provider: this._provider,
      type: BlockchainType.ALGORAND,
    }
    return new pTokensAlgorandAsset(config)
  }
}
