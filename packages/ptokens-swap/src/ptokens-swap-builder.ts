import { pTokensSwap } from './ptokens-swap'
import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
export class pTokensSwapBuilder {
  sourceAsset: pTokensAsset
  destinationAssets: Array<pTokensAsset> = []
  amount: number
  metadata: BinaryData
  node: pTokensNode

  constructor(node: pTokensNode) {
    this.node = node
  }

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
    if (!this.amount) throw new Error('Missing amount')
    if (!this.sourceAsset) throw new Error('Missing source asset')
    if (this.destinationAssets.length === 0) throw new Error('Missing destination assets')
    if (this.destinationAssets.some((el) => el.destinationAddress === undefined))
      throw new Error('Missing destination address')
    const ret = new pTokensSwap(this.node, this.sourceAsset, this.destinationAssets, this.amount, this.metadata)
    return ret
  }
}
