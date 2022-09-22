import { pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensEvmAsset } from './ptokens-evm-asset'
import { pTokensEvmProvider } from './ptokens-evm-provider'

export class pTokensEvmAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensEvmProvider

  constructor(node: pTokensNode) {
    super(node)
  }

  setProvider(provider: pTokensEvmProvider): this {
    this._provider = provider
    return this
  }

  async build(): Promise<pTokensEvmAsset> {
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
    return new pTokensEvmAsset(config)
  }
}
