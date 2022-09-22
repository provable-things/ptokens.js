import { pTokensSwap, DestinationInfo } from './ptokens-swap'
import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'

export class pTokensSwapBuilder {
  private _sourceAsset: pTokensAsset
  private _destinationAssets: Array<DestinationInfo> = []
  private _amount: number
  private _node: pTokensNode

  constructor(node: pTokensNode) {
    this._node = node
  }

  public get sourceAsset(): pTokensAsset {
    return this._sourceAsset
  }

  public get destinationAssets(): Array<pTokensAsset> {
    return this._destinationAssets.map((_el) => _el.asset)
  }

  public get amount(): number {
    return this._amount
  }

  public get node(): pTokensNode {
    return this._node
  }

  setSourceAsset(asset: pTokensAsset) {
    this._sourceAsset = asset
    return this
  }

  addDestinationAsset(asset: pTokensAsset, destinationAddress: string, userData: BinaryData = undefined) {
    this._destinationAssets.push({ asset, destinationAddress, userData })
    return this
  }

  setAmount(amount: number) {
    this._amount = amount
    return this
  }

  build(): pTokensSwap {
    if (!this._amount) throw new Error('Missing amount')
    if (!this._sourceAsset) throw new Error('Missing source asset')
    if (this._destinationAssets.length === 0) throw new Error('Missing destination assets')
    if (
      !this.destinationAssets.every(
        (_asset) => _asset.assetInfo.tokenInternalAddress === this.sourceAsset.assetInfo.tokenInternalAddress
      )
    )
      throw new Error('Invalid swap')
    const ret = new pTokensSwap(this._node, this.sourceAsset, this._destinationAssets, this._amount)
    return ret
  }
}
