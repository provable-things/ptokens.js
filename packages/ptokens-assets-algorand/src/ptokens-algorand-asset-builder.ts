import { BlockchainType, pTokensAssetBuilder } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensAlgorandAsset } from './ptokens-algorand-asset'
import { pTokensAlgorandProvider } from './ptokens-algorand-provider'
import algosdk from 'algosdk'

export class pTokensAlgorandAssetBuilder extends pTokensAssetBuilder {
  private _provider: pTokensAlgorandProvider
  private _customTransactions: algosdk.Transaction[]

  constructor(node: pTokensNode) {
    super(node, BlockchainType.ALGORAND)
  }

  setProvider(provider: pTokensAlgorandProvider) {
    this._provider = provider
    return this
  }

  setCustomTransactions(transactions: algosdk.Transaction[]) {
    if (transactions === undefined) throw new Error('Invalid undefined transactions')
    if (transactions.length === 0) throw new Error('Invalid empty transactions array')
    this._customTransactions = transactions
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensAlgorandAsset> {
    const config = {
      node: this._node,
      symbol: this._symbol,
      assetInfo: this._assetInfo,
      provider: this._provider,
      customTransactions: this._customTransactions,
      type: BlockchainType.ALGORAND,
    }
    return new pTokensAlgorandAsset(config)
  }
}
