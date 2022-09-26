import { BlockchainType, pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensUtxoAsset } from './ptokens-utxo-asset'
import { pTokensUtxoProvider } from './ptokens-utxo-provider'
export class pTokensUtxoAssetBuilder extends pTokensAssetBuilder {
  private provider: pTokensUtxoProvider

  constructor(node: pTokensNode) {
    super(node, BlockchainType.UTXO)
  }

  setProvider(provider: pTokensUtxoProvider): this {
    this.provider = provider
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensUtxoAsset> {
    const config = {
      node: this._node,
      symbol: this._symbol,
      provider: this.provider,
      assetInfo: this._assetInfo,
      type: BlockchainType.UTXO,
    }
    return new pTokensUtxoAsset(config)
  }
}
