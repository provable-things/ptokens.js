import { pTokensSwap } from './ptokens-swap'
import { pTokensAsset } from 'ptokens-entities'

export class pTokensSwapBuilder {
  sourceAsset: pTokensAsset
  destinationAssets: Array<pTokensAsset>
  amount: number
  metadata: BinaryData

  setSourceAsset(asset: pTokensAsset) {
    this.sourceAsset = asset
    return this
  }

  setDestinationAssets(assets: Array<pTokensAsset>) {
    this.destinationAssets = assets
    return this
  }

  setAmount(amount: number) {
    this.amount = amount
    return this
  }

  setMetadata(metadata: BinaryData) {
    this.metadata = metadata
    return this
  }

  build(): pTokensSwap {
    return null
  }
}
